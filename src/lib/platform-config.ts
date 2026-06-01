import { prisma } from "@/lib/prisma"
import type { PlatformBranding } from "@/types/landing"

export const PLATFORM_NAME_FALLBACK = "Cur10usX"
export const PLATFORM_EMAIL_FALLBACK = "suporte@cur10usx.com"

let cachedConfig: PlatformBranding | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60000

export async function getPlatformConfig(): Promise<PlatformBranding> {
  if (cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedConfig
  }

  const config = await prisma.platformConfig.findUnique({
    where: { id: "singleton" },
  })

  const branding: PlatformBranding = {
    name: config?.name || PLATFORM_NAME_FALLBACK,
    description: config?.description || null,
    logo: config?.logo || null,
    contactEmail: config?.contactEmail || PLATFORM_EMAIL_FALLBACK,
    contactPhone: config?.contactPhone || null,
  }

  cachedConfig = branding
  cacheTimestamp = Date.now()

  return branding
}

export function invalidatePlatformCache() {
  cachedConfig = null
  cacheTimestamp = 0
}
