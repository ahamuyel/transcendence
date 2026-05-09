import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { revalidateSchoolData } from "@/lib/revalidate"

const SETTINGS_SELECT = {
  name: true,
  logo: true,
  primaryColor: true,
  secondaryColor: true,
  slogan: true,
  contactEmail: true,
  socialFacebook: true,
  socialInstagram: true,
  socialWhatsapp: true,
  loginMessage: true,
  footerText: true,
}

export async function GET() {
  try {
    const { error, session } = await requireRole(["school_admin", "teacher", "student", "parent"], { requireSchool: true })
    if (error) return error

    const schoolId = getSchoolId(session!)
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: SETTINGS_SELECT,
    })

    return NextResponse.json(school)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { error, session } = await requireRole(["school_admin"], { requireSchool: true })
    if (error) return error

    const schoolId = getSchoolId(session!)
    const body = await req.json()

    // Validate logo size (base64 ~200KB max)
    if (body.logo && typeof body.logo === "string" && body.logo.length > 300000) {
      return NextResponse.json({ error: "Logo muito grande (máx. 200KB)" }, { status: 400 })
    }

    const allowedFields = [
      "logo", "primaryColor", "secondaryColor", "slogan",
      "contactEmail", "socialFacebook", "socialInstagram",
      "socialWhatsapp", "loginMessage", "footerText",
    ] as const

    const data: Record<string, string | null> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field] || null
      }
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data,
      select: SETTINGS_SELECT,
    })

    // Revalidate school data after update
    revalidateSchoolData(schoolId)

    return NextResponse.json(school)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
