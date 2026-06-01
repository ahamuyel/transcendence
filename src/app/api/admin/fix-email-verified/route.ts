import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

// One-time fix: set emailVerified=true for all existing users
// Call: POST /api/admin/fix-email-verified
export async function POST() {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const result = await prisma.user.updateMany({
      where: { emailVerified: false },
      data: { emailVerified: true },
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `${result.count} utilizadores actualizados com emailVerified=true`,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
