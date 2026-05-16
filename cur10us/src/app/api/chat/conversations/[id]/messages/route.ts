import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { broadcastToUser } from "@/lib/ws-broadcast"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { id } = await params
    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })

    const isParticipant = conversation.participant1Id === session.user.id || conversation.participant2Id === session.user.id
    if (!isParticipant) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    })

    const hasMore = messages.length > limit
    const data = hasMore ? messages.slice(0, limit) : messages

    // Mark messages as read from the other participant
    if (!cursor) {
      const unreadIds = data
        .filter((m) => m.senderId !== session.user.id && !m.readAt)
        .map((m) => m.id)

      if (unreadIds.length > 0) {
        await prisma.chatMessage.updateMany({
          where: { id: { in: unreadIds } },
          data: { readAt: new Date() },
        })

        const otherId = conversation.participant1Id === session.user.id
          ? conversation.participant2Id
          : conversation.participant1Id

        broadcastToUser(otherId, "messages-read", { conversationId: id })
      }
    }

    return NextResponse.json({
      data: data.reverse(),
      nextCursor: hasMore ? data[0]?.id : null,
    })
  } catch {
    return NextResponse.json({ error: "Erro ao listar mensagens" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { id } = await params
    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })

    const isParticipant = conversation.participant1Id === session.user.id || conversation.participant2Id === session.user.id
    if (!isParticipant) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 })

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        text: text.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    })

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    })

    const otherId = conversation.participant1Id === session.user.id
      ? conversation.participant2Id
      : conversation.participant1Id

    broadcastToUser(otherId, "chat_message", {
      conversationId: id,
      message,
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
}
