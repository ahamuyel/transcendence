"use client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

type Subject = { id: string; name: string }
type StudentSummary = { studentId: string; studentName: string; subjectAverages: Record<string, number>; average: number | null }
type SummaryData = { classId: string; subjects: Subject[]; students: StudentSummary[]; classAverage: number | null; best: number | null; worst: number | null }

type Props = { classId: string; trimester?: string; academicYear?: string }

const scoreColor = (score: number | null) => {
  if (score === null) return "text-zinc-400"
  if (score >= 14) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

const ClassGradeSummary = ({ classId, trimester, academicYear }: Props) => {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ classId })
    if (trimester) params.set("trimester", trimester)
    if (academicYear) params.set("academicYear", academicYear)

    fetch(`/api/results/class-summary?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classId, trimester, academicYear])

  if (loading) return <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
  if (!data) return <div className="text-sm text-zinc-400 text-center py-4">Sem dados</div>

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-center">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Média da Turma</p>
          <p className={`text-lg font-bold ${scoreColor(data.classAverage)}`}>{data.classAverage ?? "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-center">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Melhor</p>
          <p className="text-lg font-bold text-emerald-600">{data.best ?? "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-center">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Menor</p>
          <p className="text-lg font-bold text-rose-600">{data.worst ?? "—"}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left py-2 px-2 text-xs font-bold text-zinc-500 uppercase">Aluno</th>
              {data.subjects.map((s) => (
                <th key={s.id} className="text-center py-2 px-2 text-xs font-bold text-zinc-500 uppercase whitespace-nowrap">{s.name}</th>
              ))}
              <th className="text-center py-2 px-2 text-xs font-bold text-zinc-500 uppercase">Média</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((st) => (
              <tr key={st.studentId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                <td className="py-2 px-2 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{st.studentName}</td>
                {data.subjects.map((s) => (
                  <td key={s.id} className={`text-center py-2 px-2 font-semibold ${scoreColor(st.subjectAverages[s.id] ?? null)}`}>
                    {st.subjectAverages[s.id] != null ? st.subjectAverages[s.id] : "—"}
                  </td>
                ))}
                <td className={`text-center py-2 px-2 font-bold ${scoreColor(st.average)}`}>
                  {st.average ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClassGradeSummary
