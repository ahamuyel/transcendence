import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createCourseSchema } from "@/lib/validations/academic"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageCourses", { requireSchool: true })
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
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          courseSubjects: { include: { subject: true } },
        },
      }),
      prisma.course.count({ where }),
    ])

    const mapped = data.map((c) => ({
      ...c,
      subjects: c.courseSubjects.map((cs) => cs.subject.name),
      subjectIds: c.courseSubjects.map((cs) => cs.subjectId),
    }))

    return NextResponse.json({ data: mapped, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageCourses", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createCourseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Verificar que o curso global existe
    const globalCourse = await prisma.globalCourse.findUnique({
      where: { id: parsed.data.globalCourseId },
    })
    if (!globalCourse) {
      return NextResponse.json({ error: "Curso global não encontrado. Use o catálogo global." }, { status: 404 })
    }

    const existing = await prisma.course.findFirst({
      where: { name: parsed.data.name, schoolId },
    })
    if (existing) {
      return NextResponse.json({ error: "Este curso já existe nesta escola" }, { status: 409 })
    }

    const { subjectIds, globalCourseId, ...courseData } = parsed.data

    // Criar curso local + mapeamento escola↔global
    const [course] = await prisma.$transaction([
      prisma.course.create({
        data: {
          ...courseData,
          globalCourseId,
          schoolId,
          courseSubjects: subjectIds?.length
            ? { create: subjectIds.map((subjectId) => ({ subjectId })) }
            : undefined,
        },
      }),
      prisma.schoolCourse.upsert({
        where: { globalCourseId_schoolId: { globalCourseId, schoolId } },
        update: { active: true, localName: courseData.name !== globalCourse.name ? courseData.name : null },
        create: { globalCourseId, schoolId, localName: courseData.name !== globalCourse.name ? courseData.name : null },
      }),
    ])
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
