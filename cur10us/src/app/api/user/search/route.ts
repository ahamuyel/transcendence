import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] })
    }

    // Search users by name or email (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
        NOT: { id: session.user.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      take: 20,
      orderBy: { name: "asc" },
    })

    // Check friendship status for each result
    const userIds = users.map((u) => u.id)
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, friendId: { in: userIds } },
          { userId: { in: userIds }, friendId: session.user.id },
        ],
      },
      select: { userId: true, friendId: true, status: true },
    })

    const friendshipMap = new Map<string, "pending_sent" | "pending_received" | "accepted">()
    for (const f of friendships) {
      if (f.status === "accepted") {
        const otherId = f.userId === session.user.id ? f.friendId : f.userId
        friendshipMap.set(otherId, "accepted")
      } else if (f.status === "pending") {
        if (f.userId === session.user.id) {
          friendshipMap.set(f.friendId, "pending_sent")
        } else {
          friendshipMap.set(f.userId, "pending_received")
        }
      }
    }

    const data = users.map((u) => ({
      ...u,
      friendshipStatus: friendshipMap.get(u.id) || "none",
    }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Erro ao pesquisar" }, { status: 500 })
  }
}
