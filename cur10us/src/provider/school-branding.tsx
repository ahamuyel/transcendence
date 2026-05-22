"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

export type ThemePreset = "moderno" | "minimalista" | "academico" | "corporativo" | "futurista"

export type SchoolBranding = {
  name: string | null
  logo: string | null
  primaryColor: string | null
  secondaryColor: string | null
  slogan: string | null
  loginMessage: string | null
  footerText: string | null
  contactEmail: string | null
  socialFacebook: string | null
  socialInstagram: string | null
  socialWhatsapp: string | null
  // New theme fields
  themePreset: ThemePreset | null
  fontFamily: string | null
  fontSize: string | null
  fontWeight: string | null
  borderRadius: string | null
  shadowSize: string | null
  spacing: string | null
  cardStyle: string | null
  buttonStyle: string | null
  layoutDensity: string | null
}

type SchoolBrandingContextType = SchoolBranding & {
  refresh: () => Promise<void>
}

const defaultBranding: SchoolBranding = {
  name: null, logo: null, primaryColor: null, secondaryColor: null, slogan: null,
  loginMessage: null, footerText: null, contactEmail: null,
  socialFacebook: null, socialInstagram: null, socialWhatsapp: null,
  themePreset: "moderno", fontFamily: "Inter", fontSize: "base", fontWeight: "normal",
  borderRadius: "lg", shadowSize: "md", spacing: "normal",
  cardStyle: "default", buttonStyle: "default", layoutDensity: "comfortable",
}

const SchoolBrandingContext = createContext<SchoolBrandingContextType>({
  ...defaultBranding,
  refresh: async () => {},
})

export function useSchoolBranding() {
  return useContext(SchoolBrandingContext)
}

const FONT_MAP: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Poppins: "'Poppins', sans-serif",
  Roboto: "'Roboto', sans-serif",
  "Open Sans": "'Open Sans', sans-serif",
  Lato: "'Lato', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  "Source Sans Pro": "'Source Sans Pro', sans-serif",
  Nunito: "'Nunito', sans-serif",
  "Public Sans": "'Public Sans', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
}

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "14px",
  base: "16px",
  lg: "18px",
}

const FONT_WEIGHT_MAP: Record<string, string> = {
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
}

const RADIUS_MAP: Record<string, Record<string, string>> = {
  none: { sm: "0px", md: "0px", lg: "0px", xl: "0px", "2xl": "0px", full: "0px" },
  sm: { sm: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", full: "9999px" },
  md: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", "2xl": "1.25rem", full: "9999px" },
  lg: { sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.25rem", "2xl": "1.5rem", full: "9999px" },
  xl: { sm: "0.75rem", md: "1rem", lg: "1.25rem", xl: "1.5rem", "2xl": "2rem", full: "9999px" },
}

const SHADOW_MAP: Record<string, Record<string, string>> = {
  none: { sm: "none", md: "none", lg: "none", xl: "none" },
  sm: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    lg: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    xl: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  md: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  lg: {
    sm: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    md: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    lg: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  },
}

const DENSITY_MAP: Record<string, string> = {
  compact: "0.75",
  comfortable: "1",
  spacious: "1.25",
}

export const THEME_PRESETS: Record<ThemePreset, Partial<SchoolBranding>> = {
  moderno: {
    fontFamily: "Inter",
    fontSize: "base",
    fontWeight: "normal",
    borderRadius: "lg",
    shadowSize: "md",
    spacing: "normal",
    cardStyle: "default",
    buttonStyle: "default",
    layoutDensity: "comfortable",
  },
  minimalista: {
    fontFamily: "Inter",
    fontSize: "base",
    fontWeight: "light",
    borderRadius: "none",
    shadowSize: "none",
    spacing: "normal",
    cardStyle: "flat",
    buttonStyle: "ghost",
    layoutDensity: "spacious",
  },
  academico: {
    fontFamily: "Source Sans Pro",
    fontSize: "base",
    fontWeight: "normal",
    borderRadius: "sm",
    shadowSize: "sm",
    spacing: "normal",
    cardStyle: "bordered",
    buttonStyle: "default",
    layoutDensity: "comfortable",
  },
  corporativo: {
    fontFamily: "Roboto",
    fontSize: "sm",
    fontWeight: "normal",
    borderRadius: "sm",
    shadowSize: "sm",
    spacing: "compact",
    cardStyle: "flat",
    buttonStyle: "default",
    layoutDensity: "compact",
  },
  futurista: {
    fontFamily: "Poppins",
    fontSize: "base",
    fontWeight: "medium",
    borderRadius: "xl",
    shadowSize: "lg",
    spacing: "normal",
    cardStyle: "elevated",
    buttonStyle: "pill",
    layoutDensity: "comfortable",
  },
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

function applyColors(primary: string | null, secondary: string | null) {
  const doc = document.documentElement
  if (primary) {
    doc.style.setProperty("--school-primary", primary)
    try {
      const { h, s, l } = hexToHSL(primary)
      doc.style.setProperty("--school-primary-light", `hsl(${h}, ${s}%, ${Math.min(l + 40, 95)}%)`)
      doc.style.setProperty("--school-primary-dark", `hsl(${h}, ${s}%, ${Math.max(l - 30, 10)}%)`)
    } catch { /* ignore */ }
  }
  if (secondary) {
    doc.style.setProperty("--school-secondary", secondary)
    try {
      const { h, s } = hexToHSL(secondary)
      doc.style.setProperty("--school-secondary-light", `hsl(${h}, ${s}%, 95%)`)
    } catch { /* ignore */ }
  }
}

function applyThemeSettings(settings: Partial<SchoolBranding>) {
  const doc = document.documentElement

  // Font family
  if (settings.fontFamily && FONT_MAP[settings.fontFamily]) {
    doc.style.setProperty("--school-font-family", FONT_MAP[settings.fontFamily])
  }

  // Font size
  if (settings.fontSize && FONT_SIZE_MAP[settings.fontSize]) {
    doc.style.setProperty("--school-font-size-base", FONT_SIZE_MAP[settings.fontSize])
  }

  // Font weight
  if (settings.fontWeight && FONT_WEIGHT_MAP[settings.fontWeight]) {
    doc.style.setProperty("--school-font-weight-normal", FONT_WEIGHT_MAP[settings.fontWeight])
    const boldWeight = settings.fontWeight === "light" ? "600" : settings.fontWeight === "medium" ? "700" : "700"
    doc.style.setProperty("--school-font-weight-bold", boldWeight)
  }

  // Border radius
  const radiusKey = settings.borderRadius || "lg"
  if (RADIUS_MAP[radiusKey]) {
    const radii = RADIUS_MAP[radiusKey]
    Object.entries(radii).forEach(([key, val]) => {
      doc.style.setProperty(`--school-radius-${key}`, val)
    })
    doc.style.setProperty("--school-card-radius", radii.lg)
    doc.style.setProperty("--school-button-radius", radii.md)
  }

  // Shadows
  const shadowKey = settings.shadowSize || "md"
  if (SHADOW_MAP[shadowKey]) {
    const shadows = SHADOW_MAP[shadowKey]
    Object.entries(shadows).forEach(([key, val]) => {
      doc.style.setProperty(`--school-shadow-${key}`, val)
    })
    doc.style.setProperty("--school-card-shadow", shadows.sm)
    doc.style.setProperty("--school-button-shadow", shadows.sm)
  }

  // Spacing density
  if (settings.spacing && DENSITY_MAP[settings.spacing]) {
    doc.style.setProperty("--school-spacing", DENSITY_MAP[settings.spacing])
  }

  // Layout density
  if (settings.layoutDensity && DENSITY_MAP[settings.layoutDensity]) {
    doc.style.setProperty("--school-density-padding", DENSITY_MAP[settings.layoutDensity])
  }

  // Card style
  if (settings.cardStyle) {
    const docEl = document.documentElement
    docEl.setAttribute("data-card-style", settings.cardStyle)
    switch (settings.cardStyle) {
      case "flat":
        doc.style.setProperty("--school-card-bg", "transparent")
        doc.style.setProperty("--school-card-border", "1px solid var(--color-zinc-200)")
        doc.style.setProperty("--school-card-shadow", "none")
        break
      case "bordered":
        doc.style.setProperty("--school-card-border", "2px solid var(--school-primary-light)")
        doc.style.setProperty("--school-card-shadow", "none")
        break
      case "elevated":
        doc.style.setProperty("--school-card-shadow", "var(--school-shadow-lg)")
        doc.style.setProperty("--school-card-border", "none")
        break
      default:
        doc.style.setProperty("--school-card-bg", "var(--color-background)")
        doc.style.setProperty("--school-card-border", "1px solid var(--color-zinc-200)")
        doc.style.setProperty("--school-card-shadow", "var(--school-shadow-sm)")
        break
    }
  }

  // Button style
  if (settings.buttonStyle) {
    switch (settings.buttonStyle) {
      case "ghost":
        doc.style.setProperty("--school-button-radius", "0.375rem")
        doc.style.setProperty("--school-button-shadow", "none")
        doc.style.setProperty("--school-button-font-weight", "500")
        break
      case "pill":
        doc.style.setProperty("--school-button-radius", "9999px")
        doc.style.setProperty("--school-button-shadow", "var(--school-shadow-md)")
        doc.style.setProperty("--school-button-font-weight", "600")
        break
      case "outline":
        doc.style.setProperty("--school-button-radius", "0.5rem")
        doc.style.setProperty("--school-button-shadow", "none")
        doc.style.setProperty("--school-button-font-weight", "500")
        break
      default:
        doc.style.setProperty("--school-button-radius", "0.5rem")
        doc.style.setProperty("--school-button-shadow", "0 1px 2px 0 rgb(0 0 0 / 0.05)")
        doc.style.setProperty("--school-button-font-weight", "600")
        break
    }
  }
}

export function SchoolBrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [branding, setBranding] = useState<SchoolBranding>(defaultBranding)

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch("/api/school-settings")
      if (!res.ok) return
      const data = await res.json()
      setBranding(data)
      applyColors(data.primaryColor, data.secondaryColor)
      applyThemeSettings(data)
    } catch { /* ignore */ }
  }, [])

  const refresh = useCallback(async () => {
    await fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    if (!session?.user?.schoolId) return
    fetchBranding()
    const interval = setInterval(fetchBranding, 120000)
    return () => clearInterval(interval)
  }, [session?.user?.schoolId, fetchBranding])

  return (
    <SchoolBrandingContext.Provider value={{ ...branding, refresh }}>
      {children}
    </SchoolBrandingContext.Provider>
  )
}
