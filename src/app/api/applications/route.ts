import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { createApplicationSchema } from "@/lib/validations/application"
import { sendApplicationConfirmation } from "@/lib/email"

// POST — public (anyone can apply)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createApplicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Verify school exists and is active
    const school = await prisma.school.findUnique({ where: { id: parsed.data.schoolId } })
    if (!school || school.status !== "ativa") {
      return NextResponse.json({ error: "Escola não encontrada ou não está ativa" }, { status: 400 })
    }

    // Check for duplicate pending application
    const existing = await prisma.application.findFirst({
      where: {
        email: parsed.data.email,
        schoolId: parsed.data.schoolId,
        status: { in: ["pendente", "em_analise", "aprovada"] },
      },
    })
    if (existing) {
      return NextResponse.json({ error: "Já existe uma solicitação pendente para este e-mail nesta escola" }, { status: 409 })
    }

    const { dateOfBirth, documentType, documentNumber, desiredCourseId, gender, ...rest } = parsed.data
    const application = await prisma.application.create({
      data: {
        ...rest,
        gender: gender || undefined,
        documentType: documentType || undefined,
        documentNumber: documentNumber || undefined,
        desiredCourseId: desiredCourseId || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    })

    try {
      await sendApplicationConfirmation(application.email, application.name, application.trackingToken)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json(
      { trackingToken: application.trackingToken },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// GET — school_admin (list applications for their school)
export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageApplications", { requireSchool: true })
    if (authError) return authError

    const schoolId = session!.user.schoolId!
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where = {
      schoolId,
      ...(status ? { status: status as never } : {}),
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
      prisma.application.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
