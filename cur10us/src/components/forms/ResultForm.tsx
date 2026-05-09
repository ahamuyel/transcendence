"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createResultSchema } from "@/lib/validations/academic"

type ResultData = {
  id?: string
  studentId: string
  subjectId: string
  score: number
  type: string
  date: string
  examId?: string | null
  assignmentId?: string | null
  trimester?: string | null
  academicYear?: string | null
}

type Props = {
  mode: "create" | "edit"
  initialData?: ResultData
  onSuccess: () => void
  onCancel: () => void
}

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const resultTypes = ["Prova", "Tarefa", "Trabalho", "Participação"]
const trimesters = [
  { value: "primeiro", label: "1.º Trimestre" },
  { value: "segundo", label: "2.º Trimestre" },
  { value: "terceiro", label: "3.º Trimestre" },
]

const ResultForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    studentId: initialData?.studentId || "",
    subjectId: initialData?.subjectId || "",
    score: initialData?.score?.toString() || "",
    type: initialData?.type || "",
    date: initialData?.date ? initialData.date.split("T")[0] : "",
    examId: initialData?.examId || "",
    assignmentId: initialData?.assignmentId || "",
    trimester: initialData?.trimester || "",
    academicYear: initialData?.academicYear || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [studentOptions, setStudentOptions] = useState<Option[]>([])
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([])
  const [examOptions, setExamOptions] = useState<Option[]>([])
  const [assignmentOptions, setAssignmentOptions] = useState<Option[]>([])

  useEffect(() => {
    fetch("/api/students?limit=100").then((r) => r.json()).then((d) => {
      const items = d.data || []
      setStudentOptions(items.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
    })
    fetch("/api/subjects?limit=100").then((r) => r.json()).then((d) => setSubjectOptions(d.data || []))
    fetch("/api/exams?limit=100").then((r) => r.json()).then((d) => {
      const items = d.data || []
      setExamOptions(items.map((ex: { id: string; title?: string; date?: string }) => ({
        id: ex.id,
        name: ex.title || `Exame ${ex.date?.split("T")[0] || ex.id.slice(0, 6)}`,
      })))
    })
    fetch("/api/assignments?limit=100").then((r) => r.json()).then((d) => {
      const items = d.data || []
      setAssignmentOptions(items.map((a: { id: string; title?: string }) => ({
        id: a.id,
        name: a.title || `Tarefa ${a.id.slice(0, 6)}`,
      })))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      studentId: form.studentId,
      subjectId: form.subjectId,
      score: parseFloat(form.score),
      type: form.type,
      date: form.date,
      examId: form.examId === "" ? null : form.examId,
      assignmentId: form.assignmentId === "" ? null : form.assignmentId,
      trimester: form.trimester || null,
      academicYear: form.academicYear || null,
    }

    const parsed = createResultSchema.safeParse(payload)
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
      const url = mode === "edit" ? `/api/results/${initialData?.id}` : "/api/results"
      const res = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Aluno" error={errors.studentId}>
          <select className={inputClass} value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}>
            <option value="">Selecionar aluno...</option>
            {studentOptions.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </FormField>
        <FormField label="Disciplina" error={errors.subjectId}>
          <select className={inputClass} value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
            <option value="">Selecionar disciplina...</option>
            {subjectOptions.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Nota (0-20)" error={errors.score}>
          <input className={inputClass} type="number" step="0.1" min="0" max="20" value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} />
        </FormField>
        <FormField label="Tipo" error={errors.type}>
          <select className={inputClass} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="">Selecionar tipo...</option>
            {resultTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </FormField>
        <FormField label="Data" error={errors.date}>
          <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Trimestre" error={errors.trimester}>
          <select className={inputClass} value={form.trimester} onChange={(e) => setForm((f) => ({ ...f, trimester: e.target.value }))}>
            <option value="">Selecionar...</option>
            {trimesters.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </FormField>
        <FormField label="Ano Lectivo" error={errors.academicYear}>
          <input className={inputClass} value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))} placeholder="2025/2026" />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Exame (opcional)" error={errors.examId}>
          <select className={inputClass} value={form.examId} onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))}>
            <option value="">Nenhum</option>
            {examOptions.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </FormField>
        <FormField label="Tarefa (opcional)" error={errors.assignmentId}>
          <select className={inputClass} value={form.assignmentId} onChange={(e) => setForm((f) => ({ ...f, assignmentId: e.target.value }))}>
            <option value="">Nenhuma</option>
            {assignmentOptions.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </FormField>
      </div>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
          {loading ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  )
}

export default ResultForm
