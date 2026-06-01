import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createSubmissionSchema } from "@/lib/validations/academic"
import { createNotification } from "@/lib/notifications"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const assignment = await prisma.assignment.findUnique({ where: { id } })
    if (!assignment || assignment.schoolId !== schoolId) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: id, schoolId },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { submittedAt: "desc" },
    })

    return NextResponse.json({ data: submissions })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id } = await params

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { teacher: { select: { userId: true } } },
    })
    if (!assignment || assignment.schoolId !== schoolId) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    const student = await prisma.student.findFirst({ where: { userId, schoolId }, select: { id: true } })
    if (!student) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado" }, { status: 404 })
    }

    // Check existing submission
    const existing = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId: student.id } },
    })
    if (existing && (existing.status === "entregue" || existing.status === "avaliada")) {
      return NextResponse.json({ error: "Já submeteu esta tarefa" }, { status: 400 })
    }

    const body = await req.json()
    const parsed = createSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const isPastDue = new Date(assignment.dueDate) < new Date()
    const status = isPastDue ? "atrasada" : "entregue"

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: id, studentId: student.id } },
      create: {
        assignmentId: id,
        studentId: student.id,
        content: parsed.data.content || null,
        attachmentUrl: parsed.data.attachmentUrl || null,
        status,
        submittedAt: new Date(),
        schoolId,
      },
      update: {
        content: parsed.data.content || null,
        attachmentUrl: parsed.data.attachmentUrl || null,
        status,
        submittedAt: new Date(),
      },
    })

    // Notify teacher
    if (assignment.teacher?.userId) {
      await createNotification({
        userId: assignment.teacher.userId,
        title: `Submissão: ${assignment.title}`,
        message: `Um aluno submeteu a tarefa "${assignment.title}"`,
        type: "tarefa",
        link: `/list/assignments`,
        schoolId,
      })
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
