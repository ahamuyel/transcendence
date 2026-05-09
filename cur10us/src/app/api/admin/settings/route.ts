import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

const SINGLETON_ID = "singleton"

export async function GET() {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    let config = await prisma.platformConfig.findUnique({ where: { id: SINGLETON_ID } })
    if (!config) {
      config = await prisma.platformConfig.create({ data: { id: SINGLETON_ID } })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const body = await req.json()
    const { name, logo, contactEmail, contactPhone, description, maintenanceMode, allowRegistration } = body

    const config = await prisma.platformConfig.upsert({
      where: { id: SINGLETON_ID },
      update: {
        ...(name !== undefined ? { name } : {}),
        ...(logo !== undefined ? { logo: logo || null } : {}),
        ...(contactEmail !== undefined ? { contactEmail: contactEmail || null } : {}),
        ...(contactPhone !== undefined ? { contactPhone: contactPhone || null } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(maintenanceMode !== undefined ? { maintenanceMode } : {}),
        ...(allowRegistration !== undefined ? { allowRegistration } : {}),
      },
      create: {
        id: SINGLETON_ID,
        name: name || "Cur10usX",
        logo: logo || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        description: description || null,
        maintenanceMode: maintenanceMode ?? false,
        allowRegistration: allowRegistration ?? true,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
