import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

let cache: { data: unknown; expiresAt: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function GET() {
  try {
    const now = Date.now()

    if (cache && now < cache.expiresAt) {
      return NextResponse.json(cache.data, {
        headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
      })
    }

    const schools = await prisma.school.findMany({
      where: { status: "ativa" },
      select: { id: true, name: true, slug: true, city: true },
      orderBy: { name: "asc" },
    })

    cache = { data: schools, expiresAt: now + CACHE_TTL }

    return NextResponse.json(schools, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}