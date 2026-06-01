import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

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
      allSchools,
      statusCounts,
      recentSchools,
      recentApplications,
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
      // For growth chart: schools created in last 6 months
      prisma.school.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Status breakdown
      prisma.school.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // Recent schools
      prisma.school.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, city: true, status: true, createdAt: true },
      }),
      // Recent applications
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          school: { select: { name: true } },
        },
      }),
    ])

    // Compute monthly growth
    const monthlyGrowth: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = d.toLocaleDateString("pt", { month: "short", year: "2-digit" })
      const count = allSchools.filter((s) => {
        const sd = new Date(s.createdAt)
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
      }).length
      monthlyGrowth.push({ month: monthLabel, count })
    }

    // Status breakdown mapped
    const statusBreakdown = statusCounts.map((s) => ({
      status: s.status,
      count: s._count._all,
    }))

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
      schoolsGrowth: monthlyGrowth,
      statusBreakdown,
      recentSchools,
      recentApplications,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
