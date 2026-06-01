import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import speakeasy from "speakeasy"
import { withCsrf } from "@/lib/csrf"

export async function POST(req: Request) {
  return withCsrf(handleVerify)(req, {})
}

async function handleVerify(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    })

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA não configurado" }, { status: 400 })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    })

    if (!verified) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao verificar 2FA" }, { status: 500 })
  }
}
