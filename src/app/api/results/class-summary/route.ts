import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") || ""
    const trimester = searchParams.get("trimester") || ""
    const academicYear = searchParams.get("academicYear") || ""

    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      studentId: { in: students.map((s) => s.id) },
      ...(trimester ? { trimester } : {}),
      ...(academicYear ? { academicYear } : {}),
    }

    const results = await prisma.result.findMany({
      where,
      include: { subject: { select: { id: true, name: true } } },
    })

    // Get all subjects
    const subjectMap: Record<string, string> = {}
    results.forEach((r) => { subjectMap[r.subjectId] = r.subject.name })

    // Build student averages
    const studentSummaries = students.map((student) => {
      const studentResults = results.filter((r) => r.studentId === student.id)
      const bySubject: Record<string, number[]> = {}
      studentResults.forEach((r) => {
        if (!bySubject[r.subjectId]) bySubject[r.subjectId] = []
        bySubject[r.subjectId].push(r.score)
      })

      const subjectAvgs: Record<string, number> = {}
      for (const [subId, scores] of Object.entries(bySubject)) {
        subjectAvgs[subId] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      }

      const subjectAvgValues = Object.values(subjectAvgs)
      const average = subjectAvgValues.length
        ? Math.round((subjectAvgValues.reduce((a, b) => a + b, 0) / subjectAvgValues.length) * 100) / 100
        : null

      return { studentId: student.id, studentName: student.name, subjectAverages: subjectAvgs, average }
    })

    const validAverages = studentSummaries.filter((s) => s.average !== null).map((s) => s.average!)
    const classAverage = validAverages.length
      ? Math.round((validAverages.reduce((a, b) => a + b, 0) / validAverages.length) * 100) / 100
      : null

    return NextResponse.json({
      classId,
      subjects: Object.entries(subjectMap).map(([id, name]) => ({ id, name })),
      students: studentSummaries,
      classAverage,
      best: validAverages.length ? Math.max(...validAverages) : null,
      worst: validAverages.length ? Math.min(...validAverages) : null,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
