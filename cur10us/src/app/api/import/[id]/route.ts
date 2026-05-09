import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const job = await prisma.importJob.findUnique({
      where: { id },
      include: {
        importedBy: { select: { id: true, name: true } },
      },
    })

    if (!job || job.schoolId !== schoolId) {
      return NextResponse.json({ error: "Importação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
