import { NextResponse } from "next/server"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { parseFile, normalizeHeaders, validateRows, generateTempPassword, parseDateValue } from "@/lib/import-utils"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { Prisma } from "@prisma/client"
import type { Role } from "@prisma/client"

function friendlyPrismaError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[]) || []
      if (fields.includes("email")) return "E-mail já existe na base de dados"
      return `Registo duplicado (${fields.join(", ")})`
    }
    if (err.code === "P2003") return "Referência inválida (ex.: turma inexistente)"
    if (err.code === "P2025") return "Registo relacionado não encontrado"
  }
  if (err instanceof Error) {
    if (err.message.includes("DateTime") || err.message.includes("Could not convert"))
      return "Data de nascimento inválida — verifique o formato (DD/MM/AAAA)"
    return err.message
  }
  return "Erro ao criar utilizador"
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const formData = await req.formData()
    const file = formData.get("file") as File
    const userType = formData.get("userType") as string

    if (!file || !["student", "teacher", "parent"].includes(userType)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 5MB)" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { headers, rows } = parseFile(buffer, file.name)

    if (rows.length > 500) {
      return NextResponse.json({ error: "Máximo de 500 linhas" }, { status: 400 })
    }

    const headerMap = normalizeHeaders(headers)
    const validated = validateRows(rows, headerMap, headers)

    // Check existing emails in User table
    const validRows = validated.filter((r) => r.valid)
    const emails = validRows.map((r) => r.data.email.toLowerCase())

    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true, role: true },
    })
    const existingUserMap = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u]))

    // Check for orphaned users (User exists but no role-specific record)
    const roleTable = userType === "student" ? "student" : userType === "teacher" ? "teacher" : "parent"
    const orphanedUserIds = existingUsers.map((u) => u.id)
    let orphanedSet = new Set<string>()

    if (orphanedUserIds.length > 0) {
      const linkedRecords = await (prisma[roleTable] as any).findMany({
        where: { userId: { in: orphanedUserIds } },
        select: { userId: true },
      })
      const linkedUserIds = new Set(linkedRecords.map((r: { userId: string }) => r.userId))
      orphanedSet = new Set(
        existingUsers
          .filter((u) => !linkedUserIds.has(u.id))
          .map((u) => u.email.toLowerCase())
      )
    }

    // Check existing emails in role-specific table too
    const existingRoleRecords = await (prisma[roleTable] as any).findMany({
      where: { email: { in: emails } },
      select: { email: true },
    })
    const existingRoleEmailSet = new Set(
      existingRoleRecords.map((r: { email: string }) => r.email.toLowerCase())
    )

    // Get class map if student
    let classMap: Record<string, string> = {}
    if (userType === "student") {
      const classes = await prisma.class.findMany({
        where: { schoolId },
        select: { id: true, name: true },
      })
      classMap = Object.fromEntries(classes.map((c) => [c.name, c.id]))
    }

    // Create import job
    const job = await prisma.importJob.create({
      data: {
        filename: file.name,
        userType: userType as Role,
        status: "processando",
        totalRows: rows.length,
        importedById: userId,
        schoolId,
      },
    })

    const successes: { email: string; password: string; name: string }[] = []
    const failures: { rowNumber: number; email: string; errors: string[] }[] = []
    const processedEmails = new Set<string>()

    for (const row of validated) {
      if (!row.valid) {
        failures.push({ rowNumber: row.rowNumber, email: row.data.email || "", errors: row.errors })
        continue
      }

      const emailLower = row.data.email.toLowerCase()

      // Skip duplicates within the same file
      if (processedEmails.has(emailLower)) {
        failures.push({ rowNumber: row.rowNumber, email: row.data.email, errors: ["E-mail duplicado no ficheiro"] })
        continue
      }
      processedEmails.add(emailLower)

      // Check if email already has a complete record (User + role)
      if (existingRoleEmailSet.has(emailLower) && existingUserMap.has(emailLower)) {
        failures.push({ rowNumber: row.rowNumber, email: row.data.email, errors: ["E-mail já registado com conta completa"] })
        continue
      }

      try {
        const tempPass = generateTempPassword()
        const hashedPassword = await hashPassword(tempPass)
        const phone = row.data.telefone || undefined
        const address = row.data.endereco || undefined

        // Use a transaction to ensure User + role record are created atomically
        await prisma.$transaction(async (tx) => {
          let userRecord: { id: string }

          // Reuse orphaned User record or create new one
          if (orphanedSet.has(emailLower)) {
            const existing = existingUserMap.get(emailLower)!
            await tx.user.update({
              where: { id: existing.id },
              data: {
                name: row.data.nome,
                hashedPassword,
                role: userType as Role,
                isActive: true,
                mustChangePassword: true,
                profileComplete: true,
                schoolId,
              },
            })
            userRecord = existing
          } else {
            userRecord = await tx.user.create({
              data: {
                name: row.data.nome,
                email: emailLower,
                hashedPassword,
                role: userType as Role,
                isActive: true,
                emailVerified: true,
                mustChangePassword: true,
                profileComplete: true,
                provider: "credentials",
                schoolId,
              },
            })
          }

          // Create role-specific record in the same transaction
          if (userType === "student") {
            await tx.student.create({
              data: {
                name: row.data.nome,
                email: emailLower,
                phone,
                address,
                gender: (row.data.genero as "masculino" | "feminino") || undefined,
                dateOfBirth: row.data.dataNascimento ? new Date(row.data.dataNascimento) : undefined, // Already parsed by validateRows via parseDateValue
                documentType: row.data.tipoDocumento || undefined,
                documentNumber: row.data.numeroDocumento || undefined,
                classId: row.data.turma ? classMap[row.data.turma] : undefined,
                userId: userRecord.id,
                schoolId,
              },
            })
          } else if (userType === "teacher") {
            await tx.teacher.create({
              data: {
                name: row.data.nome,
                email: emailLower,
                phone,
                address,
                userId: userRecord.id,
                schoolId,
              },
            })
          } else if (userType === "parent") {
            await tx.parent.create({
              data: {
                name: row.data.nome,
                email: emailLower,
                phone,
                address,
                userId: userRecord.id,
                schoolId,
              },
            })
          }
        })

        successes.push({ email: row.data.email, password: tempPass, name: row.data.nome })
      } catch (err) {
        failures.push({
          rowNumber: row.rowNumber,
          email: row.data.email,
          errors: [friendlyPrismaError(err)],
        })
      }
    }

    // Update job with results
    const validCount = validRows.length
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: successes.length === 0 ? "falhada" : failures.length === 0 ? "concluida" : "parcial",
        successCount: successes.length,
        failedCount: failures.length,
        errors: failures.length > 0 ? failures : undefined,
        report: successes.length > 0 ? successes : undefined,
      },
    })

    return NextResponse.json({
      jobId: job.id,
      totalRows: rows.length,
      validCount,
      successCount: successes.length,
      failedCount: failures.length,
      successes,
      failures,
    })
  } catch (error) {
    console.error("Erro na importação:", error)
    const message = error instanceof Error ? error.message : "Erro interno do servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
