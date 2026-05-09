import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createAssignmentSchema } from "@/lib/validations/academic"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { buildOrderBy } from "@/lib/query-helpers"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const classId = searchParams.get("classId") || ""
    const subjectId = searchParams.get("subjectId") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      ...(classId ? { classId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    }

    // Student: filter by own class
    if (role === "student") {
      const student = await prisma.student.findFirst({ where: { userId, schoolId }, select: { id: true, classId: true } })
      if (student?.classId) where.classId = student.classId
    }

    // Teacher: filter own assignments
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({ where: { userId, schoolId }, select: { id: true } })
      if (teacher) where.teacherId = teacher.id
    }

    const orderBy = buildOrderBy(searchParams, ["dueDate", "title", "createdAt"], { dueDate: "desc" })

    const [data, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
          ...(role === "student" ? {
            submissions: {
              where: { student: { userId } },
              select: { id: true, status: true, score: true, submittedAt: true },
              take: 1,
            },
          } : {}),
        },
      }),
      prisma.assignment.count({ where }),
    ])

    const enriched = data.map((a) => {
      const now = new Date()
      const isPastDue = new Date(a.dueDate) < now
      return {
        ...a,
        submissionCount: a._count.submissions,
        mySubmission: (a as unknown as { submissions?: unknown[] }).submissions?.[0] || null,
        isPastDue,
        _count: undefined,
      }
    })

    return NextResponse.json({ data: enriched, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createAssignmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { title, dueDate, description, maxScore, subjectId, classId, teacherId } = parsed.data
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, body.academicYearId)

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        maxScore: maxScore || 20,
        subjectId,
        classId,
        teacherId,
        academicYearId: academicYearId || null,
        schoolId,
      },
    })
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
