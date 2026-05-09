import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const [
      totalSchools,
      activeSchools,
      pendingSchools,
      totalUsers,
      totalTeachers,
      totalStudents,
      totalParents,
      totalApplications,
      pendingApplications,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { status: "ativa" } }),
      prisma.school.count({ where: { status: "pendente" } }),
      prisma.user.count(),
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.parent.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "pendente" } }),
    ])

    return NextResponse.json({
      totalSchools,
      activeSchools,
      pendingSchools,
      totalUsers,
      totalTeachers,
      totalStudents,
      totalParents,
      totalApplications,
      pendingApplications,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
