import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { rejectSchoolSchema } from "@/lib/validations/school"
import { sendSchoolRejected } from "@/lib/email"
import { revalidateSchoolData } from "@/lib/revalidate"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const body = await req.json()
    const parsed = rejectSchoolSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const school = await prisma.school.update({
      where: { id },
      data: { status: "rejeitada", rejectReason: parsed.data.reason },
    })

    // Revalidate school data
    revalidateSchoolData(id)

    try {
      await sendSchoolRejected(school.email, school.name, parsed.data.reason)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json(school)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
