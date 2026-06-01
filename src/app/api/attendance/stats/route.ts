import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") || ""
    const classId = searchParams.get("classId") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    if (!studentId && !classId) {
      return NextResponse.json({ error: "studentId ou classId é obrigatório" }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { schoolId }
    if (studentId) where.studentId = studentId
    if (classId) where.classId = classId
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (studentId) {
      // Single student stats
      const records = await prisma.attendance.findMany({ where, select: { status: true } })
      const total = records.length
      const presente = records.filter((r) => r.status === "presente").length
      const ausente = records.filter((r) => r.status === "ausente").length
      const atrasado = records.filter((r) => r.status === "atrasado").length
      const percentage = total > 0 ? Math.round(((presente + atrasado) / total) * 100) : 0

      return NextResponse.json({ studentId, total, presente, ausente, atrasado, percentage })
    }

    // Class stats — per student
    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    const records = await prisma.attendance.findMany({
      where,
      select: { studentId: true, status: true },
    })

    const studentStats = students.map((student) => {
      const studentRecords = records.filter((r) => r.studentId === student.id)
      const total = studentRecords.length
      const presente = studentRecords.filter((r) => r.status === "presente").length
      const ausente = studentRecords.filter((r) => r.status === "ausente").length
      const atrasado = studentRecords.filter((r) => r.status === "atrasado").length
      const percentage = total > 0 ? Math.round(((presente + atrasado) / total) * 100) : 0

      return { studentId: student.id, studentName: student.name, total, presente, ausente, atrasado, percentage }
    })

    const classPercentages = studentStats.filter((s) => s.total > 0).map((s) => s.percentage)
    const classAvg = classPercentages.length
      ? Math.round(classPercentages.reduce((a, b) => a + b, 0) / classPercentages.length)
      : 0

    return NextResponse.json({ classId, students: studentStats, classAverage: classAvg })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
