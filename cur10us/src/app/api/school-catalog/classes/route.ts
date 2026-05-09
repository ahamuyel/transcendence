import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageClasses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const cycleId = searchParams.get("cycleId")

    const globalClasses = await prisma.globalClass.findMany({
      where: {
        active: true,
        ...(cycleId ? { cycleId } : {}),
      },
      orderBy: { grade: "asc" },
      include: {
        cycle: true,
        schoolClasses: {
          where: { schoolId },
          select: { id: true, localName: true, active: true },
        },
      },
    })

    const data = globalClasses.map((gc) => ({
      ...gc,
      adopted: gc.schoolClasses.length > 0,
      localName: gc.schoolClasses[0]?.localName || null,
      schoolClassId: gc.schoolClasses[0]?.id || null,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageClasses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { globalClassId, localName } = body

    if (!globalClassId) {
      return NextResponse.json({ error: "globalClassId é obrigatório" }, { status: 400 })
    }

    const globalClass = await prisma.globalClass.findUnique({ where: { id: globalClassId } })
    if (!globalClass) return NextResponse.json({ error: "Classe global não encontrada" }, { status: 404 })

    const existing = await prisma.schoolClass.findFirst({ where: { globalClassId, schoolId } })
    if (existing) {
      return NextResponse.json({ error: "Esta classe já está adoptada por esta escola" }, { status: 409 })
    }

    const schoolClass = await prisma.schoolClass.create({
      data: { globalClassId, schoolId, localName: localName || null },
    })

    return NextResponse.json(schoolClass, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
