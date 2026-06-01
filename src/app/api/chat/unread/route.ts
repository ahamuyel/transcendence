import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const total = await prisma.chatMessage.count({
      where: {
        conversation: {
          OR: [
            { participant1Id: session.user.id },
            { participant2Id: session.user.id },
          ],
        },
        senderId: { not: session.user.id },
        readAt: null,
      },
    })

    return NextResponse.json({ total })
  } catch {
    return NextResponse.json({ error: "Erro ao contar não lidas" }, { status: 500 })
  }
}
