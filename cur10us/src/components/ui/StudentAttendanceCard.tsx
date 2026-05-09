"use client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

type Stats = { studentId: string; total: number; presente: number; ausente: number; atrasado: number; percentage: number }

type Props = { studentId: string }

const StudentAttendanceCard = ({ studentId }: Props) => {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/attendance/stats?studentId=${studentId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-indigo-500" /></div>
  if (!data || data.total === 0) return <div className="text-sm text-zinc-400 text-center py-3">Sem registos</div>

  const pctColor = data.percentage >= 90 ? "text-emerald-600" : data.percentage >= 75 ? "text-amber-600" : "text-rose-600"
  const barColor = data.percentage >= 90 ? "bg-emerald-500" : data.percentage >= 75 ? "bg-amber-500" : "bg-rose-500"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assiduidade</span>
        <span className={`text-lg font-bold ${pctColor}`}>{data.percentage}%</span>
      </div>

      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${data.percentage}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
          <p className="text-lg font-bold text-emerald-600">{data.presente}</p>
          <p className="text-[10px] text-zinc-500">Presente</p>
        </div>
        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20">
          <p className="text-lg font-bold text-rose-600">{data.ausente}</p>
          <p className="text-[10px] text-zinc-500">Ausente</p>
        </div>
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
          <p className="text-lg font-bold text-amber-600">{data.atrasado}</p>
          <p className="text-[10px] text-zinc-500">Atrasado</p>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 text-center">{data.total} aulas registadas</p>
    </div>
  )
}

export default StudentAttendanceCard
