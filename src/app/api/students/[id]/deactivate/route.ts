import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageStudents",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    })

    if (!student || student.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    if (!student.userId) {
      return NextResponse.json({ error: "Este aluno não tem conta de acesso" }, { status: 400 })
    }

    // Deactivate user account
    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    })

    // Mark active enrollment as cancelled (desistência)
    await prisma.enrollment.updateMany({
      where: { studentId: id, schoolId, status: "ativa" },
      data: { status: "cancelada", observation: "Desistência — conta desativada" },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[students/deactivate]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
