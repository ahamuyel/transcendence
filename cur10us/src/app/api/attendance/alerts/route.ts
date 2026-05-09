import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId") || ""
    const threshold = parseInt(searchParams.get("threshold") || "75")

    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: { id: true, name: true },
    })

    const records = await prisma.attendance.findMany({
      where: { classId, schoolId },
      select: { studentId: true, status: true },
    })

    const alerts = students.map((student) => {
      const studentRecords = records.filter((r) => r.studentId === student.id)
      const total = studentRecords.length
      const presente = studentRecords.filter((r) => r.status === "presente").length
      const atrasado = studentRecords.filter((r) => r.status === "atrasado").length
      const percentage = total > 0 ? Math.round(((presente + atrasado) / total) * 100) : 100

      return { studentId: student.id, studentName: student.name, total, percentage }
    }).filter((s) => s.total > 0 && s.percentage < threshold)

    return NextResponse.json({ classId, threshold, alerts })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
