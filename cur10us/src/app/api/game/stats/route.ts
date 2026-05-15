import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const total = await prisma.gameMatch.count({
    where: {
      OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
    },
  })

  const wins = await prisma.gameMatch.count({
    where: { winnerId: session.user.id, status: "completed" },
  })

  const losses = await prisma.gameMatch.count({
    where: {
      status: "completed",
      AND: [
        { winnerId: { not: session.user.id } },
        { winnerId: { not: null } },
      ],
      OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
    },
  })

  const draws = await prisma.gameMatch.count({
    where: {
      status: "completed",
      winnerId: null,
      OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
    },
  })

  return NextResponse.json({ data: { total, wins, losses, draws } })
}
