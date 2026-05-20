"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Check, Languages, Menu, Moon, Sun, X } from "lucide-react"
import { useTheme } from "@/provider/theme"
import type { PlatformBranding } from "@/types/landing"
import { languageLabels, type LandingCopy, type LandingLanguage } from "./landing-i18n"

type Props = {
  branding: PlatformBranding
  copy: LandingCopy["nav"]
  language: LandingLanguage
  onLanguageChange: (language: LandingLanguage) => void
}

export default function LandingNavbar({ branding, copy, language, onLanguageChange }: Props) {
  const [open, setOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const navLinks = [
    { label: copy.how, href: "#como-funciona" },
    { label: copy.features, href: "#funcionalidades" },
    { label: copy.profiles, href: "#para-quem" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 pt-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 rounded-3xl px-3 py-3 sm:px-5 bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-700/70 shadow-lg shadow-zinc-900/5">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 rounded-2xl px-3 py-2 transition hover:bg-white/45 dark:hover:bg-zinc-800/45 shrink-0"
        >
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

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-2xl p-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLanguageOpen((value) => !value)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50"
              aria-label={copy.language}
              aria-expanded={languageOpen}
            >
              <Languages size={17} />
              {languageLabels[language]}
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-white/60 bg-white/90 p-1.5 shadow-xl shadow-zinc-900/10 backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-950/90">
                {(Object.keys(languageLabels) as LandingLanguage[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onLanguageChange(item)
                      setLanguageOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                  >
                    {languageLabels[item]}
                    {language === item && <Check size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="min-h-11 min-w-11 rounded-xl p-2 text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50"
            aria-label={copy.theme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/signup"
            className="min-h-11 items-center rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50 inline-flex"
          >
            {copy.createAccount}
          </Link>
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-600/30"
          >
            {copy.signIn}
          </Link>
        </div>

        {/* Mobile: sign in + hamburger */}
        <div className="flex lg:hidden items-center gap-1.5">
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-600/30"
          >
            {copy.signIn}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="min-h-11 min-w-11 rounded-xl p-2 text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50"
            aria-label={copy.menu}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-3 mt-2 rounded-3xl px-4 py-4 space-y-1 bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-700/70 shadow-lg shadow-zinc-900/5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50"
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-2 border-t border-zinc-200/50 dark:border-zinc-700/50 pt-3 mt-3">
            {(Object.keys(languageLabels) as LandingLanguage[]).map((item) => (
              <button
                key={item}
                onClick={() => {
                  onLanguageChange(item)
                  setOpen(false)
                }}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  language === item
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    : "text-zinc-600 hover:bg-white/45 dark:text-zinc-300 dark:hover:bg-zinc-800/45"
                }`}
              >
                {languageLabels[item]}
              </button>
            ))}
            <button
              onClick={() => { toggleTheme(); setOpen(false) }}
              className="min-h-11 min-w-11 rounded-xl p-2 text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50 flex items-center justify-center"
              aria-label={copy.theme}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-white/45 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/45 dark:hover:text-zinc-50 text-center"
            >
              {copy.createAccount}
            </Link>
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-600/30 text-center"
            >
              {copy.signIn}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
