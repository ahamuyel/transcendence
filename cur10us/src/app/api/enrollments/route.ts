import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      "canManageStudents",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const academicYearId = searchParams.get("academicYearId") || ""
    const classId = searchParams.get("classId") || ""

    const where = {
      schoolId,
      ...(status ? { status: status as "ativa" | "transferida" | "cancelada" | "concluida" | "aprovada" | "reprovada" | "em_recurso" } : {}),
      ...(academicYearId ? { academicYearId } : {}),
      ...(classId ? { classId } : {}),
      ...(search
        ? {
            student: {
              name: { contains: search, mode: "insensitive" as const },
            },
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
          class: { select: { id: true, name: true, grade: true } },
          academicYear: { select: { id: true, name: true } },
        },
        orderBy: { enrolledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageStudents",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { studentId, classId, academicYearId } = body

    if (!studentId || !classId || !academicYearId) {
      return NextResponse.json({ error: "studentId, classId e academicYearId são obrigatórios" }, { status: 400 })
    }

    // Validate all referenced entities belong to the same school
    const [student, classRecord, academicYear] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, select: { schoolId: true } }),
      prisma.class.findUnique({ where: { id: classId }, select: { schoolId: true } }),
      prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { schoolId: true, status: true } }),
    ])

    if (!student || student.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado nesta escola" }, { status: 400 })
    }
    if (!classRecord || classRecord.schoolId !== schoolId) {
      return NextResponse.json({ error: "Turma não encontrada nesta escola" }, { status: 400 })
    }
    if (!academicYear || academicYear.schoolId !== schoolId) {
      return NextResponse.json({ error: "Ano letivo não encontrado nesta escola" }, { status: 400 })
    }
    if (academicYear.status === "encerrado") {
      return NextResponse.json({ error: "Não é possível matricular num ano letivo encerrado" }, { status: 400 })
    }

    const existing = await prisma.enrollment.findFirst({
      where: { studentId, academicYearId },
    })
    if (existing) {
      return NextResponse.json({ error: "Aluno já matriculado neste ano letivo" }, { status: 409 })
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, classId, academicYearId, schoolId, status: "ativa" },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
