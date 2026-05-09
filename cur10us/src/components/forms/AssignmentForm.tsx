"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createAssignmentSchema } from "@/lib/validations/academic"

type AssignmentData = {
  id?: string
  title?: string | null
  description?: string | null
  dueDate: string
  maxScore?: number
  subjectId: string
  classId: string
  teacherId: string
}

type Props = {
  mode: "create" | "edit"
  initialData?: AssignmentData
  onSuccess: () => void
  onCancel: () => void
}

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const AssignmentForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate ? initialData.dueDate.split("T")[0] : "",
    maxScore: initialData?.maxScore?.toString() || "20",
    subjectId: initialData?.subjectId || "",
    classId: initialData?.classId || "",
    teacherId: initialData?.teacherId || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([])
  const [classOptions, setClassOptions] = useState<Option[]>([])
  const [teacherOptions, setTeacherOptions] = useState<Option[]>([])

  useEffect(() => {
    fetch("/api/subjects?limit=100").then(r => r.json()).then(d => setSubjectOptions(d.data || []))
    fetch("/api/classes?limit=100").then(r => r.json()).then(d => setClassOptions(d.data || []))
    fetch("/api/teachers?limit=100").then(r => r.json()).then(d => setTeacherOptions(d.data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      maxScore: parseFloat(form.maxScore) || 20,
      subjectId: form.subjectId,
      classId: form.classId,
      teacherId: form.teacherId,
    }

    const parsed = createAssignmentSchema.safeParse(payload)
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
      const url = mode === "edit" ? `/api/assignments/${initialData?.id}` : "/api/assignments"
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

      <FormField label="Título" error={errors.title}>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título da tarefa" />
      </FormField>

      <FormField label="Descrição (opcional)" error={errors.description}>
        <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descrição ou instruções da tarefa..." />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Data de Entrega" error={errors.dueDate}>
          <input className={inputClass} type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
        </FormField>
        <FormField label="Nota Máxima" error={errors.maxScore}>
          <input className={inputClass} type="number" min="1" max="100" value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Disciplina" error={errors.subjectId}>
          <select className={inputClass} value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
            <option value="">Selecionar disciplina...</option>
            {subjectOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Turma" error={errors.classId}>
          <select className={inputClass} value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}>
            <option value="">Selecionar turma...</option>
            {classOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Professor" error={errors.teacherId}>
          <select className={inputClass} value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
            <option value="">Selecionar professor...</option>
            {teacherOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
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

export default AssignmentForm
