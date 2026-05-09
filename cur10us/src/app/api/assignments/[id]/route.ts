import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateAssignmentSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { id } = await params

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
        ...(role !== "student" ? {
          submissions: {
            include: { student: { select: { id: true, name: true } } },
            orderBy: { submittedAt: "desc" as const },
          },
        } : {
          submissions: {
            where: { student: { userId } },
            take: 1,
          },
        }),
      },
    })

    if (!assignment || assignment.schoolId !== schoolId) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.assignment.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateAssignmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { dueDate, description, maxScore, ...rest } = parsed.data

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...rest,
        ...(description !== undefined ? { description: description || null } : {}),
        ...(maxScore !== undefined ? { maxScore } : {}),
        ...(dueDate !== undefined ? { dueDate: new Date(dueDate) } : {}),
      },
    })
    return NextResponse.json(assignment)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageAssignments", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.assignment.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    await prisma.assignment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
