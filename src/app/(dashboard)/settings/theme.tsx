"use client"

import { useState, useEffect, ReactNode, createContext, useContext } from "react"

type Theme = "light" | "dark"

interface ThemeContextProps {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
})

export const ThemeProvider = ({
  children,
  initialTheme,
}: {
  children: ReactNode
  initialTheme: Theme
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)

    localStorage.setItem("theme", theme)

    // 🔥 guarda cookie → SSR vai ler
    document.cookie = `theme=${theme}; path=/; max-age=31536000`
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)