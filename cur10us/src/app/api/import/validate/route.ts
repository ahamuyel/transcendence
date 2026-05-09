import { NextResponse } from "next/server"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { parseFile, normalizeHeaders, validateRows } from "@/lib/import-utils"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const formData = await req.formData()
    const file = formData.get("file") as File
    const userType = formData.get("userType") as string

    if (!file || !["student", "teacher", "parent"].includes(userType)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { headers, rows } = parseFile(buffer, file.name)

    if (rows.length > 500) {
      return NextResponse.json({ error: "Máximo de 500 linhas por importação" }, { status: 400 })
    }

    const headerMap = normalizeHeaders(headers)
    const validated = validateRows(rows, headerMap, headers)

    const emails = validated
      .filter((r) => r.valid && r.data.email?.trim())
      .map((r) => r.data.email!.toLowerCase().trim())

    const emailCount = emails.reduce<Record<string, number>>((acc, e) => {
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {})
    const duplicateEmails = new Set(Object.keys(emailCount).filter((e) => emailCount[e] > 1))

    const existing = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    })
    const existingSet = new Set(existing.map((u) => u.email.toLowerCase()))

    for (const row of validated) {
      if (!row.data.email?.trim()) continue

      const emailLower = row.data.email.toLowerCase().trim()

      if (duplicateEmails.has(emailLower)) {
        row.valid = false
        row.errors.push("E-mail duplicado no ficheiro")
      }

      if (existingSet.has(emailLower)) {
        row.valid = false
        row.errors.push("E-mail já registado no sistema")
      }
    }

    return NextResponse.json({
      headers,
      rows: validated,
      totalRows: rows.length,
      validCount: validated.filter((r) => r.valid).length,
      invalidCount: validated.filter((r) => !r.valid).length,
      hasErrors: validated.some((r) => !r.valid),
    })
  } catch (error) {
    console.error("Erro na validação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
