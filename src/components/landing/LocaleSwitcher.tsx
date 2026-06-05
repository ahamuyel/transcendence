"use client"

import { useCallback } from "react"
import { LOCALE_COOKIE } from "@/lib/i18n"

const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const

export default function LocaleSwitcher({
  currentLocale,
}: {
  currentLocale: string
}) {
  const switchLocale = useCallback(
    (code: string) => {
      document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000`
      window.location.reload()
    },
    []
  )

  return (
    <div className="flex items-center gap-0.5 border border-[var(--landing-border)] rounded-md overflow-hidden">
      {LOCALES.map((loc) => {
        const isActive = currentLocale === loc.code
        return (
          <button
            key={loc.code}
            onClick={() => switchLocale(loc.code)}
            className={`px-2 py-1 text-[11px] font-mono font-semibold tracking-wider transition-all cursor-pointer ${
              isActive
                ? "bg-[var(--landing-text-primary)] text-[var(--landing-bg)]"
                : "text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)]"
            }`}
          >
            {loc.label}
          </button>
        )
      })}
    </div>
  )
}
