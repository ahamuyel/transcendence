import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createSubjectSchema } from "@/lib/validations/academic"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageSubjects", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = {
      schoolId,
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.subject.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageSubjects", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createSubjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Verificar que a disciplina global existe
    const globalSubject = await prisma.globalSubject.findUnique({
      where: { id: parsed.data.globalSubjectId },
    })
    if (!globalSubject) {
      return NextResponse.json({ error: "Disciplina global não encontrada. Use o catálogo global." }, { status: 404 })
    }

    const existing = await prisma.subject.findFirst({
      where: { name: parsed.data.name, schoolId },
    })
    if (existing) {
      return NextResponse.json({ error: "Esta disciplina já existe nesta escola" }, { status: 409 })
    }

    // Criar disciplina local + mapeamento escola↔global
    const [subject] = await prisma.$transaction([
      prisma.subject.create({
        data: { name: parsed.data.name, globalSubjectId: parsed.data.globalSubjectId, schoolId },
      }),
      prisma.schoolSubject.upsert({
        where: { globalSubjectId_schoolId: { globalSubjectId: parsed.data.globalSubjectId, schoolId } },
        update: { active: true, localName: parsed.data.name !== globalSubject.name ? parsed.data.name : null },
        create: { globalSubjectId: parsed.data.globalSubjectId, schoolId, localName: parsed.data.name !== globalSubject.name ? parsed.data.name : null },
      }),
    ])
    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
