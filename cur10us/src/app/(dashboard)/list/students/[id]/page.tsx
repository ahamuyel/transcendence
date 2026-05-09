"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, GraduationCap, BarChart3, Clock, FileText } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function StudentPortfolioPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/students/${id}/portfolio`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError("Erro ao carregar portfólio"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="m-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-500">{error || "Portfólio não disponível"}</p>
      </div>
    )
  }

  const { student, results, attendance, averages } = data
  const generalAvg = averages.length > 0
    ? Math.round((averages.reduce((acc: number, a: any) => acc + a.average, 0) / averages.length) * 10) / 10
    : 0

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative w-20 h-20 shrink-0">
            {student.foto ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={student.foto} alt={student.name} className="w-full h-full rounded-full object-cover border-4 border-zinc-200 dark:border-zinc-700" />
            ) : (
              <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold border-4 border-zinc-200 dark:border-zinc-700">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mt-1">
              {student.class && (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold">
                  {student.class.name}
                </span>
              )}
              {student.gender && (
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold capitalize">
                  {student.gender}
                </span>
              )}
              {student.dateOfBirth && (
                <span className="text-xs text-zinc-500">
                  Nascido em {new Date(student.dateOfBirth).toLocaleDateString("pt")}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{student.school.name}</p>
          </div>
          <Link
            href={`/list/students/${id}/certificate`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 shrink-0"
          >
            <FileText size={16} /> Certificado
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard icon={GraduationCap} label="Média Geral" value={generalAvg.toString()} color="indigo" />
        <SummaryCard icon={Clock} label="Assiduidade" value={`${attendance.percent}%`} color="emerald" />
        <SummaryCard icon={BarChart3} label="Disciplinas" value={averages.length.toString()} color="amber" />
      </div>

      {/* Results Table + Attendance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Results */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Notas por Disciplina</h2>
          {averages.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">Sem notas registadas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left py-2 pr-4 font-semibold text-zinc-500 text-xs">Disciplina</th>
                    <th className="text-center py-2 px-2 font-semibold text-zinc-500 text-xs">Média</th>
                    <th className="text-center py-2 px-2 font-semibold text-zinc-500 text-xs">Provas</th>
                  </tr>
                </thead>
                <tbody>
                  {averages.map((a: any) => (
                    <tr key={a.subjectId} className="border-b border-zinc-100 dark:border-zinc-800/50">
                      <td className="py-2.5 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{a.subjectName}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${a.average >= 10 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"}`}>
                          {a.average}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-zinc-500">{a.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detailed results */}
          {results.length > 0 && (
            <>
              <h3 className="text-xs font-bold text-zinc-500 mt-6 mb-3 uppercase tracking-wider">Todas as Notas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-2 pr-4 font-semibold text-zinc-500 text-xs">Disciplina</th>
                      <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Tipo</th>
                      <th className="text-center py-2 px-2 font-semibold text-zinc-500 text-xs">Nota</th>
                      <th className="text-right py-2 pl-2 font-semibold text-zinc-500 text-xs">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r: any) => (
                      <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                        <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-100">{r.subjectName}</td>
                        <td className="py-2 px-2 text-zinc-500 capitalize">{r.type}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.score >= 10 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"}`}>
                            {r.score}
                          </span>
                        </td>
                        <td className="py-2 pl-2 text-right text-zinc-500 text-xs">{new Date(r.date).toLocaleDateString("pt")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Assiduidade</h2>
          {attendance.total === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">Sem registos</p>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{attendance.percent}%</span>
                <p className="text-xs text-zinc-500 mt-1">Presença geral</p>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                {attendance.presente > 0 && (
                  <div className="bg-emerald-500 h-full" style={{ width: `${(attendance.presente / attendance.total) * 100}%` }} />
                )}
                {attendance.atrasado > 0 && (
                  <div className="bg-amber-500 h-full" style={{ width: `${(attendance.atrasado / attendance.total) * 100}%` }} />
                )}
                {attendance.ausente > 0 && (
                  <div className="bg-rose-500 h-full" style={{ width: `${(attendance.ausente / attendance.total) * 100}%` }} />
                )}
              </div>
              <div className="space-y-2">
                <AttendanceRow label="Presente" count={attendance.presente} total={attendance.total} color="emerald" />
                <AttendanceRow label="Atrasado" count={attendance.atrasado} total={attendance.total} color="amber" />
                <AttendanceRow label="Ausente" count={attendance.ausente} total={attendance.total} color="rose" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  const bgMap: Record<string, string> = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/40",
    emerald: "bg-emerald-50 dark:bg-emerald-950/40",
    amber: "bg-amber-50 dark:bg-amber-950/40",
  }
  const textMap: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
  }
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bgMap[color]} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${textMap[color]}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  )
}

function AttendanceRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const dotMap: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" }
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${dotMap[color]}`} />
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{count} <span className="text-zinc-400 text-xs">({total > 0 ? Math.round((count / total) * 100) : 0}%)</span></span>
    </div>
  )
}
