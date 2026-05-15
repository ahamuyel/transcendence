import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const requests = await prisma.friend.findMany({
      where: { friendId: session.user.id, status: "pending" },
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const mapped = requests.map((r) => ({
      id: r.id,
      requester: r.user,
      createdAt: r.createdAt,
    }))

    return NextResponse.json({ data: mapped })
  } catch {
    return NextResponse.json({ error: "Erro ao listar pedidos" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { id, action } = await req.json()
    if (!id || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    const request = await prisma.friend.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    })
    if (!request || request.friendId !== session.user.id) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (action === "accept") {
      await prisma.friend.update({ where: { id }, data: { status: "accepted" } })
      // Auto-create a conversation between the two users
      const [p1, p2] = [request.userId, session.user.id].sort()
      await prisma.conversation.upsert({
        where: { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
        create: { participant1Id: p1, participant2Id: p2 },
        update: {},
      })
      try {
        await createNotification({
          userId: request.userId,
          title: "Amizade aceite",
          message: `${session.user.name} aceitou o seu pedido de amizade`,
          link: "/list/friends",
          type: "friend_accepted",
          schoolId: "",
        })
      } catch {
        // ignore
      }
    } else {
      await prisma.friend.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao processar pedido" }, { status: 500 })
  }
}
