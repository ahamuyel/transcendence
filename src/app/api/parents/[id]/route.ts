import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateParentSchema } from "@/lib/validations/entities"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { students: { select: { id: true, name: true } } },
    })

    if (!parent || parent.schoolId !== schoolId) {
      return NextResponse.json({ error: "Encarregado não encontrado" }, { status: 404 })
    }
    return NextResponse.json(parent)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageParents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.parent.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Encarregado não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateParentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { studentIds, ...data } = parsed.data

    // Validate studentIds belong to the same school
    if (studentIds?.length) {
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, schoolId: true },
      })
      const invalidStudents = students.filter((s) => s.schoolId !== schoolId)
      if (invalidStudents.length > 0 || students.length !== studentIds.length) {
        return NextResponse.json({ error: "Um ou mais alunos não pertencem a esta escola" }, { status: 400 })
      }
    }

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        ...data,
        ...(studentIds !== undefined && {
          students: { set: studentIds.map((id) => ({ id })) },
        }),
      },
      include: { students: { select: { id: true, name: true } } },
    })

    return NextResponse.json(parent)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageParents", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.parent.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Encarregado não encontrado" }, { status: 404 })
    }

    await prisma.parent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
