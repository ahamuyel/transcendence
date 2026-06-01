import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createAttendanceSchema } from "@/lib/validations/academic"
import { buildOrderBy } from "@/lib/query-helpers"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { logAudit, auditUser } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const classId = searchParams.get("classId") || ""
    const date = searchParams.get("date") || ""
    const studentId = searchParams.get("studentId") || ""
    const lessonId = searchParams.get("lessonId") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      ...(classId ? { classId } : {}),
      ...(studentId ? { studentId } : {}),
      ...(lessonId ? { lessonId } : {}),
      ...(date ? { date: new Date(date) } : {}),
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Student: own records only
    if (role === "student") {
      const student = await prisma.student.findFirst({ where: { userId, schoolId }, select: { id: true } })
      if (student) where.studentId = student.id
    }

    // Parent: children's records
    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      if (parent) where.studentId = { in: parent.students.map((s) => s.id) }
    }

    const status = searchParams.get("status") || ""
    if (status) where.status = status

    const orderBy = buildOrderBy(searchParams, ["date", "status"], { date: "desc" })

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          student: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          lesson: { select: { id: true, subject: { select: { name: true } }, startTime: true, endTime: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createAttendanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { date, classId, lessonId, records } = parsed.data
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, body.academicYearId)

    const created = await prisma.attendance.createMany({
      data: records.map((r) => ({
        date: new Date(date),
        classId,
        lessonId: lessonId || null,
        studentId: r.studentId,
        status: r.status,
        academicYearId: academicYearId || null,
        schoolId,
      })),
      skipDuplicates: true,
    })

    logAudit({ ...auditUser(session!), action: "CREATE", entity: "Attendance", schoolId, description: `Presença registada para ${records.length} aluno(s) na turma ${classId}` })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
