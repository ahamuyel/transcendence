import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teacher: true,
        student: { include: { results: true, attendances: true, enrollments: true } },
        parent: { include: { students: true } },
        sentMessages: true,
        receivedMessages: true,
        notifications: true,
        supportTickets: { include: { messages: true } },
      },
    })

    if (!user) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 })

    const { hashedPassword, twoFactorSecret, ...safeUser } = user

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: safeUser,
    }

    return NextResponse.json(exportData)
  } catch {
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
