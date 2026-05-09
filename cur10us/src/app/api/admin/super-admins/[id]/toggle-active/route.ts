import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params

    // Cannot toggle yourself
    if (session!.user.id === id) {
      return NextResponse.json(
        { error: "Não é possível desactivar a sua própria conta" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    })

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Super admin não encontrado" }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
