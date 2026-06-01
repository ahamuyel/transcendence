import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { withCsrf } from "@/lib/csrf"

export async function POST(req: Request) {
  return withCsrf(handleDisable)(req, {})
}

async function handleDisable() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: null, twoFactorEnabled: false, twoFactorVerifiedAt: null },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao desativar 2FA" }, { status: 500 })
  }
}
