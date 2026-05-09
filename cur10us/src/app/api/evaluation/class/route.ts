import { NextResponse } from "next/server"
import { requirePermission, getSchoolId, requireFeature } from "@/lib/api-auth"
import { evaluateClass } from "@/lib/evaluation-engine"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const featureError = requireFeature(session!, "evaluationEngine")
    if (featureError) return featureError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const academicYearId = searchParams.get("academicYearId")

    if (!classId || !academicYearId) {
      return NextResponse.json({ error: "classId e academicYearId são obrigatórios" }, { status: 400 })
    }

    const evaluations = await evaluateClass(classId, academicYearId, schoolId)

    const summary = {
      total: evaluations.length,
      aprovados: evaluations.filter((e) => e.status === "aprovada").length,
      reprovados: evaluations.filter((e) => e.status === "reprovada").length,
      emRecurso: evaluations.filter((e) => e.status === "em_recurso").length,
      classAverage: evaluations.length > 0
        ? Math.round(
            (evaluations
              .filter((e) => e.generalAverage !== null)
              .reduce((sum, e) => sum + e.generalAverage!, 0) /
              evaluations.filter((e) => e.generalAverage !== null).length) * 100
          ) / 100
        : null,
    }

    return NextResponse.json({ evaluations, summary })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
