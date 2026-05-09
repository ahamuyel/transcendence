"use client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

type SubjectAvg = { subjectId: string; subjectName: string; average: number; count: number }
type SummaryData = { studentId: string; subjectAverages: SubjectAvg[]; generalAverage: number; totalResults: number }

type Props = { studentId: string; trimester?: string; academicYear?: string }

const scoreColor = (score: number) => {
  if (score >= 14) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

const scoreBg = (score: number) => {
  if (score >= 14) return "bg-emerald-500"
  if (score >= 10) return "bg-amber-500"
  return "bg-rose-500"
}

const StudentGradeSummary = ({ studentId, trimester, academicYear }: Props) => {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ studentId })
    if (trimester) params.set("trimester", trimester)
    if (academicYear) params.set("academicYear", academicYear)

    fetch(`/api/results/averages?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [studentId, trimester, academicYear])

  if (loading) return <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
  if (!data || data.totalResults === 0) return <div className="text-sm text-zinc-400 text-center py-4">Sem resultados disponíveis</div>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900">
        <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Média Geral</span>
        <span className={`text-lg font-bold ${scoreColor(data.generalAverage)}`}>{data.generalAverage}</span>
      </div>

      <div className="flex flex-col gap-2">
        {data.subjectAverages.map((s) => (
          <div key={s.subjectId} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.subjectName}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(s.average)} transition-all`} style={{ width: `${(s.average / 20) * 100}%` }} />
                </div>
                <span className="text-[10px] text-zinc-400">{s.count} nota(s)</span>
              </div>
            </div>
            <span className={`text-sm font-bold ${scoreColor(s.average)}`}>{s.average}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentGradeSummary
