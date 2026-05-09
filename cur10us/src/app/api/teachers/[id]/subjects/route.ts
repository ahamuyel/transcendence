import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageTeachers", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const teacher = await prisma.teacher.findUnique({ where: { id } })
    if (!teacher || teacher.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    const { subjectIds } = await req.json()
    if (!Array.isArray(subjectIds)) {
      return NextResponse.json({ error: "subjectIds deve ser um array" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.teacherSubject.deleteMany({ where: { teacherId: id } }),
      ...subjectIds.map((subjectId: string) =>
        prisma.teacherSubject.create({ data: { teacherId: id, subjectId } })
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
