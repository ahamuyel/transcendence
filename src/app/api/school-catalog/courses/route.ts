import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageCourses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const globalCourses = await prisma.globalCourse.findMany({
      where: {
        active: true,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      },
      orderBy: { name: "asc" },
      include: {
        schoolCourses: {
          where: { schoolId },
          select: { id: true, localName: true, active: true },
        },
      },
    })

    const data = globalCourses.map((gc) => ({
      ...gc,
      adopted: gc.schoolCourses.length > 0,
      localName: gc.schoolCourses[0]?.localName || null,
      schoolCourseId: gc.schoolCourses[0]?.id || null,
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
      "canManageCourses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { globalCourseId, localName } = body

    if (!globalCourseId) {
      return NextResponse.json({ error: "globalCourseId é obrigatório" }, { status: 400 })
    }

    const globalCourse = await prisma.globalCourse.findUnique({ where: { id: globalCourseId } })
    if (!globalCourse) {
      return NextResponse.json({ error: "Curso global não encontrado" }, { status: 404 })
    }

    const existing = await prisma.schoolCourse.findFirst({ where: { globalCourseId, schoolId } })
    if (existing) {
      return NextResponse.json({ error: "Este curso já está adoptado por esta escola" }, { status: 409 })
    }

    const [schoolCourse, course] = await prisma.$transaction([
      prisma.schoolCourse.create({
        data: { globalCourseId, schoolId, localName: localName || null },
      }),
      prisma.course.create({
        data: {
          name: localName || globalCourse.name,
          globalCourseId,
          schoolId,
        },
      }),
    ])

    return NextResponse.json({ schoolCourse, course }, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
