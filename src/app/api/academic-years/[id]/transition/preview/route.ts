import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId, requireFeature } from "@/lib/api-auth"
import { previewTransition } from "@/lib/year-transition"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const year = await prisma.academicYear.findFirst({ where: { id: closedYearId, schoolId } })
    if (!year) return NextResponse.json({ error: "Ano letivo não encontrado" }, { status: 404 })
    if (year.status !== "encerrado") {
      return NextResponse.json({ error: "O ano letivo deve estar encerrado para pré-visualizar a transição" }, { status: 400 })
    }

    const preview = await previewTransition(closedYearId, schoolId)
    return NextResponse.json(preview)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
