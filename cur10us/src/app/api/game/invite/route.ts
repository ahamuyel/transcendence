import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { broadcastToUser } from "@/lib/ws-broadcast"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { opponentId } = await req.json()
  if (!opponentId) {
    return NextResponse.json({ error: "opponentId é obrigatório" }, { status: 400 })
  }

  const existing = await prisma.gameMatch.findFirst({
    where: {
      OR: [
        { player1Id: session.user.id, player2Id: opponentId, status: "pending" },
        { player1Id: opponentId, player2Id: session.user.id, status: "pending" },
      ],
    },
  })
  if (existing) {
    return NextResponse.json({ error: "Já existe um convite pendente" }, { status: 409 })
  }

  const game = await prisma.gameMatch.create({
    data: { player1Id: session.user.id, player2Id: opponentId },
  })

  broadcastToUser(opponentId, "game_invite", {
    gameId: game.id,
    from: session.user.name || session.user.id,
  })

  return NextResponse.json({ data: game }, { status: 201 })
}
