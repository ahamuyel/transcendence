import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function POST() {
  try {
    const { error: authError, session } = await requireRole(["school_admin", "teacher", "student", "parent"])
    if (authError) return authError

    const userId = session!.user.id

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
