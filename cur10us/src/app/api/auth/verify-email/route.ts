import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const verifyLimiter = rateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000 }) // 3 per hour
const resendLimiter = rateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }) // 5 per hour

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

/**
 * POST /api/auth/verify-email
 * Verifies the email using a token from the query params
 */
// No CSRF required for verify — user clicks a link from their email
export async function POST(req: Request) {
  return handleVerifyEmail(req)
}

async function handleVerifyEmail(req: Request) {
  try {
    const ip = getIp(req)
    const limit = await verifyLimiter(ip)

    if (!limit.success) {
      const resetSec = Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${resetSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(resetSec) } }
      )
    }

    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ])

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

/**
 * PATCH /api/auth/resend-verification
 * Resends the verification email to the provided email address
 */
export async function PATCH(req: Request) {
  return withCsrf(handleResendVerification)(req, {})
}

async function handleResendVerification(req: Request) {
  try {
    const ip = getIp(req)
    const limit = await resendLimiter(ip)

    if (!limit.success) {
      const resetSec = Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${resetSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(resetSec) } }
      )
    }

    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true })
    }

    // Delete any existing verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    })

    const token = randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.emailVerificationToken.create({
      data: { token, expires, userId: user.id },
    })

    const verifyUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`
    await sendVerificationEmail(email, user.name || "", verifyUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
