import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageCourses", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course || course.schoolId !== schoolId) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { subjectIds } = body as { subjectIds: string[] }

    await prisma.courseSubject.deleteMany({ where: { courseId: id } })

    if (subjectIds?.length) {
      await prisma.courseSubject.createMany({
        data: subjectIds.map((subjectId) => ({ courseId: id, subjectId })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
