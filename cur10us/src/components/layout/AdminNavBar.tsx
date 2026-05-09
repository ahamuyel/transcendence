"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import ThemeToggle from "@/components/ui/ThemeToggle"

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/schools": "Escolas",
  "/admin/users": "Utilizadores",
  "/admin/super-admins": "Super Admins",
  "/admin/applications": "Solicitações",
  "/admin/settings": "Configurações",
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith("/admin/schools/")) return "Detalhes da Escola"
  return "Admin"
}

const AdminNavBar = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const title = getPageTitle(pathname)

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1.5">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
          </span>
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 hidden min-[400px]:block">{session?.user?.name}</span>
        <ThemeToggle />
      </div>
    </div>
  )
}

export default AdminNavBar
