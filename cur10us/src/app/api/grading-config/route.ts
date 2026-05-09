import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId, requireFeature } from "@/lib/api-auth"
import { createGradingConfigSchema } from "@/lib/validations/catalog"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const featureError = requireFeature(session!, "evaluationEngine")
    if (featureError) return featureError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const academicYearId = searchParams.get("academicYearId")

    // Buscar configs da escola + configs globais disponíveis
    const [data, globalConfigs] = await Promise.all([
      prisma.gradingConfig.findMany({
        where: {
          schoolId,
          ...(academicYearId ? { academicYearId } : {}),
        },
        include: {
          academicYear: { select: { id: true, name: true } },
          course: { select: { id: true, name: true } },
          globalGradingConfig: true,
        },
        orderBy: [{ classGrade: "asc" }, { createdAt: "desc" }],
      }),
      prisma.globalGradingConfig.findMany({
        where: { active: true },
        orderBy: [{ classGrade: "asc" }, { createdAt: "desc" }],
      }),
    ])

    return NextResponse.json({ data, globalConfigs })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createGradingConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Suporta herança: se globalGradingConfigId fornecido, herda e aplica overrides
    const globalGradingConfigId = body.globalGradingConfigId || null
    const overrides = body.overrides || null

    const config = await prisma.gradingConfig.create({
      data: {
        schoolId,
        academicYearId: parsed.data.academicYearId || null,
        classGrade: parsed.data.classGrade || null,
        courseId: parsed.data.courseId || null,
        globalGradingConfigId,
        overrides: overrides ?? undefined,
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
      return NextResponse.json({ error: "Já existe uma configuração com esta combinação de ano/classe/curso" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
