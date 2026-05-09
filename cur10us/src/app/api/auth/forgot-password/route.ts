import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const forgotLimiter = rateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000 }) // 3 per hour

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: Request) {
  return withCsrf(handleForgotPassword)(req, {})
}

async function handleForgotPassword(req: Request) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Rate limit check (always pass through to prevent enumeration, but track)
    const ip = getIp(req)
    const limit = await forgotLimiter(ip)

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } })

    if (user && limit.success) {
      // Delete any existing tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      })

      const token = randomUUID()
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { token, expires, userId: user.id },
      })

      const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`
      await sendPasswordResetEmail(email, user.name || "", resetUrl)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
