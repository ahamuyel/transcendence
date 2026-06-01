import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { revalidateSchoolData } from "@/lib/revalidate"

const REVERT_MAP: Record<string, string> = {
  ativa: "aprovada",
  aprovada: "pendente",
  rejeitada: "pendente",
  suspensa: "ativa",
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const school = await prisma.school.findUnique({ where: { id } })
    if (!school) {
      return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 })
    }

    const targetStatus = REVERT_MAP[school.status]
    if (!targetStatus) {
      return NextResponse.json({ error: "Não é possível reverter este estado" }, { status: 400 })
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        status: targetStatus as "pendente" | "aprovada" | "ativa",
        rejectReason: targetStatus === "pendente" ? null : school.rejectReason,
      },
    })

    // Revalidate school data
    revalidateSchoolData(id)

    return NextResponse.json({ school: updated, previousStatus: school.status, newStatus: targetStatus })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
