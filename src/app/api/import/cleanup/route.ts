import { NextResponse } from "next/server"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

function findLinkedUserIds(role: string, userIds: string[]) {
  const where = { userId: { in: userIds } }
  const select = { userId: true }
  if (role === "student") return prisma.student.findMany({ where, select })
  if (role === "teacher") return prisma.teacher.findMany({ where, select })
  return prisma.parent.findMany({ where, select })
}

// GET: List orphaned users (User exists with role but no matching Student/Teacher/Parent record)
export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") || "student"

    if (!["student", "teacher", "parent"].includes(role)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: { schoolId, role: role as any },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    if (users.length === 0) {
      return NextResponse.json({ orphanedCount: 0, orphanedUsers: [] })
    }

    const userIds = users.map((u) => u.id)
    const linked = await findLinkedUserIds(role, userIds)
    const linkedIds = new Set(linked.map((r) => r.userId))
    const orphaned = users.filter((u) => !linkedIds.has(u.id))

    return NextResponse.json({
      orphanedCount: orphaned.length,
      totalUsersWithRole: users.length,
      orphanedUsers: orphaned,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE: Remove orphaned users
export async function DELETE(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { role } = await req.json()

    if (!["student", "teacher", "parent"].includes(role)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: { schoolId, role: role as any },
      select: { id: true },
    })

    if (users.length === 0) {
      return NextResponse.json({ deletedCount: 0 })
    }

    const userIds = users.map((u) => u.id)
    const linked = await findLinkedUserIds(role, userIds)
    const linkedIds = new Set(linked.map((r) => r.userId))
    const orphanedIds = userIds.filter((id) => !linkedIds.has(id))

    if (orphanedIds.length === 0) {
      return NextResponse.json({ deletedCount: 0 })
    }

    const { count } = await prisma.user.deleteMany({
      where: { id: { in: orphanedIds }, schoolId },
    })

    return NextResponse.json({ deletedCount: count })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
