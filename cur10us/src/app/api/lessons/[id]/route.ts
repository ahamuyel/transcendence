import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateLessonSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    })

    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateLessonSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { materials, subjectId, classId: cId, teacherId, ...rest } = parsed.data

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...rest,
        ...(subjectId !== undefined ? { subject: { connect: { id: subjectId } } } : {}),
        ...(cId !== undefined ? { class: { connect: { id: cId } } } : {}),
        ...(teacherId !== undefined ? { teacher: { connect: { id: teacherId } } } : {}),
        ...(materials !== undefined ? { materials: materials ? (materials as unknown as Prisma.InputJsonValue) : Prisma.JsonNull } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
