import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { updateGlobalClassSchema } from "@/lib/validations/catalog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const globalClass = await prisma.globalClass.findUnique({
      where: { id },
      include: { cycle: true, schoolClasses: { include: { school: { select: { id: true, name: true } } } } },
    })
    if (!globalClass) return NextResponse.json({ error: "Classe não encontrada" }, { status: 404 })

    return NextResponse.json(globalClass)
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
    const parsed = updateGlobalClassSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const globalClass = await prisma.globalClass.update({
      where: { id },
      data: parsed.data,
      include: { cycle: true },
    })
    return NextResponse.json(globalClass)
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
    const usageCount = await prisma.schoolClass.count({ where: { globalClassId: id } })
    if (usageCount > 0) {
      return NextResponse.json({ error: `Não é possível eliminar: ${usageCount} escola(s) utilizam esta classe` }, { status: 409 })
    }

    await prisma.globalClass.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
