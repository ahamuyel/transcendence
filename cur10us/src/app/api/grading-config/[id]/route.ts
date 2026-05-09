import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateGradingConfigSchema } from "@/lib/validations/catalog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const config = await prisma.gradingConfig.findFirst({
      where: { id, schoolId },
      include: {
        academicYear: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    })
    if (!config) return NextResponse.json({ error: "Configuração não encontrada" }, { status: 404 })

    return NextResponse.json(config)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const body = await req.json()
    const parsed = updateGradingConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const existing = await prisma.gradingConfig.findFirst({ where: { id, schoolId } })
    if (!existing) return NextResponse.json({ error: "Configuração não encontrada" }, { status: 404 })

    const { trimesterWeights, trimesterFormula, finalFormula, academicYearId, courseId, ...rest } = parsed.data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...rest }
    if (trimesterWeights !== undefined) data.trimesterWeights = trimesterWeights === null ? Prisma.JsonNull : trimesterWeights
    if (trimesterFormula !== undefined) data.trimesterFormula = trimesterFormula === null ? Prisma.JsonNull : trimesterFormula
    if (finalFormula !== undefined) data.finalFormula = finalFormula === null ? Prisma.JsonNull : finalFormula
    if (academicYearId !== undefined) data.academicYearId = academicYearId
    if (courseId !== undefined) data.courseId = courseId

    const config = await prisma.gradingConfig.update({ where: { id }, data })

    return NextResponse.json(config)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.gradingConfig.findFirst({ where: { id, schoolId } })
    if (!existing) return NextResponse.json({ error: "Configuração não encontrada" }, { status: 404 })

    await prisma.gradingConfig.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
