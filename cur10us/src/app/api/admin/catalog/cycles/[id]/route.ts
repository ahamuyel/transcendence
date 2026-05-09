import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { updateEducationCycleSchema } from "@/lib/validations/catalog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const cycle = await prisma.educationCycle.findUnique({
      where: { id },
      include: { globalClasses: { orderBy: { grade: "asc" } } },
    })
    if (!cycle) return NextResponse.json({ error: "Ciclo não encontrado" }, { status: 404 })

    return NextResponse.json(cycle)
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
    const parsed = updateEducationCycleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const cycle = await prisma.educationCycle.update({ where: { id }, data: parsed.data })
    return NextResponse.json(cycle)
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
    const classCount = await prisma.globalClass.count({ where: { cycleId: id } })
    if (classCount > 0) {
      return NextResponse.json({ error: `Não é possível eliminar: ${classCount} classe(s) associada(s) a este ciclo` }, { status: 409 })
    }

    await prisma.educationCycle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
