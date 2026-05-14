import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const { player2Id, gameType } = body

  const match = await prisma.gameMatch.create({
    data: {
      gameType: gameType || "wordstack",
      status: "waiting",
      player1Id: session.user.id,
      player2Id,
    },
  })

  return NextResponse.json({ match })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (id) {
    const match = await prisma.gameMatch.findUnique({
      where: { id },
      include: {
        player1: { select: { id: true, name: true, image: true } },
        player2: { select: { id: true, name: true, image: true } },
      },
    })
    return NextResponse.json({ match })
  }

  const matches = await prisma.gameMatch.findMany({
    where: {
      OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
    },
    include: {
      player1: { select: { id: true, name: true, image: true } },
      player2: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ matches })
}
