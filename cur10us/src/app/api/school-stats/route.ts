import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"

export async function GET() {
  try {
    const { error: authError, session } = await requireRole(["school_admin"], { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    const todayDay = dayNames[today.getDay()]

    const [
      students,
      teachers,
      parents,
      classes,
      maleStudents,
      femaleStudents,
      pendingAssignments,
      todayLessons,
      pendingApplications,
      recentAnnouncements,
      avgResult,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.parent.count({ where: { schoolId } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.student.count({ where: { schoolId, gender: "masculino" } }),
      prisma.student.count({ where: { schoolId, gender: "feminino" } }),
      prisma.assignment.count({ where: { schoolId, dueDate: { gte: today } } }),
      prisma.lesson.count({ where: { schoolId, day: todayDay } }),
      prisma.application.count({ where: { schoolId, status: "pendente" } }),
      prisma.announcement.count({ where: { schoolId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.result.aggregate({ where: { schoolId }, _avg: { score: true } }),
    ])

    const averageGrade = avgResult._avg.score ? Math.round(avgResult._avg.score * 10) / 10 : 0

    return NextResponse.json({
      students,
      teachers,
      parents,
      classes,
      maleStudents,
      femaleStudents,
      averageGrade,
      pendingAssignments,
      todayLessons,
      pendingApplications,
      recentAnnouncements,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
