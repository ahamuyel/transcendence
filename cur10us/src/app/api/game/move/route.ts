import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { broadcastToUser } from "@/lib/ws-broadcast"

const MOVES = ["pedra", "papel", "tesoura"] as const

function getWinner(move1: string, move2: string): number {
  if (move1 === move2) return 0
  if (
    (move1 === "pedra" && move2 === "tesoura") ||
    (move1 === "tesoura" && move2 === "papel") ||
    (move1 === "papel" && move2 === "pedra")
  ) return 1
  return 2
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { gameId, move } = await req.json()
  if (!gameId || !move || !MOVES.includes(move)) {
    return NextResponse.json({ error: "Movimento inválido" }, { status: 400 })
  }

  const game = await prisma.gameMatch.findUnique({ where: { id: gameId } })
  if (!game) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
  }
  if (game.status !== "pending" && game.status !== "active") {
    return NextResponse.json({ error: "Jogo já terminou" }, { status: 400 })
  }

  const isPlayer1 = game.player1Id === session.user.id
  const isPlayer2 = game.player2Id === session.user.id
  if (!isPlayer1 && !isPlayer2) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const moveKey = isPlayer1 ? "player1Move" : "player2Move"
  if (game[moveKey]) {
    return NextResponse.json({ error: "Já fizeste a tua jogada" }, { status: 400 })
  }

  const updated = await prisma.gameMatch.update({
    where: { id: gameId },
    data: {
      [moveKey]: move,
      status: "active",
    },
  })

  if (updated.player1Move && updated.player2Move) {
    const result = getWinner(updated.player1Move, updated.player2Move)
    const winnerId = result === 0 ? null : result === 1 ? game.player1Id : game.player2Id

    await prisma.gameMatch.update({
      where: { id: gameId },
      data: {
        status: "completed",
        winnerId,
        completedAt: new Date(),
      },
    })

    const opponentId = isPlayer1 ? game.player2Id : game.player1Id
    broadcastToUser(opponentId, "game_result", {
      gameId,
      yourMove: move,
      opponentMove: game[moveKey],
      result: result === 0 ? "draw" : (result === 1 ? game.player1Id : game.player2Id) === session.user.id ? "win" : "lose",
    })
  }

  const opponentId = isPlayer1 ? game.player2Id : game.player1Id
  broadcastToUser(opponentId, "game_move", { gameId })

  return NextResponse.json({ data: updated })
}
