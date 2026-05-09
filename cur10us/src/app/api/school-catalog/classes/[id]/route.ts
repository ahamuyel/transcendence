import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageClasses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const body = await req.json()
    const { localName } = body

    const schoolClass = await prisma.schoolClass.findFirst({ where: { id, schoolId } })
    if (!schoolClass) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

    const updated = await prisma.schoolClass.update({
      where: { id },
      data: { localName: localName || null },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageClasses",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const schoolClass = await prisma.schoolClass.findFirst({ where: { id, schoolId } })
    if (!schoolClass) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

    await prisma.schoolClass.update({ where: { id }, data: { active: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
