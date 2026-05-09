"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type TrimesterData = {
  label: string
  subjects: Record<string, number>
  generalAverage: number
}

type Props = {
  data: TrimesterData[]
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"]

export default function StudentTrimesterEvolution({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Evolução por Trimestre</h3>
        <p className="text-sm text-zinc-400 text-center py-8">
          {data.length === 0 ? "Sem dados" : "Dados de pelo menos 2 trimestres necessários"}
        </p>
      </div>
    )
  }

  // Collect all subject names
  const allSubjects = new Set<string>()
  for (const d of data) {
    for (const name of Object.keys(d.subjects)) allSubjects.add(name)
  }
  const subjectNames = Array.from(allSubjects)

  // Build chart data
  const chartData = data.map((d) => {
    const row: Record<string, string | number> = { trimester: d.label, "Média Geral": d.generalAverage }
    for (const name of subjectNames) {
      row[name] = d.subjects[name] ?? 0
    }
    return row
  })

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Evolução por Trimestre</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
          <XAxis dataKey="trimester" tick={{ fontSize: 11 }} className="text-zinc-500" />
          <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} className="text-zinc-500" />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--color-zinc-200)",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {/* General average - bold dashed line */}
          <Line
            type="monotone"
            dataKey="Média Geral"
            stroke="#18181b"
            strokeWidth={3}
            strokeDasharray="6 3"
            dot={{ r: 5, fill: "#18181b" }}
          />
          {/* Subject lines */}
          {subjectNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
