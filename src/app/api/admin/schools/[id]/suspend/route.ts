import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { revalidateSchoolData } from "@/lib/revalidate"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const school = await prisma.school.findUnique({ where: { id } })
    if (!school) {
      return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 })
    }

    if (school.status === "suspensa") {
      return NextResponse.json({ error: "Escola já está suspensa" }, { status: 400 })
    }

    if (school.status !== "ativa") {
      return NextResponse.json({ error: "Apenas escolas ativas podem ser suspensas" }, { status: 400 })
    }

    const [updated, deactivated] = await prisma.$transaction([
      prisma.school.update({
        where: { id },
        data: { status: "suspensa" },
      }),
      prisma.user.updateMany({
        where: { schoolId: id },
        data: { isActive: false },
      }),
    ])

    // Revalidate school data
    revalidateSchoolData(id)

    return NextResponse.json({
      school: updated,
      usersDeactivated: deactivated.count,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
