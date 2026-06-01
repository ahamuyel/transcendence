import { NextResponse } from "next/server"
import { getPlatformConfig } from "@/lib/platform-config"

export async function GET() {
  try {
    const config = await getPlatformConfig()
    return NextResponse.json(config, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({
      name: "Cur10usX",
      description: null,
      logo: null,
      contactEmail: null,
      contactPhone: null,
    })
  }
}
