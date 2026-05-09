import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateTeacherSchema } from "@/lib/validations/entities"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        teacherSubjects: { include: { subject: true } },
        teacherClasses: { include: { class: true } },
      },
    })

    if (!teacher || teacher.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    // Teachers can only view their own profile
    if (session!.user.role === "teacher" && teacher.userId !== session!.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    return NextResponse.json({
      ...teacher,
      subjects: teacher.teacherSubjects.map((ts) => ts.subject.name),
      subjectIds: teacher.teacherSubjects.map((ts) => ts.subjectId),
      classes: teacher.teacherClasses.map((tc) => tc.class.name),
      classIds: teacher.teacherClasses.map((tc) => tc.classId),
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageTeachers", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.teacher.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateTeacherSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { subjectIds, classIds, ...teacherData } = parsed.data

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...teacherData,
        ...(subjectIds !== undefined
          ? {
              teacherSubjects: {
                deleteMany: {},
                create: subjectIds.map((subjectId) => ({ subjectId })),
              },
            }
          : {}),
        ...(classIds !== undefined
          ? {
              teacherClasses: {
                deleteMany: {},
                create: classIds.map((classId) => ({ classId })),
              },
            }
          : {}),
      },
    })
    return NextResponse.json(teacher)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageTeachers", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.teacher.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    await prisma.teacher.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
