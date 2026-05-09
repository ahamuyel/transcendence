import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createLessonSchema } from "@/lib/validations/academic"
import { buildOrderBy } from "@/lib/query-helpers"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const classId = searchParams.get("classId") || ""
    const subjectId = searchParams.get("subjectId") || ""
    const teacherId = searchParams.get("teacherId") || ""
    const day = searchParams.get("day") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      ...(classId ? { classId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(teacherId ? { teacherId } : {}),
      ...(day ? { day } : {}),
      ...(search
        ? {
            OR: [
              { subject: { name: { contains: search, mode: "insensitive" as const } } },
              { class: { name: { contains: search, mode: "insensitive" as const } } },
              { teacher: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    }

    // Teacher: auto-filter to own lessons
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({ where: { userId, schoolId }, select: { id: true } })
      if (teacher) where.teacherId = teacher.id
    }

    const orderBy = buildOrderBy(searchParams, ["day", "startTime", "createdAt"], { day: "asc" })

    const [data, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
        },
      }),
      prisma.lesson.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createLessonSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { materials, ...rest } = parsed.data
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, body.academicYearId)

    const created = await prisma.lesson.create({
      data: {
        ...rest,
        materials: materials || undefined,
        academicYearId: academicYearId || null,
        schoolId,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
