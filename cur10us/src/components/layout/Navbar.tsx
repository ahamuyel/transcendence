"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Search,
  MessageCircle,
  X,
  Users,
  UserRound,
  BookOpen,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import ThemeToggle from "@/components/ui/ThemeToggle"
import NotificationDropdown from "@/components/ui/NotificationDropdown"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "Administrador",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

type SearchItem = { id: string; name: string }
type SearchResults = { students: SearchItem[]; teachers: SearchItem[]; classes: SearchItem[]; subjects: SearchItem[] }

const groupConfig = [
  { key: "students" as const, label: "Alunos", icon: Users, href: "/list/students" },
  { key: "teachers" as const, label: "Professores", icon: UserRound, href: "/list/teachers" },
  { key: "classes" as const, label: "Turmas", icon: BookOpen, href: "/list/classes" },
  { key: "subjects" as const, label: "Disciplinas", icon: GraduationCap, href: "/list/subjects" },
]

const NavBar = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { data: session } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userName = session?.user?.name || "Usuário"
  const userRole = session?.user?.role || ""
  const userImage = session?.user?.image || "/avatar.png"

  const doSearch = useCallback((q: string) => {
    if (q.length < 2) {
      setResults(null)
      setShowResults(false)
      return
    }
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data)
        setShowResults(true)
      })
      .catch(() => {})
  }, [])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const hasResults = results && (results.students.length + results.teachers.length + results.classes.length + results.subjects.length) > 0

  const renderDropdown = () => {
    if (!showResults || !results) return null
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
        {!hasResults ? (
          <div className="p-3 text-sm text-zinc-400 text-center">Nenhum resultado encontrado</div>
        ) : (
          groupConfig.map((group) => {
            const items = results[group.key]
            if (!items.length) return null
            const Icon = group.icon
            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                  <Icon size={13} className="text-zinc-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{group.label}</span>
                </div>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`${group.href}?search=${encodeURIComponent(item.name)}`}
                    onClick={() => { setShowResults(false); setQuery(""); setSearchOpen(false) }}
                    className="block px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )
          })
        )}
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md gap-2">

      {/* MOBILE SEARCH OVERLAY */}
      {searchOpen && (
        <div className="md:hidden absolute inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
          <div className="flex items-center px-3 py-2 gap-2">
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar..."
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
            />
            <button
              onClick={() => { setSearchOpen(false); setQuery(""); setShowResults(false) }}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>
          {showResults && results && (
            <div className="flex-1 overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
              {!hasResults ? (
                <div className="p-4 text-sm text-zinc-400 text-center">Nenhum resultado encontrado</div>
              ) : (
                groupConfig.map((group) => {
                  const items = results[group.key]
                  if (!items.length) return null
                  const Icon = group.icon
                  return (
                    <div key={group.key}>
                      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                        <Icon size={13} className="text-zinc-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{group.label}</span>
                      </div>
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`${group.href}?search=${encodeURIComponent(item.name)}`}
                          onClick={() => { setSearchOpen(false); setQuery(""); setShowResults(false) }}
                          className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* DESKTOP SEARCH */}
      <div className="hidden md:block relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 focus-within:border-indigo-500 transition flex-shrink-0">
          <Search size={14} />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => { if (results) setShowResults(true) }}
            className="w-[180px] lg:w-[240px] bg-transparent outline-none text-sm placeholder:text-zinc-400 text-zinc-700 dark:text-zinc-200"
          />
        </div>
        {renderDropdown()}
      </div>

      {/* MOBILE LOGO */}
      <Link href="/" className="md:hidden flex items-center gap-1.5 shrink-0">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
        </span>
      </Link>

      {/* MOBILE SEARCH TRIGGER */}
      <button
        onClick={() => setSearchOpen(true)}
        className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      >
        <Search size={18} />
      </button>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">

        {/* Messages */}
        <button className="relative p-2 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
          <MessageCircle size={18} />
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* DIVIDER */}
        <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        {/* USER INFO + AVATAR — link to profile */}
        <Link href="/profile" className="flex items-center gap-3 group cursor-pointer">
          <div className="hidden sm:flex flex-col leading-tight text-right">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-500">
              {roleLabels[userRole] || userRole}
            </span>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={userImage}
            alt="User Avatar"
            width={34}
            height={34}
            className="rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700 shrink-0 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors w-[34px] h-[34px]"
          />
        </Link>
      </div>
    </header>
  )
}

export default NavBar
