import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageStudents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const student = await prisma.student.findUnique({ where: { id } })
    if (!student || student.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { classId } = body

    if (!classId || typeof classId !== "string") {
      return NextResponse.json({ error: "Turma é obrigatória" }, { status: 400 })
    }

    // Verify the class belongs to the same school
    const targetClass = await prisma.class.findUnique({ where: { id: classId } })
    if (!targetClass || targetClass.schoolId !== schoolId) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    // Update student class
    const updated = await prisma.student.update({
      where: { id },
      data: { classId },
      include: {
        class: { select: { id: true, name: true, grade: true } },
      },
    })

    // Update active enrollment to new class (if exists)
    const activeEnrollment = await prisma.enrollment.findFirst({
      where: { studentId: id, schoolId, status: "ativa" },
      orderBy: { enrolledAt: "desc" },
    })
    if (activeEnrollment) {
      await prisma.enrollment.update({
        where: { id: activeEnrollment.id },
        data: { classId, status: "transferida", observation: `Transferido para turma ${targetClass.name}` },
      })
      // Create new enrollment in target class
      await prisma.enrollment.create({
        data: {
          studentId: id,
          classId,
          academicYearId: activeEnrollment.academicYearId,
          schoolId,
          status: "ativa",
        },
      }).catch(() => {
        // Ignore if unique constraint (already enrolled in this year)
      })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error("[students/transfer]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
