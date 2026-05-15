import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import speakeasy from "speakeasy"

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()
    if (!email || !token) {
      return NextResponse.json({ error: "Email e token são obrigatórios" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA não configurado" }, { status: 400 })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    })

    if (!verified) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao verificar 2FA" }, { status: 500 })
  }
}
