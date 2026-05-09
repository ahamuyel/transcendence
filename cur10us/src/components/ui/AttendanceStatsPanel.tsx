"use client"
import { useState, useEffect } from "react"
import { Loader2, AlertTriangle } from "lucide-react"

type StudentStat = { studentId: string; studentName: string; total: number; presente: number; ausente: number; atrasado: number; percentage: number }
type ClassStats = { classId: string; students: StudentStat[]; classAverage: number }

type Props = { classId: string }

const barColor = (pct: number) => {
  if (pct >= 90) return "bg-emerald-500"
  if (pct >= 75) return "bg-amber-500"
  return "bg-rose-500"
}

const textColor = (pct: number) => {
  if (pct >= 90) return "text-emerald-600"
  if (pct >= 75) return "text-amber-600"
  return "text-rose-600"
}

const AttendanceStatsPanel = ({ classId }: Props) => {
  const [data, setData] = useState<ClassStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/attendance/stats?classId=${classId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classId])

  if (loading) return <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
  if (!data) return <div className="text-sm text-zinc-400 text-center py-4">Sem dados</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-center">
        <p className="text-[10px] text-zinc-500 uppercase font-bold">Média da Turma</p>
        <p className={`text-lg font-bold ${textColor(data.classAverage)}`}>{data.classAverage}%</p>
      </div>

      <div className="flex flex-col gap-2">
        {data.students.map((s) => (
          <div key={s.studentId} className={`flex items-center gap-3 p-2.5 rounded-xl border ${s.percentage < 75 ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.studentName}</p>
                {s.percentage < 75 && <AlertTriangle size={12} className="text-rose-500 shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(s.percentage)} transition-all`} style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-zinc-400">
                <span className="text-emerald-500">{s.presente}P</span>
                <span className="text-rose-500">{s.ausente}A</span>
                <span className="text-amber-500">{s.atrasado}At</span>
              </div>
            </div>
            <span className={`text-sm font-bold ${textColor(s.percentage)}`}>{s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AttendanceStatsPanel
