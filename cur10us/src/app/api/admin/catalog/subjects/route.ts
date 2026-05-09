import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { createGlobalSubjectSchema } from "@/lib/validations/catalog"

export async function GET(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const active = searchParams.get("active")

    const where = {
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(active !== null && active !== undefined ? { active: active === "true" } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.globalSubject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: { _count: { select: { schoolSubjects: true } } },
      }),
      prisma.globalSubject.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error("[catalog/subjects GET]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const parsed = createGlobalSubjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const existing = await prisma.globalSubject.findFirst({
      where: { OR: [{ name: parsed.data.name }, { code: parsed.data.code }] },
    })
    if (existing) {
      return NextResponse.json({ error: "Disciplina global com este nome ou código já existe" }, { status: 409 })
    }

    const subject = await prisma.globalSubject.create({ data: parsed.data })
    return NextResponse.json(subject, { status: 201 })
  } catch (err) {
    console.error("[catalog/subjects POST]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
