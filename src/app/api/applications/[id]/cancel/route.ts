import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params

    const application = await prisma.application.findUnique({ where: { id } })
    if (!application) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    if (application.email !== session.user.email) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    if (application.status !== "pendente") {
      return NextResponse.json({ error: "Apenas solicitações pendentes podem ser canceladas" }, { status: 400 })
    }

    await prisma.application.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
