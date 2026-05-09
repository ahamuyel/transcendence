"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"

type Props = {
  lessonId: string
  classId: string
  onSuccess: () => void
  onCancel: () => void
}

type StudentOption = { id: string; name: string }
type Status = "presente" | "ausente" | "atrasado"

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const statusConfig: { value: Status; label: string; active: string }[] = [
  { value: "presente", label: "Presente", active: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" },
  { value: "ausente", label: "Ausente", active: "bg-rose-100 dark:bg-rose-950/40 text-rose-600" },
  { value: "atrasado", label: "Atrasado", active: "bg-amber-100 dark:bg-amber-950/40 text-amber-600" },
]

const inactiveClass = "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"

const LessonAttendanceForm = ({ lessonId, classId, onSuccess, onCancel }: Props) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [records, setRecords] = useState<Record<string, Status>>({})
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  useEffect(() => {
    fetch(`/api/classes/${classId}/students?limit=200`)
      .then((r) => r.json())
      .then((d) => {
        const items = d.data || []
        setStudents(items)
        const init: Record<string, Status> = {}
        items.forEach((s: StudentOption) => { init[s.id] = "presente" })
        setRecords(init)
      })
  }, [classId])

  // Load existing attendance for this lesson
  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/attendance`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.length) {
          const existing: Record<string, Status> = {}
          d.data.forEach((a: { student: { id: string }; status: Status }) => {
            existing[a.student.id] = a.status
          })
          setRecords((prev) => ({ ...prev, ...existing }))
        }
      })
  }, [lessonId])

  const setStatus = (studentId: string, status: Status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")
    setLoading(true)

    try {
      const payload = {
        date,
        records: Object.entries(records).map(([studentId, status]) => ({ studentId, status })),
      }
      const res = await fetch(`/api/lessons/${lessonId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || "Erro ao salvar")
        return
      }
      onSuccess()
    } catch {
      setApiError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {apiError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm">{apiError}</div>
      )}

      <FormField label="Data">
        <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>

      {students.length === 0 ? (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-sm">Nenhum aluno nesta turma.</div>
      ) : (
        <FormField label="Assiduidade dos Alunos">
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium truncate">{student.name}</span>
                <div className="flex gap-1 shrink-0">
                  {statusConfig.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => setStatus(student.id, sc.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        records[student.id] === sc.value ? sc.active : inactiveClass
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormField>
      )}

      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
          {loading ? "Salvando..." : "Registar"}
        </button>
      </div>
    </form>
  )
}

export default LessonAttendanceForm
