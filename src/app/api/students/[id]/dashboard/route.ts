import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id: studentId } = await params

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { select: { id: true, name: true, grade: true } },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    // Multi-tenant + role security
    if (session.user.schoolId !== student.schoolId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }
    if (session.user.role === "student" && student.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }
    if (session.user.role === "parent") {
      const parent = await prisma.parent.findUnique({
        where: { userId: session.user.id },
        select: { students: { select: { id: true } } },
      })
      if (!parent || !parent.students.some((s) => s.id === studentId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    const now = new Date()

    // Fetch all data in parallel
    const [results, attendances, upcomingExams, upcomingAssignments, pendingSubmissions] = await Promise.all([
      prisma.result.findMany({
        where: { studentId, schoolId: student.schoolId },
        include: { subject: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.attendance.findMany({
        where: { studentId, schoolId: student.schoolId },
        orderBy: { date: "asc" },
      }),
      prisma.exam.findMany({
        where: {
          classId: student.classId || undefined,
          date: { gte: now },
        },
        include: { subject: { select: { name: true } } },
        orderBy: { date: "asc" },
        take: 5,
      }),
      prisma.assignment.findMany({
        where: {
          classId: student.classId || undefined,
          dueDate: { gte: now },
        },
        include: { subject: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.assignmentSubmission.count({
        where: { studentId, status: "pendente" },
      }),
    ])

    // --- General average ---
    const allScores = results.map((r) => r.score)
    const generalAverage = allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
      : 0

    // --- Subject averages ---
    const subjectMap: Record<string, { name: string; scores: number[] }> = {}
    for (const r of results) {
      if (!subjectMap[r.subjectId]) {
        subjectMap[r.subjectId] = { name: r.subject.name, scores: [] }
      }
      subjectMap[r.subjectId].scores.push(r.score)
    }
    const subjectAverages = Object.entries(subjectMap).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.name,
      average: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10,
      count: data.scores.length,
    }))

    // --- Attendance summary ---
    const presente = attendances.filter((a) => a.status === "presente").length
    const ausente = attendances.filter((a) => a.status === "ausente").length
    const atrasado = attendances.filter((a) => a.status === "atrasado").length
    const totalAttendance = attendances.length
    const attendancePercent = totalAttendance > 0
      ? Math.round(((presente + atrasado) / totalAttendance) * 100)
      : 0

    // --- Attendance by month (for trend chart) ---
    const attendanceByMonth: { month: string; presente: number; ausente: number; atrasado: number; percent: number }[] = []
    const monthMap: Record<string, { p: number; au: number; at: number }> = {}
    for (const a of attendances) {
      const d = new Date(a.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (!monthMap[key]) monthMap[key] = { p: 0, au: 0, at: 0 }
      if (a.status === "presente") monthMap[key].p++
      else if (a.status === "ausente") monthMap[key].au++
      else if (a.status === "atrasado") monthMap[key].at++
    }
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    for (const [key, counts] of Object.entries(monthMap).sort()) {
      const monthIdx = parseInt(key.split("-")[1]) - 1
      const total = counts.p + counts.au + counts.at
      attendanceByMonth.push({
        month: monthNames[monthIdx],
        presente: counts.p,
        ausente: counts.au,
        atrasado: counts.at,
        percent: total > 0 ? Math.round(((counts.p + counts.at) / total) * 100) : 0,
      })
    }

    // --- Results by trimester (for evolution chart) ---
    const trimesterMap: Record<string, Record<string, { name: string; scores: number[] }>> = {}
    const trimesterLabels: Record<string, string> = {
      primeiro: "1º Trimestre",
      segundo: "2º Trimestre",
      terceiro: "3º Trimestre",
    }
    for (const r of results) {
      const tri = r.trimester || "primeiro"
      if (!trimesterMap[tri]) trimesterMap[tri] = {}
      if (!trimesterMap[tri][r.subjectId]) {
        trimesterMap[tri][r.subjectId] = { name: r.subject.name, scores: [] }
      }
      trimesterMap[tri][r.subjectId].scores.push(r.score)
    }
    const trimesterEvolution = ["primeiro", "segundo", "terceiro"]
      .filter((t) => trimesterMap[t])
      .map((t) => {
        const subjects: Record<string, number> = {}
        for (const [, data] of Object.entries(trimesterMap[t])) {
          subjects[data.name] = Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
        }
        const allAvgs = Object.values(subjects)
        const generalAvg = allAvgs.length > 0
          ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10
          : 0
        return {
          trimester: t,
          label: trimesterLabels[t] || t,
          subjects,
          generalAverage: generalAvg,
        }
      })

    // --- Recent results (last 10) ---
    const recentResults = results.slice(0, 10).map((r) => ({
      id: r.id,
      subjectName: r.subject.name,
      score: r.score,
      type: r.type,
      date: r.date,
      trimester: r.trimester,
    }))

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        class: student.class,
      },
      generalAverage,
      attendancePercent,
      totalResults: results.length,
      pendingSubmissions,
      subjectAverages,
      attendance: { total: totalAttendance, presente, ausente, atrasado, percent: attendancePercent },
      attendanceByMonth,
      trimesterEvolution,
      recentResults,
      upcomingExams: upcomingExams.map((e) => ({
        id: e.id,
        title: e.title || e.subject.name,
        subjectName: e.subject.name,
        date: e.date,
      })),
      upcomingAssignments: upcomingAssignments.map((a) => ({
        id: a.id,
        title: a.title,
        subjectName: a.subject.name,
        dueDate: a.dueDate,
      })),
    })
  } catch (error) {
    console.error("Erro no dashboard do aluno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
