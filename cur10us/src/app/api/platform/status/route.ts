import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const config = await prisma.platformConfig.findUnique({
      where: { id: "singleton" },
      select: { maintenanceMode: true, allowRegistration: true },
    })

    return NextResponse.json({
      maintenanceMode: config?.maintenanceMode ?? false,
      allowRegistration: config?.allowRegistration ?? true,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ maintenanceMode: false, allowRegistration: true })
  }
}
