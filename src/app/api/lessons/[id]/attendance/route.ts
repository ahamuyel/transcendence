import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createLessonAttendanceSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({ where: { id } })
    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    const data = await prisma.attendance.findMany({
      where: { lessonId: id, schoolId },
      include: {
        student: { select: { id: true, name: true } },
      },
      orderBy: { student: { name: "asc" } },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({ where: { id } })
    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = createLessonAttendanceSchema.safeParse({ ...body, lessonId: id, classId: lesson.classId })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { date, classId, records } = parsed.data

    // Upsert each record
    const results = await Promise.all(
      records.map((r) =>
        prisma.attendance.upsert({
          where: {
            studentId_date_classId_lessonId: {
              studentId: r.studentId,
              date: new Date(date),
              classId,
              lessonId: id,
            },
          },
          create: {
            date: new Date(date),
            classId,
            lessonId: id,
            studentId: r.studentId,
            status: r.status,
            schoolId,
          },
          update: { status: r.status },
        })
      )
    )

    return NextResponse.json({ count: results.length }, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
