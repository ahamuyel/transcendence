import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateStudentSchema } from "@/lib/validations/entities"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, grade: true } },
        parents: { select: { id: true, name: true } },
      },
    })

    if (!student || student.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    const role = session!.user.role
    const userId = session!.user.id

    // Role-based access: students can only view their own profile
    if (role === "student" && student.userId !== userId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Parents can only view their own children
    if (role === "parent") {
      const parent = await prisma.parent.findFirst({ where: { userId, schoolId }, select: { id: true } })
      if (!parent || !student.parents.some((p) => p.id === parent.id)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    // Teachers can only view students from their classes
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({ where: { userId, schoolId }, select: { teacherClasses: { select: { classId: true } } } })
      const teacherClassIds = teacher?.teacherClasses.map((tc) => tc.classId) || []
      if (!student.classId || !teacherClassIds.includes(student.classId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageStudents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.student.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateStudentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { dateOfBirth: dobStr, ...rest } = parsed.data
    const updateData = { ...rest, ...(dobStr !== undefined ? { dateOfBirth: new Date(dobStr) } : {}) }
    const student = await prisma.student.update({ where: { id }, data: updateData })
    return NextResponse.json(student)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageStudents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.student.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    await prisma.student.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
