"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react"

type Theme = "light" | "dark"

interface ThemeContextProps {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
})

// 🔥 lê cookie no client
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("theme="))
    ?.split("=")[1]

  return (cookie as Theme) || "light"
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    setTheme(getInitialTheme())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme)
      localStorage.setItem("theme", theme)
      document.cookie = `theme=${theme}; path=/; max-age=31536000`
      return
    }

    document.documentElement.classList.add("theme-transitioning")

    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)

    localStorage.setItem("theme", theme)
    document.cookie = `theme=${theme}; path=/; max-age=31536000`

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning")
    }, 500)

    return () => clearTimeout(timeout)
  }, [theme, mounted])

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