import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/password"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/validations/auth"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const signupLimiter = rateLimit({ maxRequests: 5, windowMs: 10 * 60 * 1000 }) // 5 per 10 min

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: Request) {
  return withCsrf(handleSignup)(req, {})
}

async function handleSignup(req: Request) {
  try {
    const ip = getIp(req)
    const limit = await signupLimiter(ip)

    if (!limit.success) {
      const resetSec = Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${resetSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(resetSec) } }
      )
    }

    const body = await req.json()
    const parsed = signUpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Create user with emailVerified = false
    const user = await prisma.user.create({
      data: { name, email, hashedPassword, provider: "credentials", isActive: false, emailVerified: false },
    })

    // Create email verification token
    const token = randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.emailVerificationToken.create({
      data: { token, expires, userId: user.id },
    })

    // Send verification email (don't fail if email service is down)
    try {
      const verifyUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`
      await sendVerificationEmail(email, name, verifyUrl)
    } catch (e) {
      console.error("Email send error:", e)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: unknown) {
    console.error("Signup error:", error)
    // Check if it's a Prisma unique constraint error
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
