import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId, requireFeature } from "@/lib/api-auth"
import { evaluateClass } from "@/lib/evaluation-engine"

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const featureError = requireFeature(session!, "evaluationEngine")
    if (featureError) return featureError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { classId, academicYearId } = body

    if (!classId || !academicYearId) {
      return NextResponse.json({ error: "classId e academicYearId são obrigatórios" }, { status: 400 })
    }

    // Verify academic year is in closing state
    const year = await prisma.academicYear.findFirst({ where: { id: academicYearId, schoolId } })
    if (!year) return NextResponse.json({ error: "Ano letivo não encontrado" }, { status: 404 })
    if (year.status !== "em_encerramento") {
      return NextResponse.json({
        error: "O ano letivo deve estar em encerramento para finalizar avaliações",
      }, { status: 400 })
    }

    // Run evaluation
    const evaluations = await evaluateClass(classId, academicYearId, schoolId)
    const now = new Date()

    // Write results to enrollment records and create academic history
    for (const eval_ of evaluations) {
      await prisma.$transaction([
        // Update enrollment
        prisma.enrollment.update({
          where: { id: eval_.enrollmentId },
          data: {
            status: eval_.status,
            finalAverage: eval_.generalAverage,
            failedSubjects: eval_.failedSubjectCount,
            observation: eval_.observation,
            decidedAt: now,
          },
        }),
        // Create academic history snapshot
        prisma.academicHistory.upsert({
          where: {
            studentId_academicYearId_schoolId: {
              studentId: eval_.studentId,
              academicYearId,
              schoolId,
            },
          },
          update: {
            finalAverage: eval_.generalAverage,
            status: eval_.status,
            failedSubjects: eval_.failedSubjectCount,
            observation: eval_.observation,
            subjectResults: eval_.subjectResults.map((s) => ({
              subjectName: s.subjectName,
              t1: s.t1,
              t2: s.t2,
              t3: s.t3,
              final: s.finalAverage,
            })),
            decidedAt: now,
          },
          create: {
            studentId: eval_.studentId,
            academicYearId,
            schoolId,
            grade: eval_.grade,
            className: `${eval_.grade}ª Classe`,
            finalAverage: eval_.generalAverage,
            status: eval_.status,
            failedSubjects: eval_.failedSubjectCount,
            observation: eval_.observation,
            subjectResults: eval_.subjectResults.map((s) => ({
              subjectName: s.subjectName,
              t1: s.t1,
              t2: s.t2,
              t3: s.t3,
              final: s.finalAverage,
            })),
            decidedAt: now,
          },
        }),
      ])
    }

    const summary = {
      total: evaluations.length,
      aprovados: evaluations.filter((e) => e.status === "aprovada").length,
      reprovados: evaluations.filter((e) => e.status === "reprovada").length,
      emRecurso: evaluations.filter((e) => e.status === "em_recurso").length,
    }

    return NextResponse.json({
      success: true,
      message: `Avaliações finalizadas para ${evaluations.length} aluno(s).`,
      summary,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
