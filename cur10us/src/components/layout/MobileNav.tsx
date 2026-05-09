"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { getDashboardPath } from "@/lib/routes"
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications"
import {
  LayoutDashboard,
  UserRound,
  Users,
  CalendarDays,
  Menu as MenuIcon,
  UserCheck,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  Settings,
  LogOut,
  Inbox,
  Home,
  BookMarked,
  Layers,
  Presentation,
  Calendar,
  FileText,
  ClipboardList,
  GraduationCap,
  CircleUser,
  Bell,
  ShieldCheck,
  X,
  HelpCircle,
  Upload,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { isFeatureEnabled, menuFeatureMap } from "@/lib/features"

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  visible: string[]
  permission?: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Início", href: "/dashboard", visible: ["school_admin", "teacher", "student", "parent"] },
  { icon: UserRound, label: "Professores", href: "/list/teachers", visible: ["school_admin", "teacher"], permission: "canManageTeachers" },
  { icon: Users, label: "Alunos", href: "/list/students", visible: ["school_admin", "teacher"], permission: "canManageStudents" },
  { icon: CalendarDays, label: "Agenda", href: "/list/lessons", visible: ["school_admin", "teacher"], permission: "canManageLessons" },
]

const allMenuItems: { title: string; items: NavItem[] }[] = [
  {
    title: "MENU",
    items: [
      { icon: Home, label: "Início", href: "/dashboard", visible: ["school_admin", "teacher", "student", "parent"] },
      { icon: Inbox, label: "Solicitações", href: "/list/applications", visible: ["school_admin"], permission: "canManageApplications" },
      { icon: ShieldCheck, label: "Administradores", href: "/list/admins", visible: ["school_admin"], permission: "canManageAdmins" },
      { icon: UserRound, label: "Professores", href: "/list/teachers", visible: ["school_admin", "teacher"], permission: "canManageTeachers" },
      { icon: Users, label: "Alunos", href: "/list/students", visible: ["school_admin", "teacher"], permission: "canManageStudents" },
      { icon: UserCheck, label: "Encarregados", href: "/list/parents", visible: ["school_admin", "teacher"], permission: "canManageParents" },
      { icon: BookMarked, label: "Disciplinas", href: "/list/subjects", visible: ["school_admin"], permission: "canManageSubjects" },
      { icon: Layers, label: "Cursos", href: "/list/courses", visible: ["school_admin"], permission: "canManageCourses" },
      { icon: Presentation, label: "Turmas", href: "/list/classes", visible: ["school_admin", "teacher"], permission: "canManageClasses" },
      { icon: Calendar, label: "Aulas", href: "/list/lessons", visible: ["school_admin", "teacher"], permission: "canManageLessons" },
      { icon: FileText, label: "Provas", href: "/list/exams", visible: ["school_admin", "teacher", "student", "parent"], permission: "canManageExams" },
      { icon: ClipboardList, label: "Tarefas", href: "/list/assignments", visible: ["school_admin", "teacher", "student", "parent"], permission: "canManageAssignments" },
      { icon: GraduationCap, label: "Resultados", href: "/list/results", visible: ["school_admin", "teacher", "student", "parent"], permission: "canManageResults" },
      { icon: CalendarCheck, label: "Assiduidade", href: "/list/attendance", visible: ["school_admin", "teacher", "student", "parent"], permission: "canManageAttendance" },
      { icon: MessageSquare, label: "Mensagens", href: "/list/messages", visible: ["school_admin", "teacher", "student", "parent"], permission: "canManageMessages" },
      { icon: Megaphone, label: "Avisos", href: "/list/announcements", visible: ["school_admin", "teacher", "student", "parent"], permission: "canManageAnnouncements" },
      { icon: Upload, label: "Importar", href: "/dashboard/import", visible: ["school_admin"], permission: "canManageStudents" },
    ],
  },
  {
    title: "OUTROS",
    items: [
      { icon: Home, label: "Minha Área", href: "/minha-area", visible: ["school_admin", "teacher", "student", "parent"] },
      { icon: CircleUser, label: "Perfil", href: "/profile", visible: ["school_admin", "teacher", "student", "parent"] },
      { icon: Settings, label: "Configurações", href: "/settings", visible: ["school_admin", "teacher", "student", "parent"] },
      { icon: HelpCircle, label: "Ajuda", href: "/help", visible: ["school_admin", "teacher", "student", "parent"] },
    ],
  },
]

const MobileNav = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const homePath = getDashboardPath(session?.user?.id)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { unreadCount } = useUnreadNotifications()

  const role = session?.user?.role || "student"
  const adminLevel = session?.user?.adminLevel
  const permissions = (session?.user?.permissions || []) as string[]
  const schoolFeatures = (session?.user as { schoolFeatures?: Record<string, boolean> | null })?.schoolFeatures

  function isVisible(item: NavItem): boolean {
    if (!item.visible.includes(role)) return false
    if (role === "school_admin" && item.permission && adminLevel === "secondary") {
      return permissions.includes(item.permission)
    }
    // Feature flag check
    const feature = menuFeatureMap[item.href]
    if (feature && !isFeatureEnabled(schoolFeatures, feature)) {
      return false
    }
    return true
  }

  const filteredNavItems = navItems.filter(isVisible)

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  return (
    <>
      {/* Drawer backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" onClick={() => setDrawerOpen(false)} className="font-bold text-zinc-900 dark:text-zinc-100">
            Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto styled-scroll px-3 py-2 max-h-[calc(100vh-130px)]">
          {allMenuItems.map((section) => (
            <div key={section.title} className="mb-2">
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-2 block">
                {section.title}
              </span>
              {section.items.map((item) => {
                if (!isVisible(item)) return null
                const href = item.label === "Início" ? homePath : item.href
                const isActive = pathname === href || pathname.startsWith(href + "/")
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => { setDrawerOpen(false); signOut({ callbackUrl: "/signin" }) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const href = item.label === "Início" ? homePath : item.href
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={item.label}
                href={href}
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

          {/* Notifications */}
          <Link
            href="/list/announcements"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] relative ${
              pathname.startsWith("/list/announcements")
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">Avisos</span>
          </Link>

          {/* Menu drawer toggle */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
              drawerOpen
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <MenuIcon size={20} strokeWidth={drawerOpen ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-none">Menu</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default MobileNav
