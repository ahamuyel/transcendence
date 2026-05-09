"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { School, Users, GraduationCap, FileText, Loader2, UserCheck } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import StatusBadge from "@/components/ui/StatusBadge"
import { useTheme } from "@/provider/theme"

interface DashboardData {
  totalSchools: number
  activeSchools: number
  pendingSchools: number
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  totalParents: number
  totalApplications: number
  pendingApplications: number
  schoolsGrowth: { month: string; count: number }[]
  statusBreakdown: { status: string; count: number }[]
  recentSchools: { id: string; name: string; city: string; status: string; createdAt: string }[]
  recentApplications: {
    id: string; name: string; email: string; role: string; status: string; createdAt: string
    school: { name: string }
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "#f59e0b",
  aprovada: "#10b981",
  ativa: "#6366f1",
  suspensa: "#71717a",
  rejeitada: "#ef4444",
}

const roleLabels: Record<string, string> = {
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
  school_admin: "Admin",
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar dashboard")
        return r.json()
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const cards = [
    { icon: School, label: "Escolas ativas", value: data.activeSchools, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400" },
    { icon: School, label: "Escolas pendentes", value: data.pendingSchools, color: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400" },
    { icon: Users, label: "Utilizadores", value: data.totalUsers, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-400" },
    { icon: FileText, label: "Solicitações pendentes", value: data.pendingApplications, color: "text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-400" },
  ]

  const pieData = data.statusBreakdown.filter((s) => s.count > 0)

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Painel Super Admin</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Visão geral da plataforma</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Line Chart - Schools Growth */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Crescimento de Escolas</h2>
          <div className="h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.schoolsGrowth}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#18181b" : "#fff",
                    border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Escolas criadas"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Status Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Distribuição por Status</h2>
          <div className="h-[180px] sm:h-[220px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={35}
                    paddingAngle={2}
                    label={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#a1a1aa"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#18181b" : "#fff",
                      border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    formatter={(value: string) => (
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-zinc-400">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Schools */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:px-6 sm:pt-6 sm:pb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Escolas Recentes</h2>
            <Link href="/admin/schools" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {data.recentSchools.map((s) => (
                  <tr key={s.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 sm:px-6 py-3">
                      <Link href={`/admin/schools/${s.id}`} className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        {s.name}
                      </Link>
                      <div className="text-xs text-zinc-400">{s.city}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
                {data.recentSchools.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-6 text-center text-zinc-400 text-xs">Nenhuma escola</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:px-6 sm:pt-6 sm:pb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Solicitações Recentes</h2>
            <Link href="/admin/applications" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {data.recentApplications.map((a) => (
                  <tr key={a.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{a.name}</div>
                      <div className="text-xs text-zinc-400">
                        {a.school.name} &middot; {roleLabels[a.role] || a.role}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
                {data.recentApplications.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-6 text-center text-zinc-400 text-xs">Nenhuma solicitação</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
