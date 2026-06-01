import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { evaluateStudent } from "@/lib/evaluation-engine"

// GET: List students in recurso for this academic year
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id: academicYearId } = await params

    const enrollments = await prisma.enrollment.findMany({
      where: { academicYearId, schoolId, status: "em_recurso" },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, grade: true } },
      },
    })

    return NextResponse.json({ data: enrollments })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST: Resolve recurso for a student
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id: academicYearId } = await params
    const body = await req.json()
    const { enrollmentId, subjectScores, decision } = body

    // subjectScores: [{ subjectId: string, score: number }]
    // decision: "aprovada" | "reprovada"

    if (!enrollmentId || !decision) {
      return NextResponse.json({ error: "enrollmentId e decision são obrigatórios" }, { status: 400 })
    }

    if (!["aprovada", "reprovada"].includes(decision)) {
      return NextResponse.json({ error: "decision deve ser 'aprovada' ou 'reprovada'" }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, academicYearId, schoolId, status: "em_recurso" },
    })
    if (!enrollment) {
      return NextResponse.json({ error: "Matrícula em recurso não encontrada" }, { status: 404 })
    }

    // If new scores provided, create result records for the recurso
    if (subjectScores && Array.isArray(subjectScores)) {
      for (const { subjectId, score } of subjectScores) {
        await prisma.result.create({
          data: {
            score,
            type: "recurso",
            date: new Date(),
            trimester: null,
            academicYear: null,
            academicYearId,
            studentId: enrollment.studentId,
            subjectId,
            schoolId,
          },
        })
      }
    }

    // Re-evaluate student with new scores
    const evaluation = await evaluateStudent(enrollment.studentId, academicYearId, schoolId)

    // Apply the admin's decision (override if needed)
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: decision,
        finalAverage: evaluation?.generalAverage || enrollment.finalAverage,
        observation: `Recurso resolvido: ${decision}. ${evaluation?.observation || ""}`,
        decidedAt: new Date(),
      },
    })

    // Update academic history
    if (evaluation) {
      await prisma.academicHistory.updateMany({
        where: { studentId: enrollment.studentId, academicYearId, schoolId },
        data: {
          status: decision,
          finalAverage: evaluation.generalAverage,
          observation: `Recurso: ${decision}`,
          decidedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Recurso resolvido: aluno ${decision === "aprovada" ? "aprovado" : "reprovado"}.`,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
