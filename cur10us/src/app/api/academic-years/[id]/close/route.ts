import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const year = await prisma.academicYear.findFirst({ where: { id, schoolId } })
    if (!year) return NextResponse.json({ error: "Ano letivo não encontrado" }, { status: 404 })

    if (year.status === "aberto") {
      // Transição: aberto → em_encerramento (bloqueia novas notas)
      await prisma.academicYear.update({
        where: { id },
        data: { status: "em_encerramento" },
      })
      return NextResponse.json({
        success: true,
        status: "em_encerramento",
        message: "Ano letivo em processo de encerramento. Novas notas bloqueadas. Execute novamente para finalizar.",
      })
    }

    if (year.status === "em_encerramento") {
      // Transição: em_encerramento → encerrado
      // A avaliação final dos alunos é feita via /api/evaluation/finalize
      await prisma.academicYear.update({
        where: { id },
        data: { status: "encerrado" },
      })
      return NextResponse.json({
        success: true,
        status: "encerrado",
        message: "Ano letivo encerrado com sucesso.",
      })
    }

    return NextResponse.json({ error: "Ano letivo já está encerrado" }, { status: 400 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
