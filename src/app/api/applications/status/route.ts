import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    const application = await prisma.application.findUnique({
      where: { trackingToken: token },
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        rejectReason: true,
        createdAt: true,
        updatedAt: true,
        school: { select: { name: true } },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
