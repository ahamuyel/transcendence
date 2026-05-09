import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { updateGradingConfigSchema } from "@/lib/validations/catalog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const config = await prisma.globalGradingConfig.findUnique({
      where: { id },
      include: { _count: { select: { schoolConfigs: true } } },
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
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const body = await req.json()
    const parsed = updateGradingConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...parsed.data }
    // Handle JSON null for Prisma
    if (data.trimesterWeights === null) data.trimesterWeights = undefined
    if (data.trimesterFormula === null) data.trimesterFormula = undefined
    if (data.finalFormula === null) data.finalFormula = undefined

    const config = await prisma.globalGradingConfig.update({ where: { id }, data })
    return NextResponse.json(config)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const usageCount = await prisma.gradingConfig.count({ where: { globalGradingConfigId: id } })
    if (usageCount > 0) {
      return NextResponse.json({
        error: `Não é possível eliminar: ${usageCount} escola(s) utilizam esta configuração`,
      }, { status: 409 })
    }

    await prisma.globalGradingConfig.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
