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

  // Detect if currently on a chat route
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
    const unsub = on("chat_message", () => { fetchUnread() })
    return unsub
  }, [fetchUnread])

  useEffect(() => {
    const unsub = on("messages-read", () => { setUnreadCount(0) })
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const hasResults =
    results &&
    results.students.length + results.teachers.length + results.classes.length + results.subjects.length > 0

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md gap-2 min-h-[57px]">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="md:hidden h-9 w-9 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <PanelLeft size={18} />
      </Button>

      {/* Mobile search overlay */}
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {group.label}
                        </span>
                      </div>
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`${group.href}?search=${encodeURIComponent(item.name)}`}
                          onClick={() => { setShowResults(false); setQuery(""); setSearchOpen(false) }}
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

      {/* Slogan — desktop */}
      {branding.slogan && (
        <span className="hidden md:block text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px] mr-2">
          {branding.slogan}
        </span>
      )}

      {/* Mobile search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      >
        <Search size={18} />
      </button>

      {/* Desktop search */}
        <div className="hidden md:block relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 focus-within:border-primary focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all">
          <Search size={14} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => { if (results) setShowResults(true) }}
            className="w-[180px] lg:w-[240px] bg-transparent outline-none text-sm placeholder:text-zinc-400 text-zinc-700 dark:text-zinc-200"
          />
        </div>
        {showResults && results && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {group.label}
                      </span>
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
        )}
      </div>

      {/* Mobile logo */}
      <Link href="/dashboard" className="md:hidden flex flex-col items-center shrink-0 ml-auto mr-auto">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {branding.name || "Cur10us"}<span className="text-primary">X</span>
        </span>
        {branding.slogan && (
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-tight">{branding.slogan}</span>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* Chat — badge clears automatically when on chat page */}
        <Link
          href="/list/chat"
          className="relative p-2 rounded-lg text-zinc-500 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          {unreadCount > 0 ? <MessageCircleMore size={18} /> : <MessageCircle size={18} />}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Social links */}
        {(branding.socialFacebook || branding.socialInstagram || branding.socialWhatsapp) && (
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <div className="w-px h-5 bg-zinc-200 dark:border-zinc-700 mr-1" />
            {branding.socialFacebook && (
              <a href={branding.socialFacebook} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#1877F2] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {branding.socialInstagram && (
              <a href={branding.socialInstagram} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#E4405F] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
            {branding.socialWhatsapp && (
              <a href={`https://wa.me/${branding.socialWhatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#25D366] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          title="Terminar Sessão"
        >
          <LogOut size={18} />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-zinc-200 dark:border-zinc-700 mx-1" />

        {/* User Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="hidden sm:flex flex-col leading-tight text-right">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-primary transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-500">
              {roleLabels[userRole] || userRole}
            </span>
          </div>
          <Avatar className="h-8 w-8 border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-primary transition-colors">
            {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
            <AvatarFallback className="text-[10px] font-semibold bg-primary-light text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
