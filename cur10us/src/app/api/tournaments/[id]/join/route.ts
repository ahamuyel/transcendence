import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { _count: { select: { players: true } } },
  })

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
  }

  if (tournament.status !== "registration") {
    return NextResponse.json({ error: "Tournament is not open" }, { status: 400 })
  }

  if (tournament._count.players >= tournament.maxPlayers) {
    return NextResponse.json({ error: "Tournament is full" }, { status: 400 })
  }

  const existing = await prisma.tournamentPlayer.findFirst({
    where: { tournamentId: id, userId: session.user.id },
  })

  if (existing) {
    return NextResponse.json({ error: "Already registered" }, { status: 400 })
  }

  const player = await prisma.tournamentPlayer.create({
    data: {
      tournamentId: id,
      userId: session.user.id,
      seed: tournament._count.players + 1,
    },
  })

  return NextResponse.json({ player })
}
