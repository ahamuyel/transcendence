import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requireRole(["school_admin", "teacher", "student", "parent"])
    if (authError) return authError

    const userId = session!.user.id
    const { id } = await params

    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
