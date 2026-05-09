"use client"

import { useEffect, useState } from "react"
import {
  School,
  Users,
  UserCheck,
  GraduationCap,
  FileText,
  Loader2,
  BarChart3,
  TrendingUp,
} from "lucide-react"

interface StatsData {
  totalSchools: number
  activeSchools: number
  pendingSchools: number
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  totalParents: number
  totalApplications: number
  pendingApplications: number
}

interface StatCard {
  icon: React.ElementType
  label: string
  value: number
  color: string
  sub?: string
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const schoolCards: StatCard[] = [
    {
      icon: School,
      label: "Total de Escolas",
      value: data.totalSchools,
      color: "indigo",
      sub: `${data.activeSchools} ativas, ${data.pendingSchools} pendentes`,
    },
    {
      icon: TrendingUp,
      label: "Escolas Ativas",
      value: data.activeSchools,
      color: "emerald",
      sub: data.totalSchools > 0
        ? `${Math.round((data.activeSchools / data.totalSchools) * 100)}% do total`
        : undefined,
    },
    {
      icon: BarChart3,
      label: "Escolas Pendentes",
      value: data.pendingSchools,
      color: "amber",
      sub: data.totalSchools > 0
        ? `${Math.round((data.pendingSchools / data.totalSchools) * 100)}% do total`
        : undefined,
    },
  ]

  const userCards: StatCard[] = [
    {
      icon: Users,
      label: "Total de Utilizadores",
      value: data.totalUsers,
      color: "indigo",
      sub: `${data.totalTeachers} prof. · ${data.totalStudents} alunos · ${data.totalParents} enc.`,
    },
    {
      icon: UserCheck,
      label: "Professores",
      value: data.totalTeachers,
      color: "indigo",
      sub: data.totalUsers > 0
        ? `${Math.round((data.totalTeachers / data.totalUsers) * 100)}% dos utilizadores`
        : undefined,
    },
    {
      icon: GraduationCap,
      label: "Alunos",
      value: data.totalStudents,
      color: "cyan",
      sub: data.totalUsers > 0
        ? `${Math.round((data.totalStudents / data.totalUsers) * 100)}% dos utilizadores`
        : undefined,
    },
    {
      icon: Users,
      label: "Encarregados",
      value: data.totalParents,
      color: "violet",
      sub: data.totalUsers > 0
        ? `${Math.round((data.totalParents / data.totalUsers) * 100)}% dos utilizadores`
        : undefined,
    },
  ]

  const applicationCards: StatCard[] = [
    {
      icon: FileText,
      label: "Total de Solicitações",
      value: data.totalApplications,
      color: "indigo",
      sub: `${data.pendingApplications} pendente(s)`,
    },
    {
      icon: BarChart3,
      label: "Pendentes",
      value: data.pendingApplications,
      color: "amber",
      sub: data.totalApplications > 0
        ? `${Math.round((data.pendingApplications / data.totalApplications) * 100)}% do total`
        : undefined,
    },
  ]

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        Estatísticas da Plataforma
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Visão detalhada dos números da plataforma
      </p>

      {/* Section: Escolas */}
      <SectionTitle title="Escolas" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {schoolCards.map((card) => (
          <StatCardComponent key={card.label} card={card} />
        ))}
      </div>

      {/* Section: Utilizadores */}
      <SectionTitle title="Utilizadores" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {userCards.map((card) => (
          <StatCardComponent key={card.label} card={card} />
        ))}
      </div>

      {/* Section: Solicitações */}
      <SectionTitle title="Solicitações" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {applicationCards.map((card) => (
          <StatCardComponent key={card.label} card={card} />
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
      {title}
    </h2>
  )
}

const colorMap: Record<string, { iconBg: string; iconText: string }> = {
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconText: "text-indigo-600",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600",
  },
  cyan: {
    iconBg: "bg-cyan-50 dark:bg-cyan-950/40",
    iconText: "text-cyan-600",
  },
  violet: {
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconText: "text-violet-600",
  },
}

function StatCardComponent({ card }: { card: StatCard }) {
  const Icon = card.icon
  const colors = colorMap[card.color] ?? colorMap.indigo

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}
        >
          <Icon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {card.label}
        </span>
      </div>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {card.value.toLocaleString("pt-PT")}
      </p>
      {card.sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          {card.sub}
        </p>
      )}
    </div>
  )
}
