import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const userId = session.user.id

    // Uma única query paralela por tabela — sem JOINs em cascata
    const [user, adminPerm, teacher, student, parent] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          isActive: true,
          school: { select: { id: true, name: true, slug: true, city: true, logo: true } },
        },
      }),
      prisma.adminPermission.findUnique({
        where: { userId },
        select: {
          school: { select: { id: true, name: true, slug: true, city: true, logo: true } },
        },
      }),
      prisma.teacher.findUnique({
        where: { userId },
        select: {
          school: { select: { id: true, name: true, slug: true, city: true, logo: true } },
        },
      }),
      prisma.student.findUnique({
        where: { userId },
        select: {
          school: { select: { id: true, name: true, slug: true, city: true, logo: true } },
        },
      }),
      prisma.parent.findUnique({
        where: { userId },
        select: {
          school: { select: { id: true, name: true, slug: true, city: true, logo: true } },
        },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 })
    }

    type SchoolEntry = {
      id: string
      name: string
      slug: string
      city: string | null
      logo: string | null
      roles: string[]
      status: string
    }

    const schoolMap = new Map<string, SchoolEntry>()

    const upsert = (
      school: { id: string; name: string; slug: string; city: string | null; logo: string | null },
      role: string,
      status = "activo"
    ) => {
      if (!schoolMap.has(school.id)) {
        schoolMap.set(school.id, { ...school, roles: [], status })
      }
      schoolMap.get(school.id)!.roles.push(role)
    }

    if (user.school && user.role) {
      upsert(user.school, user.role, user.isActive ? "activo" : "pendente")
    }
    if (adminPerm?.school) upsert(adminPerm.school, "school_admin")
    if (teacher?.school)   upsert(teacher.school, "teacher")
    if (student?.school)   upsert(student.school, "student")
    if (parent?.school)    upsert(parent.school, "parent")

    return NextResponse.json(Array.from(schoolMap.values()), {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    })
  } catch (error) {
    console.error("Error fetching user schools:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}