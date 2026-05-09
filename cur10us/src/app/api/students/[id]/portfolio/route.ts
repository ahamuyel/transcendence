import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, grade: true, period: true } },
        school: { select: { id: true, name: true, city: true, logo: true } },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    // Multi-tenant security: verify access
    const userRole = session.user.role
    const userSchoolId = session.user.schoolId

    if (userSchoolId !== student.schoolId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Role-based access: school_admin always, teacher if teaches the student, student if self, parent if linked
    if (userRole === "student" && student.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }
    if (userRole === "parent") {
      const parent = await prisma.parent.findUnique({
        where: { userId: session.user.id },
        select: { students: { select: { id: true } } },
      })
      if (!parent || !parent.students.some((s) => s.id === id)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    // Fetch results and attendance
    const [results, attendances] = await Promise.all([
      prisma.result.findMany({
        where: { studentId: id, schoolId: student.schoolId },
        include: { subject: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.attendance.findMany({
        where: { studentId: id, schoolId: student.schoolId },
      }),
    ])

    // Group results by subject for averages
    const subjectMap: Record<string, { name: string; scores: number[] }> = {}
    for (const r of results) {
      if (!subjectMap[r.subjectId]) {
        subjectMap[r.subjectId] = { name: r.subject.name, scores: [] }
      }
      subjectMap[r.subjectId].scores.push(r.score)
    }
    const averages = Object.entries(subjectMap).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.name,
      average: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10,
      count: data.scores.length,
    }))

    // Attendance summary
    const presente = attendances.filter((a) => a.status === "presente").length
    const ausente = attendances.filter((a) => a.status === "ausente").length
    const atrasado = attendances.filter((a) => a.status === "atrasado").length
    const total = attendances.length
    const attendancePercent = total > 0 ? Math.round(((presente + atrasado) / total) * 100) : 0

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        foto: student.foto,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        documentType: student.documentType,
        documentNumber: student.documentNumber,
        class: student.class,
        school: student.school,
      },
      results: results.map((r) => ({
        id: r.id,
        subjectName: r.subject.name,
        score: r.score,
        type: r.type,
        date: r.date,
      })),
      attendance: { total, presente, ausente, atrasado, percent: attendancePercent },
      averages,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
