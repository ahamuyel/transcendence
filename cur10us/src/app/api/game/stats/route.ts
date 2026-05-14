import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  let stats = await prisma.gameStats.findUnique({
    where: { userId: session.user.id },
  })

  if (!stats) {
    stats = await prisma.gameStats.create({
      data: { userId: session.user.id },
    })
  }

  const recentMatches = await prisma.gameMatch.findMany({
    where: {
      OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      player1: { select: { name: true } },
      player2: { select: { name: true } },
    },
  })

  return NextResponse.json({ stats, recentMatches })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const { matchId, winnerId, loserId, p1Score, p2Score, state } = body

  const match = await prisma.gameMatch.update({
    where: { id: matchId },
    data: {
      status: "finished",
      winnerId,
      loserId,
      state,
      finishedAt: new Date(),
    },
  })

  // Update stats for both players
  for (const uid of [winnerId, loserId].filter(Boolean)) {
    const stats = await prisma.gameStats.findUnique({ where: { userId: uid } })
    if (stats) {
      await prisma.gameStats.update({
        where: { userId: uid },
        data: {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: uid === winnerId ? stats.gamesWon + 1 : stats.gamesWon,
          totalScore: stats.totalScore + (uid === winnerId ? p1Score || 0 : p2Score || 0),
          rating: stats.rating + (uid === winnerId ? 15 : -10),
        },
      })
    } else {
      await prisma.gameStats.create({
        data: {
          userId: uid,
          gamesPlayed: 1,
          gamesWon: uid === winnerId ? 1 : 0,
          totalScore: uid === winnerId ? p1Score || 0 : p2Score || 0,
          rating: uid === winnerId ? 1015 : 990,
        },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
