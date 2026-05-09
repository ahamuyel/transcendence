"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Users, Loader2 } from "lucide-react"

interface CountChartProps {
  maleStudents: number
  femaleStudents: number
  loading?: boolean
}

const COLORS = ['#6366f1', '#f43f5e']

const CountChart = ({ maleStudents, femaleStudents, loading }: CountChartProps) => {
  const total = maleStudents + femaleStudents
  const data = [
    { name: 'Rapazes', value: maleStudents },
    { name: 'Raparigas', value: femaleStudents },
  ]

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 flex flex-col h-full shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">Alunos</h2>
        <Users size={18} className="text-zinc-400" />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
        </div>
      ) : total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
          Sem alunos registados
        </div>
      ) : (
        <>
          <div className="flex-1 w-full min-h-[160px] sm:min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-zinc-900, #18181b)", border: "none", borderRadius: "12px", fontSize: "12px", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-2 sm:mt-4 text-xs sm:text-sm">
            <div className="flex flex-col items-center gap-0.5">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-indigo-500" />
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{maleStudents}</span>
              <span className="text-[10px] sm:text-xs text-zinc-500">Rapazes</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-rose-500" />
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{femaleStudents}</span>
              <span className="text-[10px] sm:text-xs text-zinc-500">Raparigas</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{total}</span>
              <span className="text-[10px] sm:text-xs text-zinc-500">Total</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CountChart
