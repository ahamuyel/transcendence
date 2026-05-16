"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDashboardPath } from "@/lib/routes"
import { isFeatureEnabled, menuFeatureMap } from "@/lib/features"
import { navGroups, type NavItem } from "@/lib/routes.config"
import { useSidebar } from "@/hooks/useSidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const GROUP_STATE_KEY = "sidebar_groups_mobile"

function useNavFilter() {
  const { data: session } = useSession()
  const role = (session?.user?.role || "student") as import("@/lib/routes.config").UserRole
  const adminLevel = session?.user?.adminLevel
  const permissions = session?.user?.permissions || []
  const schoolFeatures = (session?.user as { schoolFeatures?: Record<string, boolean> | null })?.schoolFeatures

  const isVisible = (item: NavItem): boolean => {
    if (!item.roles.includes(role)) return false
    if (role === "school_admin" && item.permission && adminLevel === "secondary") {
      return (permissions as string[]).includes(item.permission)
    }
    const feature = item.feature || menuFeatureMap[item.href]
    if (feature && !isFeatureEnabled(schoolFeatures, feature)) return false
    return true
  }

  return { isVisible, role }
}

function useGroupState(groupTitles: string[]) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {}
    try {
      const saved = localStorage.getItem(GROUP_STATE_KEY)
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    const initial: Record<string, boolean> = {}
    groupTitles.forEach((t) => { initial[t] = true })
    return initial
  })

  useEffect(() => {
    localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(openGroups))
  }, [openGroups])

  const toggleGroup = useCallback((title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }, [])

  return { openGroups, toggleGroup }
}

export default function SidebarMobile() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { mobileOpen, setMobileOpen } = useSidebar()
  const { isVisible } = useNavFilter()
  const homePath = getDashboardPath(session?.user?.id)

  const userName = session?.user?.name || "Utilizador"
  const userEmail = session?.user?.email || ""
  const userImage = session?.user?.image || ""
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(isVisible),
    }))
    .filter((group) => group.items.length > 0)

  const { openGroups, toggleGroup } = useGroupState(filteredGroups.map((g) => g.title))

  return (
    <>
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <Link href="/dashboard" className="font-bold text-zinc-900 dark:text-zinc-100">
            Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto styled-scroll px-3 py-4 space-y-4">
          {filteredGroups.map((group) => {
            const isGroupOpen = openGroups[group.title] !== false
            return (
              <div key={group.title}>
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center gap-1.5 w-full px-2 mb-1 group"
                >
                  <ChevronDown
                    size={12}
                    className={cn(
                      "text-zinc-400 dark:text-zinc-500 transition-transform duration-200 shrink-0",
                      isGroupOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {group.title}
                  </span>
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-250 ease-in-out",
                    isGroupOpen ? "opacity-100" : "opacity-0 max-h-0"
                  )}
                >
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const href = item.label === "Início" ? homePath : item.href
                      const isActive =
                        href === "/dashboard"
                          ? pathname === "/dashboard" || pathname === homePath || pathname.startsWith("/dashboard/")
                          : pathname === href || pathname.startsWith(href + "/")
                      return (
                        <Link
                          key={item.label + item.href}
                          href={href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                          )}
                        >
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && item.badge() > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 px-1 text-[10px]">
                              {item.badge()}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
              {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
              <AvatarFallback className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {userName}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/signin" }) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 w-full"
          >
            <LogOut size={16} />
            Terminar Sessão
          </button>
        </div>
      </div>
    </>
  )
}
