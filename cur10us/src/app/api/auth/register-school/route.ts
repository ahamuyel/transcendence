import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { registerSchoolSchema } from "@/lib/validations/register-school"
import { withCsrf } from "@/lib/csrf"
import { rateLimit } from "@/lib/rate-limit"

const registerSchoolLimiter = rateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000 }) // 3 per hour

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: Request) {
  return withCsrf(handleRegisterSchool)(req, {})
}

async function handleRegisterSchool(req: Request) {
  try {
    const ip = getIp(req)
    const limit = await registerSchoolLimiter(ip)

    if (!limit.success) {
      const resetSec = Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${resetSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(resetSec) } }
      )
    }

    const body = await req.json()
    const parsed = registerSchoolSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const {
      adminName, adminEmail, adminPassword,
      schoolName, slug, nif, schoolEmail, phone, address, city, provincia,
    } = parsed.data

    // Check for duplicates
    const [existingUser, existingSlug, existingSchoolEmail] = await Promise.all([
      prisma.user.findUnique({ where: { email: adminEmail } }),
      prisma.school.findUnique({ where: { slug } }),
      prisma.school.findFirst({ where: { email: schoolEmail } }),
    ])

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail de administrador já está registado" },
        { status: 409 }
      )
    }
    if (existingSlug) {
      return NextResponse.json(
        { error: "Este slug já está em uso. Escolha outro." },
        { status: 409 }
      )
    }
    if (existingSchoolEmail) {
      return NextResponse.json(
        { error: "Este e-mail de escola já está registado" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(adminPassword)

    // Create school + admin user in a single transaction
    await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: schoolName,
          slug,
          nif: nif || null,
          email: schoolEmail,
          phone,
          address,
          city,
          provincia,
          status: "pendente",
        },
      })

      const user = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          hashedPassword,
          provider: "credentials",
          role: "school_admin",
          isActive: false,
          emailVerified: false,
          profileComplete: true,
          schoolId: school.id,
        },
      })

      // Create email verification token
      const { randomUUID } = await import("crypto")
      const token = randomUUID()
      await tx.emailVerificationToken.create({
        data: {
          token,
          userId: user.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Send verification email (non-blocking)
      const { sendVerificationEmail } = await import("@/lib/email")
      const verifyUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`
      sendVerificationEmail(adminEmail, adminName, verifyUrl).catch((e) => console.error("[Email Error]", e))
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
