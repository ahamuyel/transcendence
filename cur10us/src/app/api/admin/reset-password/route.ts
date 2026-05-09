import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, hashedPassword: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 })
    }

    if (!user.hashedPassword) {
      return NextResponse.json({ error: "Este utilizador usa login social (Google) e não tem palavra-passe" }, { status: 400 })
    }

    const tempPassword = randomBytes(6).toString("base64url")
    const hashedPassword = await hashPassword(tempPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword, mustChangePassword: true },
    })

    // Send temp password via email instead of exposing in response
    const { sendTempCredentials } = await import("@/lib/email")
    sendTempCredentials(user.email, user.name || "", "", tempPassword).catch((e) => console.error("[Email Error]", e))

    return NextResponse.json({
      success: true,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
