import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.schoolId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    if (!q || q.length < 2) {
      return NextResponse.json({ students: [], teachers: [], classes: [], subjects: [] })
    }

    const schoolId = session.user.schoolId
    const contains = { contains: q, mode: "insensitive" as const }

    const [students, teachers, classes, subjects] = await Promise.all([
      prisma.student.findMany({
        where: { schoolId, name: contains },
        take: 5,
        select: { id: true, name: true },
      }),
      prisma.teacher.findMany({
        where: { schoolId, name: contains },
        take: 5,
        select: { id: true, name: true },
      }),
      prisma.class.findMany({
        where: { schoolId, name: contains },
        take: 5,
        select: { id: true, name: true },
      }),
      prisma.subject.findMany({
        where: { schoolId, name: contains },
        take: 5,
        select: { id: true, name: true },
      }),
    ])

    return NextResponse.json({ students, teachers, classes, subjects })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
