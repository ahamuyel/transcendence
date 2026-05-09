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
    if (year.status === "encerrado" || year.status === "em_encerramento") {
      return NextResponse.json({ error: "Não é possível activar um ano letivo encerrado ou em encerramento" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      }),
      prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ])

    return NextResponse.json({ success: true, message: `Ano letivo "${year.name}" definido como corrente` })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
