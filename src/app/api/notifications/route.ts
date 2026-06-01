import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requireRole(["school_admin", "teacher", "student", "parent"], { requireSchool: true })
    if (authError) return authError

    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const unread = searchParams.get("unread") === "true"
    const limit = parseInt(searchParams.get("limit") || "20")

    const where = {
      userId,
      ...(unread ? { read: false } : {}),
    }

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ])

    return NextResponse.json({ data, total, unreadCount })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
