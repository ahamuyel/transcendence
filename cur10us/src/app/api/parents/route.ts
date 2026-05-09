import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createParentSchema } from "@/lib/validations/entities"
import { sendTempCredentials } from "@/lib/email"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageParents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = {
      schoolId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          students: { select: { id: true, name: true } },
          user: { select: { id: true, isActive: true } },
        },
      }),
      prisma.parent.count({ where }),
    ])

    const mapped = data.map((p) => ({
      ...p,
      hasAccount: !!p.userId,
      userActive: p.user?.isActive ?? null,
    }))

    return NextResponse.json({ data: mapped, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageParents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createParentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { studentIds, createAccount, ...data } = parsed.data

    // Validate studentIds belong to the same school
    if (studentIds?.length) {
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, schoolId: true },
      })
      const invalidStudents = students.filter((s) => s.schoolId !== schoolId)
      if (invalidStudents.length > 0 || students.length !== studentIds.length) {
        return NextResponse.json({ error: "Um ou mais alunos não pertencem a esta escola" }, { status: 400 })
      }
    }

    const existing = await prisma.parent.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 })
    }

    let userId: string | undefined
    let tempPassword: string | undefined

    if (createAccount) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
      if (existingUser) {
        return NextResponse.json({ error: "Este e-mail já tem uma conta de utilizador" }, { status: 409 })
      }
      tempPassword = randomBytes(6).toString("base64url")
      const hashedPassword = await hashPassword(tempPassword)
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          hashedPassword,
          role: "parent",
          isActive: true,
          emailVerified: true,
          mustChangePassword: true,
          schoolId,
        },
      })
      userId = user.id
    }

    const parent = await prisma.parent.create({
      data: {
        ...data,
        schoolId,
        ...(userId && { userId }),
        ...(studentIds?.length && {
          students: { connect: studentIds.map((id) => ({ id })) },
        }),
      },
      include: { students: { select: { id: true, name: true } } },
    })

    if (createAccount && tempPassword) {
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } })
      sendTempCredentials(data.email, data.name, school?.name || "", tempPassword).catch((e) => console.error("[Email Error]", e))
    }

    return NextResponse.json(parent, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
