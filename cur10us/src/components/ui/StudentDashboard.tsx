"use client"

import { useEffect, useState } from "react"
import { Loader2, GraduationCap, CalendarCheck, ClipboardList, BookOpen } from "lucide-react"
import StatCard from "./StatCard"
import StudentSubjectChart from "./StudentSubjectChart"
import StudentAttendanceTrend from "./StudentAttendanceTrend"
import StudentTrimesterEvolution from "./StudentTrimesterEvolution"
import StudentGoalBar from "./StudentGoalBar"
import StudentRecentGrades from "./StudentRecentGrades"
import StudentUpcoming from "./StudentUpcoming"

type DashboardData = {
  student: { id: string; name: string; class: { name: string; grade: number } | null }
  generalAverage: number
  attendancePercent: number
  totalResults: number
  pendingSubmissions: number
  subjectAverages: { subjectId: string; subjectName: string; average: number; count: number }[]
  attendance: { total: number; presente: number; ausente: number; atrasado: number; percent: number }
  attendanceByMonth: { month: string; percent: number; presente: number; ausente: number; atrasado: number }[]
  trimesterEvolution: { label: string; subjects: Record<string, number>; generalAverage: number }[]
  recentResults: { id: string; subjectName: string; score: number; type: string; date: string; trimester: string | null }[]
  upcomingExams: { id: string; title: string; subjectName: string; date: string }[]
  upcomingAssignments: { id: string; title: string; subjectName: string; dueDate: string }[]
}

type Props = {
  studentId: string
}

export default function StudentDashboard({ studentId }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/students/${studentId}/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao carregar dados")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Não foi possível carregar o dashboard"))
  }, [studentId])

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Olá, {data.student.name.split(" ")[0]}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          {data.student.class ? `${data.student.class.name} · ${data.student.class.grade}ª classe` : "Sem turma atribuída"}
        </p>
      </div>

      {/* Hero stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Média Geral"
          value={`${data.generalAverage}/20`}
          icon={GraduationCap}
          color={data.generalAverage >= 14 ? "emerald" : data.generalAverage >= 10 ? "amber" : "rose"}
        />
        <StatCard
          label="Assiduidade"
          value={`${data.attendancePercent}%`}
          icon={CalendarCheck}
          color={data.attendancePercent >= 90 ? "emerald" : data.attendancePercent >= 75 ? "amber" : "rose"}
        />
        <StatCard
          label="Total de Notas"
          value={data.totalResults}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          label="Tarefas Pendentes"
          value={data.pendingSubmissions}
          icon={ClipboardList}
          color={data.pendingSubmissions > 0 ? "amber" : "emerald"}
        />
      </section>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StudentSubjectChart data={data.subjectAverages} />
        <StudentAttendanceTrend data={data.attendanceByMonth} />
      </div>

      {/* Goal + Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <StudentGoalBar average={data.generalAverage} />
        </div>
        <div className="lg:col-span-2">
          <StudentTrimesterEvolution data={data.trimesterEvolution} />
        </div>
      </div>

      {/* Recent grades + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StudentRecentGrades grades={data.recentResults} />
        <StudentUpcoming exams={data.upcomingExams} assignments={data.upcomingAssignments} />
      </div>
    </div>
  )
}
