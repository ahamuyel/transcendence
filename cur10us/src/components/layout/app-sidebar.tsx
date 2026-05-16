"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getDashboardPath } from "@/lib/routes"
import { isFeatureEnabled, menuFeatureMap } from "@/lib/features"
import { useSchoolBranding } from "@/provider/school-branding"
import { useSidebar } from "@/hooks/useSidebar"
import { navGroups, type NavItem } from "@/lib/routes.config"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const GROUP_STATE_KEY = "sidebar_groups"

function useNavFilter() {
  const { data: session } = useSession()
  const role = (session?.user?.role || "student") as import("@/lib/routes.config").UserRole
  const adminLevel = session?.user?.adminLevel
  const permissions = session?.user?.permissions || []
  const schoolFeatures = (session?.user as { schoolFeatures?: Record<string, boolean> | null })?.schoolFeatures

  const isVisible = useCallback((item: NavItem): boolean => {
    if (!item.roles.includes(role)) return false
    if (role === "school_admin" && item.permission && adminLevel === "secondary") {
      return (permissions as string[]).includes(item.permission)
    }
    const feature = item.feature || menuFeatureMap[item.href]
    if (feature && !isFeatureEnabled(schoolFeatures, feature)) return false
    return true
  }, [role, adminLevel, permissions, schoolFeatures])

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

function NavItemLink({
  item,
  collapsed,
  isActive,
  homePath,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
  homePath: string
}) {
  const href = item.label === "Início" ? homePath : item.href

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
      )}
    >
      <item.icon
        size={18}
        strokeWidth={isActive ? 2.5 : 2}
        className="shrink-0"
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && item.badge() > 0 && (
        <Badge variant="default" className="h-5 min-w-5 px-1 text-[10px]">
          {item.badge()}
        </Badge>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-200",
              isActive
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            )}
          >
            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && item.badge() > 0 && (
            <Badge variant="default" className="h-5 min-w-5 px-1 text-[10px]">
              {item.badge()}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { collapsed, setCollapsed } = useSidebar()
  const { isVisible } = useNavFilter()
  const { name, logo } = useSchoolBranding()
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

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(isVisible),
    }))
    .filter((group) => group.items.length > 0)

  const { openGroups, toggleGroup } = useGroupState(filteredGroups.map((g) => g.title))

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex md:flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-[width] duration-300 ease-in-out shrink-0",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Header / Brand — always fixed at top */}
        <div className={cn(
          "flex items-center h-14 border-b border-zinc-200 dark:border-zinc-800 shrink-0 transition-all duration-300",
          collapsed ? "justify-center px-0" : "justify-between px-3"
        )}>
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden transition-all duration-300",
              collapsed ? "justify-center w-full" : "flex-1"
            )}
          >
            {logo ? (
              <img
                src={logo}
                alt={name || "Logo"}
                className="w-7 h-7 rounded-lg object-contain shrink-0"
              />
            ) : (
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 shrink-0">
                {collapsed ? (
                  <>
                    C<span className="text-indigo-600 dark:text-indigo-400">X</span>
                  </>
                ) : (
                  <>
                    Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
                  </>
                )}
              </span>
            )}
            {!collapsed && name && (
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate opacity-100 transition-opacity duration-200">
                {name}
              </span>
            )}
          </Link>

          {/* Collapse/Expand button — pinned at top */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0"
              title="Colapsar sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>

        {/* Expand button — visible only when collapsed, pinned below header */}
        {collapsed && (
          <div className="flex justify-center py-3 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title="Expandir sidebar"
            >
              <PanelLeft size={15} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto styled-scroll px-2 py-3 space-y-4">
          {filteredGroups.map((group) => {
            const isGroupOpen = openGroups[group.title] !== false

            if (collapsed) {
              return (
                <div key={group.title}>
                  {group.items.map((item) => {
                    const href = item.label === "Início" ? homePath : item.href
                    const isActive =
                      href === "/dashboard"
                        ? pathname === "/dashboard" || pathname === homePath || pathname.startsWith("/dashboard/")
                        : pathname === href || pathname.startsWith(href + "/")
                    return (
                      <NavItemLink
                        key={item.label + item.href}
                        item={item}
                        collapsed
                        isActive={isActive}
                        homePath={homePath}
                      />
                    )
                  })}
                </div>
              )
            }

            return (
              <div key={group.title}>
                {/* Group header — clickable to toggle */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center gap-1.5 w-full px-3 mb-1 group"
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

                {/* Collapsible items */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-250 ease-in-out",
                    isGroupOpen ? "opacity-100" : "opacity-0 max-h-0"
                  )}
                >
                  <div className={cn("space-y-0.5", isGroupOpen && "pb-0")}>
                    {group.items.map((item) => {
                      const href = item.label === "Início" ? homePath : item.href
                      const isActive =
                        href === "/dashboard"
                          ? pathname === "/dashboard" || pathname === homePath || pathname.startsWith("/dashboard/")
                          : pathname === href || pathname.startsWith(href + "/")
                      return (
                        <NavItemLink
                          key={item.label + item.href}
                          item={item}
                          collapsed={false}
                          isActive={isActive}
                          homePath={homePath}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Section — always at bottom */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 shrink-0">
          <Link href="/profile" className="flex items-center gap-3 px-2 py-1.5 group">
            <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700 shrink-0">
              {userImage ? (
                <AvatarImage src={userImage} alt={userName} />
              ) : null}
              <AvatarFallback className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                  {userEmail}
                </p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </TooltipProvider>
  )
}
