import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createAcademicYearSchema } from "@/lib/validations/catalog"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const data = await prisma.academicYear.findMany({
      where: {
        schoolId,
        ...(status ? { status: status as "aberto" | "em_encerramento" | "encerrado" } : {}),
      },
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { enrollments: true, classes: true } },
      },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createAcademicYearSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const existing = await prisma.academicYear.findFirst({
      where: { name: parsed.data.name, schoolId },
    })
    if (existing) {
      return NextResponse.json({ error: "Ano letivo com este nome já existe" }, { status: 409 })
    }

    const year = await prisma.academicYear.create({
      data: {
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        schoolId,
        status: "aberto",
      },
    })

    return NextResponse.json(year, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
