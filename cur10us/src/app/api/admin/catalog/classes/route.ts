import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { createGlobalClassSchema } from "@/lib/validations/catalog"

export async function GET(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const cycleId = searchParams.get("cycleId")

    const where = {
      ...(cycleId ? { cycleId } : {}),
    }

    const data = await prisma.globalClass.findMany({
      where,
      orderBy: { grade: "asc" },
      include: {
        cycle: true,
        _count: { select: { schoolClasses: true } },
      },
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("[catalog/classes]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const parsed = createGlobalClassSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const existing = await prisma.globalClass.findFirst({
      where: { OR: [{ name: parsed.data.name }, { grade: parsed.data.grade }] },
    })
    if (existing) {
      return NextResponse.json({ error: "Classe global com este nome ou nível já existe" }, { status: 409 })
    }

    const globalClass = await prisma.globalClass.create({
      data: parsed.data,
      include: { cycle: true },
    })
    return NextResponse.json(globalClass, { status: 201 })
  } catch (err) {
    console.error("[catalog/classes]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
