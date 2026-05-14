import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: { select: { players: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json({ tournaments })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const { name, maxPlayers } = body

  const tournament = await prisma.tournament.create({
    data: {
      name: name || "WordStack Tournament",
      maxPlayers: maxPlayers || 8,
      createdById: session.user.id,
      players: {
        create: {
          userId: session.user.id,
          seed: 1,
        },
      },
    },
  })

  return NextResponse.json({ tournament })
}
