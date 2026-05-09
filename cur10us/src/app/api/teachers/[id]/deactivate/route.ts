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
      "canManageTeachers",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    })

    if (!teacher || teacher.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    if (!teacher.userId) {
      return NextResponse.json({ error: "Este professor não tem conta de acesso" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
