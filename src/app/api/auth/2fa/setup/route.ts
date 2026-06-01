import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import speakeasy from "speakeasy"
import { withCsrf } from "@/lib/csrf"

export async function POST(req: Request) {
  return withCsrf(handleSetup)(req, {})
}

async function handleSetup() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const secret = speakeasy.generateSecret({ name: `Cur10usX:${session.user.email}` })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret.base32 },
    })

    return NextResponse.json({
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
    })
  } catch {
    return NextResponse.json({ error: "Erro ao configurar 2FA" }, { status: 500 })
  }
}
