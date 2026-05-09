"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { CreditCard } from "lucide-react"
import { useTheme } from "@/provider/theme"

const data: { name: string; income: number; expense: number }[] = []

const FinanceChart = () => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col border border-zinc-200 dark:border-zinc-800">

      {/* Header */}
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">Finanças</h2>
        <CreditCard className="text-zinc-400" size={18} />
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm min-h-[200px]">
          Módulo financeiro em breve
        </div>
      ) : (
      <div className="w-full min-h-[200px] sm:min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#3f3f46" : "#e5e7eb"} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: isDark ? "#a1a1aa" : "#9ca3af", fontSize: 10 }}
              tickLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tick={{ fill: isDark ? "#a1a1aa" : "#9ca3af", fontSize: 10 }}
              tickLine={false}
              tickMargin={8}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? "#18181b" : "#fff",
                border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
                borderRadius: "12px",
                fontSize: "12px",
                color: isDark ? "#fafafa" : "#18181b",
              }}
            />
            <Line type="monotone" dataKey="income" stroke="#4f46e5" strokeWidth={2.5} dot={false} name="Receita" />
            <Line type="monotone" dataKey="expense" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Despesa" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      )}

      {data.length > 0 && (
      <div className="flex justify-center gap-4 sm:gap-6 mt-2 sm:mt-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-600" />
          <span>Receita</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Despesa</span>
        </div>
      </div>
      )}
    </div>
  )
}

export default FinanceChart
