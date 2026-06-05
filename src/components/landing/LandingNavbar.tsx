"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, Sun, Moon, GraduationCap } from "lucide-react"
import { useTheme } from "@/provider/theme"
import type { PlatformBranding } from "@/types/landing"
import { useTranslation } from "@/lib/i18n"
import LocaleSwitcher from "./LocaleSwitcher"

export default function LandingNavbar({
  branding,
  locale = "pt",
}: {
  branding: PlatformBranding
  locale?: string
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation(locale)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  // Trap focus within mobile menu
  useEffect(() => {
    if (!open || !menuRef.current) return
    const firstFocusable = menuRef.current.querySelector<HTMLElement>("a, button")
    firstFocusable?.focus()
  }, [open])

  const navLinks = [
    { label: t("landing.nav.problems"), href: "#problems" },
    { label: t("landing.nav.transformation"), href: "#transformation" },
    { label: t("landing.nav.ecosystem"), href: "#ecosystem" },
    { label: t("landing.nav.benefits"), href: "#benefits" },
    { label: t("landing.nav.vision"), href: "#vision" },
    { label: t("landing.nav.trust"), href: "#trust" },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[var(--landing-bg)]/95 backdrop-blur-xl border-[var(--landing-border)] shadow-sm"
          : "bg-[var(--landing-bg)] border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-transform group-hover:scale-105">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--landing-text-primary)]">
              Cur10us<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right section */}
          <div className="hidden xl:flex items-center gap-2">
            <LocaleSwitcher currentLocale={locale} />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Alternar tema"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="w-px h-5 bg-[var(--landing-border)] mx-1" />
            <Link
              href="/signin"
              className="text-sm font-medium text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] px-3 py-2 rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition"
            >
              {t("landing.nav.signin")}
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] px-3 py-2 rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition"
            >
              {t("landing.nav.explore")}
            </Link>
            <Link
              href="/registar-escola"
              className="text-sm font-semibold text-white bg-neutral-900 dark:bg-white dark:text-zinc-900 hover:bg-neutral-800 dark:hover:bg-zinc-200 px-4 py-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("landing.nav.demo")}
            </Link>
          </div>

          {/* Mobile right section */}
          <div className="flex xl:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Alternar tema"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`xl:hidden fixed inset-x-0 top-16 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-full bg-[var(--landing-bg)]/95 backdrop-blur-xl border-t border-[var(--landing-border)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-sm text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition py-3 px-4 rounded-xl hover:bg-[var(--landing-bg-tertiary)]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="px-4 pt-4 border-t border-[var(--landing-border)] space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--landing-text-dim)] px-4 pb-1">
              Conta
            </p>
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-[var(--landing-text-primary)] py-3 px-4 rounded-xl hover:bg-[var(--landing-bg-tertiary)] transition"
            >
              {t("landing.nav.signin")}
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-primary py-3 px-4 rounded-xl hover:bg-[var(--landing-bg-tertiary)] transition"
            >
              {t("landing.nav.explore")}
            </Link>
            <Link
              href="/registar-escola"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-3 rounded-xl transition mt-2"
            >
              {t("landing.nav.demo")}
            </Link>
          </div>

          <div className="px-4 pt-6 pb-8 flex items-center justify-center">
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>
      </div>
    </header>
  )
}
