"use client"

import { FileText, ClipboardList, Calendar } from "lucide-react"

type Exam = { id: string; title: string; subjectName: string; date: string }
type Assignment = { id: string; title: string; subjectName: string; dueDate: string }

type Props = {
  exams: Exam[]
  assignments: Assignment[]
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const formatted = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })

  if (diffDays <= 0) return { text: "Hoje", urgent: true, formatted }
  if (diffDays === 1) return { text: "Amanhã", urgent: true, formatted }
  if (diffDays <= 3) return { text: `Em ${diffDays} dias`, urgent: true, formatted }
  return { text: formatted, urgent: false, formatted }
}

export default function StudentUpcoming({ exams, assignments }: Props) {
  const items = [
    ...exams.map((e) => ({ ...e, kind: "exam" as const, dueDate: e.date })),
    ...assignments.map((a) => ({ ...a, kind: "assignment" as const })),
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Próximos Eventos</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">Nenhum evento próximo</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => {
            const date = formatDate(item.dueDate)
            return (
              <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.kind === "exam"
                    ? "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                    : "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                }`}>
                  {item.kind === "exam" ? <FileText size={14} /> : <ClipboardList size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {item.subjectName} · {item.kind === "exam" ? "Prova" : "Tarefa"}
                  </p>
                </div>
                <span className={`text-xs font-semibold shrink-0 px-2 py-1 rounded-lg ${
                  date.urgent
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                    : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                }`}>
                  {date.text}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
