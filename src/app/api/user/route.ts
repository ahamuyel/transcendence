import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (!user) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "Erro ao procurar utilizador" }, { status: 500 })
  }
}
