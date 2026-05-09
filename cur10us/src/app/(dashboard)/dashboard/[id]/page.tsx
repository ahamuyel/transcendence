"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Users, UserRound, Presentation, GraduationCap, ClipboardList, Calendar, Inbox, Megaphone, Settings2 } from "lucide-react"

import StatCard from "@/components/ui/StatCard"
import CountChart from "@/components/ui/CountChart"
import AttendanceChart from "@/components/ui/AttendanceChart"
import FinanceChart from "@/components/ui/FinanceChart"
import EventCalendar from "@/components/ui/EventCalendar"
import Announcements from "@/components/ui/Announcements"
import BigCalendar from "@/components/ui/BigCalendar"
import StudentDashboard from "@/components/ui/StudentDashboard"

type SchoolStats = {
  students: number
  teachers: number
  parents: number
  classes: number
  maleStudents: number
  femaleStudents: number
  averageGrade: number
  pendingAssignments: number
  todayLessons: number
  pendingApplications: number
  recentAnnouncements: number
}

type CardConfig = { key: string; visible: boolean; size: "compact" | "normal" | "expanded" }

const defaultLayout: CardConfig[] = [
  { key: "students", visible: true, size: "normal" },
  { key: "teachers", visible: true, size: "normal" },
  { key: "classes", visible: true, size: "normal" },
  { key: "averageGrade", visible: true, size: "normal" },
  { key: "pendingAssignments", visible: true, size: "normal" },
  { key: "todayLessons", visible: true, size: "normal" },
  { key: "pendingApplications", visible: true, size: "normal" },
  { key: "recentAnnouncements", visible: true, size: "normal" },
]

const cardLabels: Record<string, string> = {
  students: "Alunos",
  teachers: "Professores",
  classes: "Turmas",
  averageGrade: "Média Geral",
  pendingAssignments: "Tarefas Pendentes",
  todayLessons: "Aulas Hoje",
  pendingApplications: "Solicitações",
  recentAnnouncements: "Avisos Recentes",
}


export default function DashboardPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [layout, setLayout] = useState<CardConfig[]>(defaultLayout)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [childrenList, setChildrenList] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin")
      return
    }
    if (status === "authenticated" && session?.user?.id) {
      if (session.user.role === "super_admin") {
        router.replace("/admin")
        return
      }
      if (id !== session.user.id && session.user.role !== "school_admin") {
        router.replace(`/dashboard/${session.user.id}`)
      }
    }
  }, [status, session, id, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "school_admin") {
      fetch("/api/school-stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {})

      fetch("/api/user-preferences/dashboard")
        .then((r) => r.json())
        .then((d) => { if (d.layout) setLayout(d.layout) })
        .catch(() => {})
    }
  }, [status, session])

  // Resolve studentId for student or parent
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return
    const role = session.user.role

    if (role === "student") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => { if (d.student?.id) setStudentId(d.student.id) })
        .catch(() => {})
    } else if (role === "parent") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          if (d.parent?.students?.length > 0) {
            setChildrenList(d.parent.students.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
            setStudentId(d.parent.students[0].id)
          }
        })
        .catch(() => {})
    }
  }, [status, session])

  const saveLayout = async (newLayout: CardConfig[]) => {
    setLayout(newLayout)
    await fetch("/api/user-preferences/dashboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: newLayout }),
    }).catch(() => {})
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const role = session?.user?.role

  // ========== SCHOOL ADMIN DASHBOARD ==========
  if (role === "school_admin") {
    const cardComponents: Record<string, { icon: typeof Users; color: string; value: string | number; href?: string }> = stats ? {
      students: { icon: Users, color: "emerald", value: stats.students, href: "/list/students" },
      teachers: { icon: UserRound, color: "indigo", value: stats.teachers, href: "/list/teachers" },
      classes: { icon: Presentation, color: "cyan", value: stats.classes, href: "/list/classes" },
      averageGrade: { icon: GraduationCap, color: "amber", value: `${stats.averageGrade}/20` },
      pendingAssignments: { icon: ClipboardList, color: "rose", value: stats.pendingAssignments, href: "/list/assignments" },
      todayLessons: { icon: Calendar, color: "indigo", value: stats.todayLessons, href: "/list/lessons" },
      pendingApplications: { icon: Inbox, color: "amber", value: stats.pendingApplications, href: "/list/applications" },
      recentAnnouncements: { icon: Megaphone, color: "cyan", value: stats.recentAnnouncements, href: "/list/announcements" },
    } : {}

    return (
      <div className="p-3 sm:p-4 lg:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Customize button */}
        <div className="flex justify-end">
          <button
            onClick={() => setCustomizeOpen(!customizeOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <Settings2 size={14} />
            Personalizar
          </button>
        </div>

        {/* Customize Modal */}
        {customizeOpen && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Personalizar Dashboard</h3>
            <div className="flex flex-col gap-2">
              {layout.map((card, i) => (
                <div key={card.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={card.visible}
                      onChange={() => {
                        const nl = [...layout]
                        nl[i] = { ...nl[i], visible: !nl[i].visible }
                        saveLayout(nl)
                      }}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {cardLabels[card.key] || card.key}
                  </label>
                  <select
                    value={card.size}
                    onChange={(e) => {
                      const nl = [...layout]
                      nl[i] = { ...nl[i], size: e.target.value as CardConfig["size"] }
                      saveLayout(nl)
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <option value="compact">Compacto</option>
                    <option value="normal">Normal</option>
                    <option value="expanded">Expandido</option>
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCustomizeOpen(false)}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Stat Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats ? (
            layout
              .filter((c) => c.visible && cardComponents[c.key])
              .map((c) => {
                const comp = cardComponents[c.key]
                return (
                  <StatCard
                    key={c.key}
                    label={cardLabels[c.key]}
                    value={comp.value}
                    icon={comp.icon}
                    color={comp.color}
                    href={comp.href}
                  />
                )
              })
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 sm:h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))
          )}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-8 flex flex-col gap-4 sm:gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-1">
                <CountChart
                  maleStudents={stats?.maleStudents || 0}
                  femaleStudents={stats?.femaleStudents || 0}
                  loading={!stats}
                />
              </div>
              <div className="lg:col-span-2">
                <AttendanceChart />
              </div>
            </div>
            <FinanceChart />
          </div>
          <aside className="xl:col-span-4 flex flex-col gap-4 sm:gap-6">
            <EventCalendar />
            <Announcements />
          </aside>
        </div>
      </div>
    )
  }

  // ========== STUDENT & PARENT DASHBOARD ==========
  if (role === "student" || role === "parent") {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Parent child selector */}
        {role === "parent" && childrenList.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Seleccionar filho(a)</label>
            <select
              value={studentId || ""}
              onChange={(e) => setStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {childrenList.map((child) => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>
        )}

        {studentId ? (
          <StudentDashboard studentId={studentId} />
        ) : (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        )}
      </div>
    )
  }

  // ========== TEACHER DASHBOARD (calendar view) ==========
  return (
    <div className="p-3 sm:p-4 lg:p-6 flex flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <section className="xl:col-span-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h1 className="text-base sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
              Agenda
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
              Visualize e gerencie suas aulas da semana
            </p>
            <BigCalendar />
          </div>
        </section>
        <aside className="xl:col-span-4 flex flex-col gap-4 sm:gap-6">
          <EventCalendar />
          <Announcements />
        </aside>
      </div>
    </div>
  )
}
