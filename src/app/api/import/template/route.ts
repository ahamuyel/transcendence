import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/api-auth"
import { generateTemplate } from "@/lib/import-utils"

export async function GET(req: Request) {
  try {
    const { error: authError } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "student"

    if (!["student", "teacher", "parent"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const buffer = generateTemplate(type)
    const typeLabels: Record<string, string> = { student: "alunos", teacher: "professores", parent: "encarregados" }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="template_${typeLabels[type]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
