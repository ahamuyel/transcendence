import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateResultSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    })

    if (!result || result.schoolId !== schoolId) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.result.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateResultSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { date, ...rest } = parsed.data

    const result = await prisma.result.update({
      where: { id },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.result.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    await prisma.result.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
