import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

// POST — deactivate a secondary admin
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageAdmins",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { adminPermission: true },
    })

    if (!existing || existing.role !== "school_admin" || existing.schoolId !== schoolId) {
      return NextResponse.json(
        { error: "Administrador não encontrado" },
        { status: 404 }
      )
    }

    // Cannot deactivate a primary admin
    if (existing.adminPermission?.level === "primary") {
      return NextResponse.json(
        { error: "Não é possível desactivar o administrador principal" },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
