import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageApplications", { requireSchool: true })
    if (authError) return authError

    const { id } = await params
    const application = await prisma.application.findUnique({ where: { id } })

    if (!application || application.schoolId !== session!.user.schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageApplications", { requireSchool: true })
    if (authError) return authError

    const { id } = await params
    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== session!.user.schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const validStatuses = ["pendente", "em_analise", "aprovada", "matriculada", "rejeitada"]
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    // Enforce valid state transitions
    const allowedTransitions: Record<string, string[]> = {
      pendente: ["em_analise", "rejeitada"],
      em_analise: ["aprovada", "rejeitada", "pendente"],
      aprovada: ["matriculada", "rejeitada"],
      rejeitada: ["pendente", "em_analise"],
      matriculada: [],
    }
    const allowed = allowedTransitions[existing.status] || []
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: `Não é possível mudar de "${existing.status}" para "${body.status}"` }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.status === "rejeitada" && body.rejectReason ? { rejectReason: body.rejectReason } : {}),
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
