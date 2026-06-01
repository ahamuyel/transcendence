import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { createEducationCycleSchema } from "@/lib/validations/catalog"

export async function GET() {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const data = await prisma.educationCycle.findMany({
      orderBy: { startGrade: "asc" },
      include: { _count: { select: { globalClasses: true } } },
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("[catalog/cycles]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const parsed = createEducationCycleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    if (parsed.data.startGrade >= parsed.data.endGrade) {
      return NextResponse.json({ error: "A classe inicial deve ser inferior à classe final" }, { status: 400 })
    }

    const existing = await prisma.educationCycle.findFirst({
      where: { OR: [{ name: parsed.data.name }, { level: parsed.data.level }] },
    })
    if (existing) {
      return NextResponse.json({ error: "Ciclo com este nome ou nível já existe" }, { status: 409 })
    }

    const cycle = await prisma.educationCycle.create({ data: parsed.data })
    return NextResponse.json(cycle, { status: 201 })
  } catch (err) {
    console.error("[catalog/cycles]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
