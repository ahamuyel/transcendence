import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { updateSchoolSchema } from "@/lib/validations/school"
import { revalidateSchoolData } from "@/lib/revalidate"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, teachers: true, students: true, parents: true, applications: true } },
      },
    })
    if (!school) {
      return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 })
    }
    return NextResponse.json(school, {
      headers: {
        "Chache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    const body = await req.json()
    const parsed = updateSchoolSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { features, ...rest } = parsed.data
     console.log("[PUT school features] id:", id, "features recebidas:", features)
    const school = await prisma.school.update({
      where: { id },
      data: {
        ...rest,
        ...(features !== undefined && { features: features as unknown as Record<string, boolean> }),
      },
    })

    // Revalidate all cached data for this school
    revalidateSchoolData(id)
    
    console.log("[PUT school features] features guardadas na DB:", school.features)

    return NextResponse.json(school) 
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    await prisma.school.delete({ where: { id } })

    // Revalidate school listings after deletion
    revalidateSchoolData(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
