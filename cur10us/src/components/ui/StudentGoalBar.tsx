"use client"

import { Target } from "lucide-react"

type Props = {
  average: number
  goal?: number // default 14 (nota de destaque no sistema angolano)
}

export default function StudentGoalBar({ average, goal = 14 }: Props) {
  const percent = Math.min((average / 20) * 100, 100)
  const goalPercent = (goal / 20) * 100
  const reached = average >= goal

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Meta Académica</h3>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className={`text-3xl font-bold ${reached ? "text-emerald-600" : "text-amber-500"}`}>
            {average}
          </span>
          <span className="text-sm text-zinc-400 ml-1">/20</span>
        </div>
        <span className="text-sm text-zinc-500">
          Meta: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{goal}/20</span>
        </span>
      </div>

      {/* Progress bar with goal marker */}
      <div className="relative h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-visible">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            reached
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-amber-500 to-amber-400"
          }`}
          style={{ width: `${percent}%` }}
        />
        {/* Goal marker */}
        <div
          className="absolute top-0 w-0.5 h-6 -mt-1 bg-indigo-600 dark:bg-indigo-400"
          style={{ left: `${goalPercent}%` }}
        >
          <div className="absolute -top-5 -translate-x-1/2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            {goal}
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-3">
        {reached
          ? "Parabéns! Estás acima da meta."
          : `Faltam ${(goal - average).toFixed(1)} pontos para atingir a meta.`}
      </p>
    </div>
  )
}
