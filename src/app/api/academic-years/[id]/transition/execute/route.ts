import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId, requireFeature } from "@/lib/api-auth"
import { executeTransition } from "@/lib/year-transition"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const featureError = requireFeature(session!, "yearTransition")
    if (featureError) return featureError

    const schoolId = getSchoolId(session!)
    const { id: closedYearId } = await params
    const body = await req.json()
    const { newYearId } = body

    if (!newYearId) {
      return NextResponse.json({ error: "newYearId é obrigatório" }, { status: 400 })
    }

    const closedYear = await prisma.academicYear.findFirst({ where: { id: closedYearId, schoolId } })
    if (!closedYear) return NextResponse.json({ error: "Ano letivo encerrado não encontrado" }, { status: 404 })
    if (closedYear.status !== "encerrado") {
      return NextResponse.json({ error: "O ano letivo deve estar encerrado para executar a transição" }, { status: 400 })
    }

    const newYear = await prisma.academicYear.findFirst({ where: { id: newYearId, schoolId } })
    if (!newYear) return NextResponse.json({ error: "Novo ano letivo não encontrado" }, { status: 404 })
    if (newYear.status !== "aberto") {
      return NextResponse.json({ error: "O novo ano letivo deve estar aberto" }, { status: 400 })
    }

    const result = await executeTransition(closedYearId, newYearId, schoolId)

    return NextResponse.json({
      success: true,
      message: "Transição de ano letivo executada com sucesso.",
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno do servidor"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
