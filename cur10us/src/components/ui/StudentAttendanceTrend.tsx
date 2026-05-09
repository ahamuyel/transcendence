"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

type Props = {
  data: { month: string; percent: number; presente: number; ausente: number; atrasado: number }[]
}

export default function StudentAttendanceTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Assiduidade Mensal</h3>
        <p className="text-sm text-zinc-400 text-center py-8">Sem dados de assiduidade</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Assiduidade Mensal</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-zinc-500" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="text-zinc-500" unit="%" />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--color-zinc-200)",
              fontSize: "13px",
            }}
            formatter={(value) => [`${value}%`, "Assiduidade"]}
          />
          <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" label={{ value: "90%", position: "right", fontSize: 10, fill: "#10b981" }} />
          <Line
            type="monotone"
            dataKey="percent"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#6366f1" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
