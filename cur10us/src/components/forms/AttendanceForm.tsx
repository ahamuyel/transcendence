"use client"
import { useState, useEffect, useMemo } from "react"
import FormField from "@/components/ui/FormField"
import { createAttendanceSchema } from "@/lib/validations/academic"

type AttendanceData = {
  date: string
  classId: string
  lessonId?: string
  records: Record<string, "presente" | "ausente" | "atrasado">
}

type Props = {
  mode: "create" | "edit"
  initialData?: AttendanceData
  onSuccess: () => void
  onCancel: () => void
}

type ClassOption = { id: string; name: string }
type StudentOption = { id: string; name: string; surname?: string; classId?: string }
type LessonOption = { id: string; day: string; startTime: string; subject?: { name: string } }
type Status = "presente" | "ausente" | "atrasado"

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const statusConfig: { value: Status; label: string; active: string }[] = [
  { value: "presente", label: "Presente", active: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" },
  { value: "ausente", label: "Ausente", active: "bg-rose-100 dark:bg-rose-950/40 text-rose-600" },
  { value: "atrasado", label: "Atrasado", active: "bg-amber-100 dark:bg-amber-950/40 text-amber-600" },
]

const inactiveClass = "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"

const AttendanceForm = ({ mode: _mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState<{ date: string; classId: string; lessonId: string; records: Record<string, Status> }>({
    date: initialData?.date ? initialData.date.split("T")[0] : "",
    classId: initialData?.classId || "",
    lessonId: initialData?.lessonId || "",
    records: initialData?.records || {},
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  const [allStudents, setAllStudents] = useState<StudentOption[]>([])
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([])

  useEffect(() => {
    fetch("/api/classes?limit=100").then((r) => r.json()).then((d) => setClassOptions(d.data || []))
    fetch("/api/students?limit=200").then((r) => r.json()).then((d) => setAllStudents(d.data || []))
  }, [])

  // Fetch lessons for selected class
  useEffect(() => {
    if (!form.classId) { setLessonOptions([]); return }
    fetch(`/api/lessons?classId=${form.classId}&limit=50`)
      .then((r) => r.json())
      .then((d) => setLessonOptions(d.data || []))
  }, [form.classId])

  const filteredStudents = useMemo(() => {
    if (!form.classId) return []
    return allStudents.filter((s) => s.classId === form.classId)
  }, [form.classId, allStudents])

  // When classId changes, initialize all filtered students to "presente"
  useEffect(() => {
    if (!form.classId) return
    const newRecords: Record<string, Status> = {}
    filteredStudents.forEach((s) => {
      newRecords[s.id] = form.records[s.id] || "presente"
    })
    setForm((f) => ({ ...f, records: newRecords }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.classId, filteredStudents])

  const setStatus = (studentId: string, status: Status) => {
    setForm((f) => ({
      ...f,
      records: { ...f.records, [studentId]: status },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      date: form.date,
      classId: form.classId,
      lessonId: form.lessonId || null,
      records: Object.entries(form.records).map(([studentId, status]) => ({
        studentId,
        status,
      })),
    }

    const parsed = createAttendanceSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/attendance", {
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

  const studentName = (s: StudentOption) => s.surname ? `${s.name} ${s.surname}` : s.name

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {apiError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm">{apiError}</div>
      )}

      <FormField label="Data" error={errors.date}>
        <input
          className={inputClass}
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
      </FormField>

      <FormField label="Turma" error={errors.classId}>
        <select className={inputClass} value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, lessonId: "" }))}>
          <option value="">Selecionar turma...</option>
          {classOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </FormField>

      {form.classId && lessonOptions.length > 0 && (
        <FormField label="Aula (opcional)" error={errors.lessonId}>
          <select className={inputClass} value={form.lessonId} onChange={(e) => setForm((f) => ({ ...f, lessonId: e.target.value }))}>
            <option value="">Geral (sem aula específica)</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>{l.subject?.name || ""} — {l.day} {l.startTime}</option>
            ))}
          </select>
        </FormField>
      )}

      {form.classId && filteredStudents.length === 0 && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-sm">
          Nenhum aluno encontrado nesta turma.
        </div>
      )}

      {filteredStudents.length > 0 && (
        <FormField label="Assiduidade dos Alunos" error={errors.records}>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium truncate">
                  {studentName(student)}
                </span>
                <div className="flex gap-1 shrink-0">
                  {statusConfig.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => setStatus(student.id, sc.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        form.records[student.id] === sc.value ? sc.active : inactiveClass
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
          {loading ? "Salvando..." : "Criar"}
        </button>
      </div>
    </form>
  )
}

export default AttendanceForm
