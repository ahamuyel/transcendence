import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { updateGlobalCourseSchema } from "@/lib/validations/catalog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const course = await prisma.globalCourse.findUnique({
      where: { id },
      include: { schoolCourses: { include: { school: { select: { id: true, name: true } } } } },
    })
    if (!course) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })

    return NextResponse.json(course)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const body = await req.json()
    const parsed = updateGlobalCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const course = await prisma.globalCourse.update({ where: { id }, data: parsed.data })
    return NextResponse.json(course)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const usageCount = await prisma.schoolCourse.count({ where: { globalCourseId: id } })
    if (usageCount > 0) {
      return NextResponse.json({ error: `Não é possível eliminar: ${usageCount} escola(s) utilizam este curso` }, { status: 409 })
    }

    await prisma.globalCourse.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
