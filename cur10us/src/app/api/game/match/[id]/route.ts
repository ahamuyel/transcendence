import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const game = await prisma.gameMatch.findUnique({
    where: { id },
    include: {
      player1: { select: { id: true, name: true, image: true } },
      player2: { select: { id: true, name: true, image: true } },
    },
  })

  if (!game) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
  }

  const isPlayer = game.player1Id === session.user.id || game.player2Id === session.user.id
  if (!isPlayer) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json({ data: game })
}
