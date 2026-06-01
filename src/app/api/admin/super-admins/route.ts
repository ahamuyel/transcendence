import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const admins = await prisma.user.findMany({
      where: { role: "super_admin" },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ data: admins })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, e-mail e palavra-passe são obrigatórios" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Palavra-passe deve ter pelo menos 8 caracteres" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está registado" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "super_admin",
        isActive: true,
        emailVerified: true,
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    // Note: tempPassword should be sent to the user via a secure channel (e.g., email)
    // Never expose plaintext passwords in API responses
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
