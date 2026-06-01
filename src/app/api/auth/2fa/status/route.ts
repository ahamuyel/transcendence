import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    })

    return NextResponse.json({ enabled: user?.twoFactorEnabled ?? false })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
