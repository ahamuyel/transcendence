"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "@/provider/theme"
import type { PlatformBranding } from "@/types/landing"

const navLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Preços", href: "#precos" },
  { label: "Para quem", href: "#para-quem" },
  { label: "FAQ", href: "#faq" },
]

export default function LandingNavbar({ branding }: { branding: PlatformBranding }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm shadow-zinc-200/20 dark:shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          {branding.logo && (
            <Image
              src={branding.logo}
              alt={branding.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-xl object-contain"
            />
          )}
          <span className="text-xl font-bold tracking-tight">
            {branding.name === "Cur10usX" ? (
              <>
                Cur10us
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  X
                </span>
              </>
            ) : (
              branding.name
            )}
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition px-3 py-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/signup"
            className="hidden sm:inline-block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition px-4 py-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
          >
            Criar conta
          </Link>
          <Link
            href="/signin"
            className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
          >
            Entrar
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition py-2.5 px-3 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-2 flex flex-col gap-2">
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium py-2.5 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="text-sm text-zinc-600 dark:text-zinc-400 font-medium py-2.5 px-3 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
