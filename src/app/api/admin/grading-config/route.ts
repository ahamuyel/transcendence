import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { createGradingConfigSchema } from "@/lib/validations/catalog"

export async function GET(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const classGrade = searchParams.get("classGrade")

    const data = await prisma.globalGradingConfig.findMany({
      where: {
        ...(classGrade ? { classGrade: parseInt(classGrade) } : {}),
      },
      orderBy: [{ classGrade: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const parsed = createGradingConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const config = await prisma.globalGradingConfig.create({
      data: {
        classGrade: parsed.data.classGrade || null,
        courseId: parsed.data.courseId || null,
        trimesterWeights: parsed.data.trimesterWeights ?? undefined,
        passingGrade: parsed.data.passingGrade ?? 10,
        resourceMinGrade: parsed.data.resourceMinGrade ?? null,
        maxFailedSubjects: parsed.data.maxFailedSubjects ?? 2,
        trimesterFormula: parsed.data.trimesterFormula ?? undefined,
        finalFormula: parsed.data.finalFormula ?? undefined,
        directFailGrade: parsed.data.directFailGrade ?? null,
        roundingMode: parsed.data.roundingMode || "arredondar",
        roundingScale: parsed.data.roundingScale ?? 1,
        recursoAllowed: parsed.data.recursoAllowed ?? true,
      },
    })

    return NextResponse.json(config, { status: 201 })
  } catch (err) {
    if (String(err).includes("Unique constraint")) {
      return NextResponse.json({ error: "Já existe uma configuração global com esta combinação de classe/curso" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
