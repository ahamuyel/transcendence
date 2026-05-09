import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET() {
  try {
    const { error, session } = await requireRole(["school_admin", "teacher", "student", "parent"])
    if (error) return error

    const pref = await prisma.userPreference.findUnique({
      where: { userId: session!.user.id },
    })

    return NextResponse.json(pref || {
      theme: "light",
      locale: "pt",
      notifyPlatform: true,
      notifyEmail: false,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { error, session } = await requireRole(["school_admin", "teacher", "student", "parent"])
    if (error) return error

    const body = await req.json()
    const { theme, locale, notifyPlatform, notifyEmail } = body

    const pref = await prisma.userPreference.upsert({
      where: { userId: session!.user.id },
      create: {
        userId: session!.user.id,
        ...(theme !== undefined && { theme }),
        ...(locale !== undefined && { locale }),
        ...(notifyPlatform !== undefined && { notifyPlatform }),
        ...(notifyEmail !== undefined && { notifyEmail }),
      },
      update: {
        ...(theme !== undefined && { theme }),
        ...(locale !== undefined && { locale }),
        ...(notifyPlatform !== undefined && { notifyPlatform }),
        ...(notifyEmail !== undefined && { notifyEmail }),
      },
    })

    return NextResponse.json(pref)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
