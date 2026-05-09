"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

type SchoolBranding = {
  name: string | null
  logo: string | null
  primaryColor: string | null
  secondaryColor: string | null
  slogan: string | null
}

type SchoolBrandingContextType = SchoolBranding & {
  refresh: () => Promise<void>
}

const SchoolBrandingContext = createContext<SchoolBrandingContextType>({
  name: null, logo: null, primaryColor: null, secondaryColor: null, slogan: null,
  refresh: async () => {},
})

export function useSchoolBranding() {
  return useContext(SchoolBrandingContext)
}

function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function applyColor(color: string | null) {
  const doc = document.documentElement
  if (!color) return
  doc.style.setProperty("--school-primary", color)
  try {
    const { h, s } = hexToHSL(color)
    doc.style.setProperty("--school-primary-light", `hsl(${h}, ${s}%, 95%)`)
    doc.style.setProperty("--school-primary-dark", `hsl(${h}, ${s}%, 25%)`)
  } catch { /* ignore */ }
}

export function SchoolBrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [branding, setBranding] = useState<SchoolBranding>({
    name: null, logo: null, primaryColor: null, secondaryColor: null, slogan: null,
  })

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch("/api/school-settings")
      if (!res.ok) return
      const data = await res.json()
      setBranding(data)
      applyColor(data.primaryColor)
    } catch { /* ignore */ }
  }, [])

  // Manual refresh function that can be called from components
  const refresh = useCallback(async () => {
    await fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    if (!session?.user?.schoolId) return
    fetchBranding()
    const interval = setInterval(fetchBranding, 120000) // refresh every 2 min
    return () => clearInterval(interval)
  }, [session?.user?.schoolId, fetchBranding])

  return (
    <SchoolBrandingContext.Provider value={{ ...branding, refresh }}>
      {children}
    </SchoolBrandingContext.Provider>
  )
}
