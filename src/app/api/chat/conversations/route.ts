import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
      include: {
        participant1: { select: { id: true, name: true, image: true } },
        participant2: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { text: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
    })

    // Get unread counts for all conversations
    const conversationIds = conversations.map((c) => c.id)
    const unreadCounts = await prisma.chatMessage.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: session.user.id },
        readAt: null,
      },
      _count: { id: true },
    })
    const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]))

    const mapped = conversations.map((c) => {
      const other = c.participant1Id === session.user.id ? c.participant2 : c.participant1
      return {
        id: c.id,
        other,
        lastMessage: c.messages[0] || null,
        lastMessageAt: c.lastMessageAt,
        createdAt: c.createdAt,
        unreadCount: unreadMap.get(c.id) || 0,
      }
    })

    return NextResponse.json({ data: mapped })
  } catch {
    return NextResponse.json({ error: "Erro ao listar conversas" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { participantId } = await req.json()
    if (!participantId) return NextResponse.json({ error: "participantId é obrigatório" }, { status: 400 })
    if (participantId === session.user.id) return NextResponse.json({ error: "Não pode conversar consigo mesmo" }, { status: 400 })

    const [p1, p2] = [session.user.id, participantId].sort()
    const existing = await prisma.conversation.findUnique({
      where: { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
    })

    if (existing) return NextResponse.json({ data: existing })

    const conversation = await prisma.conversation.create({
      data: { participant1Id: p1, participant2Id: p2 },
    })

    return NextResponse.json({ data: conversation }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 })
  }
}
