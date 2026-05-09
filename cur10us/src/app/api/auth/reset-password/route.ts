import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { rateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const resetLimiter = rateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }) // 5 per hour

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: Request) {
  return withCsrf(handleResetPassword)(req, {})
}

async function handleResetPassword(req: Request) {
  try {
    const ip = getIp(req)
    const limit = await resetLimiter(ip)

    if (!limit.success) {
      const resetSec = Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${resetSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(resetSec) } }
      )
    }

    const body = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { hashedPassword, mustChangePassword: false },
    })

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    // Don't return email to prevent user enumeration
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
