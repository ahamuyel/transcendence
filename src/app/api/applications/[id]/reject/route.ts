import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { rejectApplicationSchema } from "@/lib/validations/application"
import { sendApplicationRejected } from "@/lib/email"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageApplications", { requireSchool: true })
    if (authError) return authError

    const { id } = await params
    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== session!.user.schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    if (!["pendente", "em_analise"].includes(existing.status)) {
      return NextResponse.json({ error: "Solicitação não pode ser rejeitada no estado atual" }, { status: 400 })
    }

    const body = await req.json()
    const parsed = rejectApplicationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status: "rejeitada", rejectReason: parsed.data.reason },
    })

    try {
      await sendApplicationRejected(application.email, application.name, parsed.data.reason)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
