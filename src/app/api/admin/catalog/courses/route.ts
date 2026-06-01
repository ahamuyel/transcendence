import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { createGlobalCourseSchema } from "@/lib/validations/catalog"

export async function GET(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""

    const where = {
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.globalCourse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: { _count: { select: { schoolCourses: true } } },
      }),
      prisma.globalCourse.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error("[catalog/courses]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const parsed = createGlobalCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const existing = await prisma.globalCourse.findFirst({
      where: { OR: [{ name: parsed.data.name }, { code: parsed.data.code }] },
    })
    if (existing) {
      return NextResponse.json({ error: "Curso global com este nome ou código já existe" }, { status: 409 })
    }

    const course = await prisma.globalCourse.create({ data: parsed.data })
    return NextResponse.json(course, { status: 201 })
  } catch (err) {
    console.error("[catalog/courses]", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
