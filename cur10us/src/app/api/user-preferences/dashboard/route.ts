import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  try {
    const { error, session } = await requireRole(["super_admin", "school_admin", "teacher", "student", "parent"])
    if (error) return error

    const pref = await prisma.dashboardPreference.findUnique({
      where: { userId: session!.user.id },
    })

    return NextResponse.json({ layout: pref?.layout || null })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { error, session } = await requireRole(["super_admin", "school_admin", "teacher", "student", "parent"])
    if (error) return error

    const { layout } = await req.json()
    if (!layout || typeof layout !== "object") {
      return NextResponse.json({ error: "Layout inválido" }, { status: 400 })
    }

    const pref = await prisma.dashboardPreference.upsert({
      where: { userId: session!.user.id },
      create: { userId: session!.user.id, layout },
      update: { layout },
    })

    return NextResponse.json(pref)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
