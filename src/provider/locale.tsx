"use client"

import React, { createContext, useContext } from "react"

export const LocaleContext = createContext<string>("pt")

export function LocaleProvider({
  locale,
  children,
}: {
  locale: string
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  return context || "pt"
}
