import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, image: true },
    take: 50,
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ users })
}
