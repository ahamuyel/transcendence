import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const rankings = await prisma.gameStats.findMany({
    include: { user: { select: { name: true, image: true } } },
    orderBy: { rating: "desc" },
    take: 100,
  })

  return NextResponse.json({ rankings })
}
