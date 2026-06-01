import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageCourses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const body = await req.json()
    const { localName } = body

    const schoolCourse = await prisma.schoolCourse.findFirst({ where: { id, schoolId } })
    if (!schoolCourse) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

    const updated = await prisma.schoolCourse.update({
      where: { id },
      data: { localName: localName || null },
    })

    await prisma.course.updateMany({
      where: { globalCourseId: schoolCourse.globalCourseId, schoolId },
      data: { name: localName || (await prisma.globalCourse.findUnique({ where: { id: schoolCourse.globalCourseId } }))!.name },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageCourses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const schoolCourse = await prisma.schoolCourse.findFirst({ where: { id, schoolId } })
    if (!schoolCourse) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

    await prisma.schoolCourse.update({ where: { id }, data: { active: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
