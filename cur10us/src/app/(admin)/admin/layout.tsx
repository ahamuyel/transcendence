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
} from "lucide-react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import AdminNavBar from "@/components/layout/AdminNavBar"
import AdminMobileNav from "@/components/layout/AdminMobileNav"
import SessionGuard from "@/components/layout/SessionGuard"

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

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
    <div className="h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[72px] lg:w-[220px] shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col transition-all duration-200">
        <div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="flex items-center justify-center lg:justify-start gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 hidden lg:inline">
              Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 lg:hidden text-lg">
              C<span className="text-indigo-600 dark:text-indigo-400">X</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium hidden lg:inline">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-2 lg:p-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 lg:py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon size={18} />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 lg:p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-center lg:justify-between px-3">
            <span className="text-xs text-zinc-500 hidden lg:block">{session.user.name}</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 lg:py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors w-full"
          >
            <LogOut size={18} />
            <span className="hidden lg:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <AdminNavBar />

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-[#f7f8fa] dark:bg-zinc-950 pb-20 md:pb-0 min-w-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <AdminMobileNav />
    </div>
    </SessionGuard>
  )
}
