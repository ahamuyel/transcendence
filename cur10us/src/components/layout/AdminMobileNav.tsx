"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  School,
  Users,
  Inbox,
  ShieldCheck,
  Settings,
  Menu,
  LogOut,
  LifeBuoy,
  BookOpen,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: School, label: "Escolas", href: "/admin/schools" },
  { icon: Users, label: "Utilizadores", href: "/admin/users" },
  { icon: Inbox, label: "Solicitações", href: "/admin/applications" },
]

const moreItems = [
  { icon: BookOpen, label: "Catálogo", href: "/admin/catalog" },
  { icon: SlidersHorizontal, label: "Config. Avaliação", href: "/admin/grading-config" },
  { icon: BarChart3, label: "Estatísticas", href: "/admin/stats" },
  { icon: ShieldCheck, label: "Super Admins", href: "/admin/super-admins" },
  { icon: LifeBuoy, label: "Suporte", href: "/admin/support" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
]

const AdminMobileNav = () => {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-[68px] left-2 right-2 bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Icon size={16} className="shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => { setShowMore(false); signOut({ callbackUrl: "/signin" }) }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors w-full"
              >
                <LogOut size={16} className="shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
              showMore
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <Menu size={20} strokeWidth={showMore ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default AdminMobileNav
