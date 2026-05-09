"use client"

import { BookOpen } from "lucide-react"

type Grade = {
  id: string
  subjectName: string
  score: number
  type: string
  date: string
  trimester: string | null
}

type Props = {
  grades: Grade[]
}

const typeLabels: Record<string, string> = {
  Prova: "Prova",
  Tarefa: "Tarefa",
  Trabalho: "Trabalho",
  Participação: "Participação",
}

function scoreColor(score: number) {
  if (score >= 14) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function scoreBg(score: number) {
  if (score >= 14) return "bg-emerald-50 dark:bg-emerald-950/30"
  if (score >= 10) return "bg-amber-50 dark:bg-amber-950/30"
  return "bg-red-50 dark:bg-red-950/30"
}

export default function StudentRecentGrades({ grades }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Últimas Notas</h3>
      </div>

      {grades.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">Sem notas recentes</p>
      ) : (
        <div className="space-y-2">
          {grades.map((g) => (
            <div key={g.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {g.subjectName}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {typeLabels[g.type] || g.type} · {new Date(g.date).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <span className={`text-lg font-bold tabular-nums px-2.5 py-0.5 rounded-lg ${scoreColor(g.score)} ${scoreBg(g.score)}`}>
                {g.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
