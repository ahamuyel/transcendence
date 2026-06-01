import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageSubjects",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const globalSubjects = await prisma.globalSubject.findMany({
      where: {
        active: true,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      },
      orderBy: { name: "asc" },
      include: {
        schoolSubjects: {
          where: { schoolId },
          select: { id: true, localName: true, active: true },
        },
      },
    })

    const data = globalSubjects.map((gs) => ({
      ...gs,
      adopted: gs.schoolSubjects.length > 0,
      localName: gs.schoolSubjects[0]?.localName || null,
      adoptionActive: gs.schoolSubjects[0]?.active ?? false,
      schoolSubjectId: gs.schoolSubjects[0]?.id || null,
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
      "canManageSubjects",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { globalSubjectId, localName } = body

    if (!globalSubjectId) {
      return NextResponse.json({ error: "globalSubjectId é obrigatório" }, { status: 400 })
    }

    const globalSubject = await prisma.globalSubject.findUnique({ where: { id: globalSubjectId } })
    if (!globalSubject) {
      return NextResponse.json({ error: "Disciplina global não encontrada" }, { status: 404 })
    }

    const existing = await prisma.schoolSubject.findFirst({
      where: { globalSubjectId, schoolId },
    })
    if (existing) {
      return NextResponse.json({ error: "Esta disciplina já está adoptada por esta escola" }, { status: 409 })
    }

    // Create school-level mapping AND local Subject record
    const [schoolSubject, subject] = await prisma.$transaction([
      prisma.schoolSubject.create({
        data: { globalSubjectId, schoolId, localName: localName || null },
      }),
      prisma.subject.create({
        data: {
          name: localName || globalSubject.name,
          globalSubjectId,
          schoolId,
        },
      }),
    ])

    return NextResponse.json({ schoolSubject, subject }, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
