"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"

type Props = {
  data: { subjectName: string; average: number; count: number }[]
}

function scoreColor(score: number): string {
  if (score >= 14) return "#10b981"
  if (score >= 10) return "#f59e0b"
  return "#ef4444"
}

export default function StudentSubjectChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Médias por Disciplina</h3>
        <p className="text-sm text-zinc-400 text-center py-8">Sem dados de notas disponíveis</p>
      </div>
    )
  }

  const chartData = data
    .sort((a, b) => b.average - a.average)
    .map((d) => ({
      name: d.subjectName.length > 12 ? d.subjectName.slice(0, 11) + "…" : d.subjectName,
      fullName: d.subjectName,
      average: d.average,
      count: d.count,
    }))

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Médias por Disciplina</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-zinc-500" />
          <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} className="text-zinc-500" />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--color-zinc-200)",
              fontSize: "13px",
            }}
            formatter={(value) => [`${value}/20`, "Média"]}
          />
          <ReferenceLine y={14} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "Meta 14", position: "right", fontSize: 10, fill: "#6366f1" }} />
          <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={scoreColor(entry.average)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
