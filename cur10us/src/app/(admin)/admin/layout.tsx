"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard,
  School,
  ShieldCheck,
  Users,
  Inbox,
  Settings,
  LogOut,
  Loader2,
  LifeBuoy,
  BookOpen,
  SlidersHorizontal,
  BarChart3,
  PanelLeft,
} from "lucide-react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import SessionGuard from "@/components/layout/SessionGuard"
import TwoFactorGate from "@/components/layout/TwoFactorGate"
import { SidebarProvider, useSidebar } from "@/hooks/useSidebar"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: School, label: "Escolas", href: "/admin/schools" },
  { icon: Users, label: "Utilizadores", href: "/admin/users" },
  { icon: Inbox, label: "Solicitações", href: "/admin/applications" },
  { icon: BookOpen, label: "Catálogo", href: "/admin/catalog" },
  { icon: SlidersHorizontal, label: "Config. Avaliação", href: "/admin/grading-config" },
  { icon: BarChart3, label: "Estatísticas", href: "/admin/stats" },
  { icon: ShieldCheck, label: "Super Admins", href: "/admin/super-admins" },
  { icon: LifeBuoy, label: "Suporte", href: "/admin/support" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
]

function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex md:flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out shrink-0",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Brand */}
        <div className="flex items-center h-14 px-3 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden",
              collapsed ? "justify-center w-full" : "flex-1"
            )}
          >
            <span
              className={cn(
                "font-bold",
                collapsed ? "text-lg" : "text-base",
                "text-zinc-900 dark:text-zinc-100 shrink-0"
              )}
            >
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
            {!collapsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                Admin
              </span>
            )}
          </Link>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="h-7 w-7 shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <PanelLeft size={15} />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto styled-scroll px-2 py-3 space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                      )}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex items-center justify-center h-10 w-10 mx-auto rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-200 w-full"
                >
                  <PanelLeft size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expandir</TooltipContent>
            </Tooltip>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-xl text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
                  >
                    <LogOut size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sair</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-7 w-7 border border-zinc-200 dark:border-zinc-700">
                  <AvatarFallback className="text-[9px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate hidden lg:block">
                  {session?.user?.name}
                </span>
              </div>
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

function AdminMobileHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { toggleMobile, mobileOpen, setMobileOpen } = useSidebar()

  const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/schools": "Escolas",
    "/admin/users": "Utilizadores",
    "/admin/super-admins": "Super Admins",
    "/admin/applications": "Solicitações",
    "/admin/settings": "Configurações",
  }

  function getPageTitle(p: string) {
    if (pageTitles[p]) return pageTitles[p]
    if (p.startsWith("/admin/schools/")) return "Detalhes da Escola"
    return "Admin"
  }

  return (
    <>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="font-bold text-zinc-900 dark:text-zinc-100">
            Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <PanelLeft size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto styled-scroll px-3 py-4 space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
          <button
            onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/signin" }) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 w-full"
          >
            <LogOut size={16} />
            Terminar Sessão
          </button>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <PanelLeft size={18} />
          </button>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{getPageTitle(pathname)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 hidden min-[400px]:block">{session?.user?.name}</span>
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin")
    } else if (status === "authenticated" && session?.user?.role !== "super_admin") {
      router.replace("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading" || session?.user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <SessionGuard>
      <TwoFactorGate>
        <SidebarProvider>
          <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
            <AdminSidebar />
            <AdminMobileHeader />
            <main className="flex-1 overflow-y-auto min-w-0">
              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </TwoFactorGate>
    </SessionGuard>
  )
}
