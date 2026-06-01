import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createMessageSchema } from "@/lib/validations/support"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params

    // Verify ticket exists and user has access
    const ticket = await prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }
    if (session.user.role !== "super_admin" && ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const isStaff = session.user.role === "super_admin"

    const message = await prisma.supportTicketMessage.create({
      data: {
        content: parsed.data.content,
        isStaff,
        userId: session.user.id,
        ticketId: id,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    })

    // Auto-update ticket status when staff responds
    if (isStaff && ticket.status === "aberto") {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: "em_andamento" },
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
