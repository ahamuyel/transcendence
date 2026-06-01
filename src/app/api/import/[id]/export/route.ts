import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import * as XLSX from "xlsx"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const job = await prisma.importJob.findUnique({ where: { id } })
    if (!job || job.schoolId !== schoolId) {
      return NextResponse.json({ error: "Importação não encontrada" }, { status: 404 })
    }

    const wb = XLSX.utils.book_new()

    // Success sheet
    const report = (job.report as { email: string; password: string; name: string }[]) || []
    if (report.length > 0) {
      const ws = XLSX.utils.json_to_sheet(report.map((r) => ({
        Nome: r.name,
        "E-mail": r.email,
        "Palavra-passe temporária": r.password,
      })))
      XLSX.utils.book_append_sheet(wb, ws, "Importados")
    }

    // Errors sheet
    const errors = (job.errors as { rowNumber: number; email: string; errors: string[] }[]) || []
    if (errors.length > 0) {
      const ws = XLSX.utils.json_to_sheet(errors.map((r) => ({
        Linha: r.rowNumber,
        "E-mail": r.email,
        Erros: r.errors.join("; "),
      })))
      XLSX.utils.book_append_sheet(wb, ws, "Erros")
    }

    const buffer = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio_importacao_${job.id}.xlsx"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
