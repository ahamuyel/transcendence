import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { sendSchoolApproved } from "@/lib/email"
import { revalidateSchoolData } from "@/lib/revalidate"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const school = await prisma.school.update({
      where: { id },
      data: { status: "aprovada", rejectReason: null },
    })

    // Revalidate school data
    revalidateSchoolData(id)

    try {
      await sendSchoolApproved(school.email, school.name)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json(school)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
