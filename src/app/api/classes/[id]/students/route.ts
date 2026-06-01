import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageClasses", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const classItem = await prisma.class.findUnique({ where: { id } })
    if (!classItem || classItem.schoolId !== schoolId) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const { studentIds } = body as { studentIds: string[] }

    await prisma.$transaction([
      prisma.student.updateMany({
        where: { classId: id },
        data: { classId: null },
      }),
      prisma.student.updateMany({
        where: { id: { in: studentIds }, schoolId },
        data: { classId: id },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
