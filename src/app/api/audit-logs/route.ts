import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error, session } = await requirePermission(["super_admin", "school_admin"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const entity = searchParams.get("entity") || ""
    const action = searchParams.get("action") || ""
    const userId = searchParams.get("userId") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    // School admins only see their school's logs
    if (session!.user.role === "school_admin") {
      where.schoolId = getSchoolId(session!)
    }

    if (entity) where.entity = entity
    if (action) where.action = action
    if (userId) where.userId = userId

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
