import { NextResponse } from "next/server"
import { hashPassword, comparePassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/validations/auth"
import { withCsrf } from "@/lib/csrf"
import { rateLimit } from "@/lib/rate-limit"

const changePasswordLimiter = rateLimit({ maxRequests: 5, windowMs: 15 * 60 * 1000 }) // 5 per 15 min

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: Request) {
  return withCsrf(handleChangePassword)(req, {})
}

async function handleChangePassword(req: Request) {
  try {
    const ip = getIp(req)
    const limit = await changePasswordLimiter(ip)

    if (!limit.success) {
      const resetSec = Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${resetSec} segundos.` },
        { status: 429, headers: { "Retry-After": String(resetSec) } }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Conta sem palavra-passe definida" },
        { status: 400 }
      )
    }

    const isValid = await comparePassword(currentPassword, user.hashedPassword)
    if (!isValid) {
      return NextResponse.json(
        { error: "Palavra-passe actual incorrecta" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword, mustChangePassword: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
