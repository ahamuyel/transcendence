import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const wins = await prisma.gameMatch.groupBy({
    by: ["winnerId"],
    where: { status: "completed", winnerId: { not: null } },
    _count: { winnerId: true },
    orderBy: { _count: { winnerId: "desc" } },
    take: 20,
  })

  const userIds = wins.map((w) => w.winnerId).filter(Boolean) as string[]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  })

  const ranking = wins
    .filter((w) => w.winnerId)
    .map((w) => {
      const user = users.find((u) => u.id === w.winnerId)
      return {
        userId: w.winnerId,
        name: user?.name || "Desconhecido",
        image: user?.image,
        wins: w._count.winnerId,
      }
    })

  return NextResponse.json({ data: ranking })
}
