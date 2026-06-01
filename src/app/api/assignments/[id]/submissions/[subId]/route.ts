import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { evaluateSubmissionSchema } from "@/lib/validations/academic"
import { createNotification } from "@/lib/notifications"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { subId } = await params

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: subId },
      include: {
        student: { select: { id: true, name: true } },
        assignment: { select: { id: true, title: true, maxScore: true } },
      },
    })

    if (!submission || submission.schoolId !== schoolId) {
      return NextResponse.json({ error: "Submissão não encontrada" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { subId } = await params

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: subId },
      include: {
        student: { select: { id: true, userId: true, name: true } },
        assignment: { select: { title: true } },
      },
    })
    if (!submission || submission.schoolId !== schoolId) {
      return NextResponse.json({ error: "Submissão não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = evaluateSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: subId },
      data: {
        score: parsed.data.score,
        feedback: parsed.data.feedback || null,
        status: "avaliada",
        evaluatedAt: new Date(),
      },
    })

    // Notify student
    if (submission.student?.userId) {
      await createNotification({
        userId: submission.student.userId,
        title: `Tarefa avaliada: ${submission.assignment?.title}`,
        message: `Nota: ${parsed.data.score}${parsed.data.feedback ? ` — ${parsed.data.feedback.slice(0, 50)}` : ""}`,
        type: "tarefa",
        link: `/list/assignments`,
        schoolId,
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
