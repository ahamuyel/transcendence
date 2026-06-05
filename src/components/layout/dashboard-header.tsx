"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Search,
  MessageCircle,
  MessageCircleMore,
  X,
  PanelLeft,
  LogOut,
  Users,
  UserRound,
  BookOpen,
  GraduationCap,
} from "lucide-react"
import { signOut } from "next-auth/react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import NotificationDropdown from "@/components/ui/NotificationDropdown"
import { useSidebar } from "@/hooks/useSidebar"
import { on } from "@/hooks/useWebSocket"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSchoolBranding } from "@/provider/school-branding"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "Administrador",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

type SearchItem = { id: string; name: string }
type SearchResults = {
  students: SearchItem[]
  teachers: SearchItem[]
  classes: SearchItem[]
  subjects: SearchItem[]
}

const groupConfig = [
  { key: "students" as const, label: "Alunos", icon: Users, href: "/list/students" },
  { key: "teachers" as const, label: "Professores", icon: UserRound, href: "/list/teachers" },
  { key: "classes" as const, label: "Turmas", icon: BookOpen, href: "/list/classes" },
  { key: "subjects" as const, label: "Disciplinas", icon: GraduationCap, href: "/list/subjects" },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const { toggleMobile } = useSidebar()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { data: session } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const branding = useSchoolBranding()
  const [unreadCount, setUnreadCount] = useState(0)
  const userName = session?.user?.name || "Usuário"
  const userRole = session?.user?.role || ""
  const userImage = session?.user?.image || ""
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const isOnChatPage = pathname.startsWith("/list/chat")

  const fetchUnread = useCallback(async () => {
    if (isOnChatPage) {
      setUnreadCount(0)
      return
    }
    try {
      const res = await fetch("/api/chat/unread")
      if (res.ok) {
        const json = await res.json()
        setUnreadCount(json.total)
      }
    } catch {
      // ignore
    }
  }, [isOnChatPage])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  useEffect(() => {
    const unsub = on("chat_message", () => {
      fetchUnread()
    })
    return unsub
  }, [fetchUnread])

  useEffect(() => {
    const unsub = on("messages-read", () => {
      setUnreadCount(0)
    })
    return unsub
  }, [])

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

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery("")
    setShowResults(false)
    setResults(null)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        closeSearch()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchOpen, closeSearch])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const hasResults =
    results &&
    results.students.length + results.teachers.length + results.classes.length + results.subjects.length > 0

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md gap-2 min-h-[57px]">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="md:hidden h-9 w-9 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 shrink-0"
        aria-label="Abrir menu"
      >
        <PanelLeft size={18} />
      </Button>

      {/* Desktop: branding slogan */}
      <div className="hidden md:flex items-center gap-3 min-w-0 mr-3">
        {branding.slogan && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
            {branding.slogan}
          </span>
        )}
      </div>

      {/* Mobile search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
        aria-label="Pesquisar"
      >
        <Search size={18} />
      </button>

      {/* Mobile: centered logo */}
      <div className="md:hidden flex flex-col items-center min-w-0 px-2">
        {branding.name ? (
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
            {branding.name}
          </span>
        ) : (
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dashboard</span>
        )}
        {branding.slogan && (
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-tight truncate max-w-[160px]">
            {branding.slogan}
          </span>
        )}
      </div>

      {/* Desktop search */}
      <div className="hidden md:block relative flex-1 max-w-md" ref={dropdownRef}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 focus-within:border-primary focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Pesquisar alunos, professores, turmas..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (results) setShowResults(true)
            }}
            className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 text-zinc-700 dark:text-zinc-200"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                setResults(null)
                setShowResults(false)
              }}
              className="p-0.5 rounded text-zinc-400 hover:text-zinc-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showResults && results && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
            {!hasResults ? (
              <div className="p-4 text-sm text-zinc-400 text-center">
                Nenhum resultado encontrado
              </div>
            ) : (
              groupConfig.map((group) => {
                const items = results[group.key]
                if (!items.length) return null
                const Icon = group.icon
                return (
                  <div key={group.key}>
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                      <Icon size={13} className="text-zinc-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {group.label}
                      </span>
                    </div>
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`${group.href}?search=${encodeURIComponent(item.name)}`}
                        onClick={() => {
                          setShowResults(false)
                          setQuery("")
                        }}
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
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1.5">
        {/* Chat */}
        <Link
          href="/list/chat"
          className="relative p-2 rounded-lg text-zinc-500 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Chat"
        >
          {unreadCount > 0 ? (
            <MessageCircleMore size={18} />
          ) : (
            <MessageCircle size={18} />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Desktop: Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="hidden sm:inline-flex p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          title="Terminar Sessão"
        >
          <LogOut size={18} />
        </button>

        {/* Mobile: Theme + Logout combo */}
        <div className="flex sm:hidden items-center">
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            title="Terminar Sessão"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* User Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-3 group cursor-pointer shrink-0"
        >
          <div className="hidden sm:flex flex-col leading-tight text-right">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-primary transition-colors truncate max-w-[120px]">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-500">
              {roleLabels[userRole] || userRole}
            </span>
          </div>
          <Avatar className="h-8 w-8 border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-primary transition-colors shrink-0">
            {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
            <AvatarFallback className="text-[10px] font-semibold bg-primary-light text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
          <div className="flex items-center px-4 py-3 gap-3 border-b border-zinc-200 dark:border-zinc-800">
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar alunos, professores..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
            />
            <button
              onClick={closeSearch}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              aria-label="Fechar pesquisa"
            >
              <X size={18} />
            </button>
          </div>
          {showResults && results && (
            <div className="flex-1 overflow-y-auto">
              {!hasResults ? (
                <div className="p-6 text-sm text-zinc-400 text-center">
                  Nenhum resultado encontrado
                </div>
              ) : (
                groupConfig.map((group) => {
                  const items = results[group.key]
                  if (!items.length) return null
                  const Icon = group.icon
                  return (
                    <div key={group.key}>
                      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                        <Icon size={13} className="text-zinc-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {group.label}
                        </span>
                      </div>
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`${group.href}?search=${encodeURIComponent(item.name)}`}
                          onClick={closeSearch}
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
    </header>
  )
}
