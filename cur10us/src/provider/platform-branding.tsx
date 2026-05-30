"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { PlatformBranding } from "@/types/landing"
import { PLATFORM_NAME_FALLBACK, PLATFORM_EMAIL_FALLBACK } from "@/lib/platform-config"

type PlatformBrandingContextType = PlatformBranding & {
  refresh: () => Promise<void>
}

const defaultBranding: PlatformBranding = {
  name: PLATFORM_NAME_FALLBACK,
  description: null,
  logo: null,
  contactEmail: PLATFORM_EMAIL_FALLBACK,
  contactPhone: null,
}

const PlatformBrandingContext = createContext<PlatformBrandingContextType>({
  ...defaultBranding,
  refresh: async () => {},
})

export function usePlatformBranding() {
  return useContext(PlatformBrandingContext)
}

export function PlatformBrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<PlatformBranding>(defaultBranding)

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/config")
      if (!res.ok) return
      const data = await res.json()
      setBranding(data)
    } catch {}
  }, [])

  const refresh = useCallback(async () => {
    await fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  return (
    <PlatformBrandingContext.Provider value={{ ...branding, refresh }}>
      {children}
    </PlatformBrandingContext.Provider>
  )
}
