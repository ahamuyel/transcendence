import { NextResponse } from "next/server"
import { requirePermission, getSchoolId, requireFeature } from "@/lib/api-auth"
import { evaluateStudent } from "@/lib/evaluation-engine"

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
    const studentId = searchParams.get("studentId")
    const academicYearId = searchParams.get("academicYearId")

    if (!studentId || !academicYearId) {
      return NextResponse.json({ error: "studentId e academicYearId são obrigatórios" }, { status: 400 })
    }

    const evaluation = await evaluateStudent(studentId, academicYearId, schoolId)
    if (!evaluation) {
      return NextResponse.json({ error: "Matrícula não encontrada para este aluno/ano" }, { status: 404 })
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
