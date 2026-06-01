import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createExamSchema } from "@/lib/validations/academic"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageExams", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = {
      schoolId,
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
        },
      }),
      prisma.exam.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageExams", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createExamSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { title, date, subjectId, classId, teacherId } = parsed.data
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, body.academicYearId)

    const exam = await prisma.exam.create({
      data: {
        title: title || null,
        date: new Date(date),
        subjectId,
        classId,
        teacherId,
        academicYearId: academicYearId || null,
        schoolId,
      },
    })
    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
