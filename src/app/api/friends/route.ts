import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"
import { broadcastToUser } from "@/lib/ws-broadcast"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "accepted"

    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status },
          { friendId: session.user.id, status },
        ],
      },
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
        friend: { select: { id: true, name: true, image: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const mapped = friends.map((f) => {
      const isRequester = f.userId === session.user.id
      return {
        id: f.id,
        friend: isRequester ? f.friend : f.user,
        status: f.status,
        createdAt: f.createdAt,
      }
    })

    return NextResponse.json({ data: mapped })
  } catch {
    return NextResponse.json({ error: "Erro ao listar amigos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { friendId, schoolId } = await req.json()
    if (!friendId) return NextResponse.json({ error: "friendId é obrigatório" }, { status: 400 })
    if (friendId === session.user.id) return NextResponse.json({ error: "Não pode adicionar-se a si mesmo" }, { status: 400 })

    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id },
        ],
      },
    })

    if (existing) return NextResponse.json({ error: "Pedido já existe" }, { status: 409 })

    const friend = await prisma.friend.create({
      data: { userId: session.user.id, friendId, status: "pending" },
    })

    // Notify the target user
    try {
      await createNotification({
        userId: friendId,
        title: "Pedido de amizade",
        message: `${session.user.name} enviou-lhe um pedido de amizade`,
        link: "/list/friends",
        type: "friend_request",
        schoolId: schoolId || "",
      })
    } catch {
      // ignore
    }

    return NextResponse.json({ data: friend }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar amigo" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { friendId } = await req.json()

    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id },
        ],
      },
    })

    if (!friendship) return NextResponse.json({ error: "Amizade não encontrada" }, { status: 404 })

    await prisma.friend.delete({ where: { id: friendship.id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao remover amigo" }, { status: 500 })
  }
}
