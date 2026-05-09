"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createClassSchema } from "@/lib/validations/academic"

type ClassData = {
  id?: string
  name: string
  grade: number
  capacity: number
  period?: string
  courseId?: string | null
  supervisorId?: string | null
}

type Props = {
  mode: "create" | "edit"
  initialData?: ClassData
  onSuccess: () => void
  onCancel: () => void
}

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const ClassForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    grade: initialData?.grade || 1,
    capacity: initialData?.capacity || 30,
    period: initialData?.period || "regular",
    courseId: initialData?.courseId || "",
    supervisorId: initialData?.supervisorId || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [courseOptions, setCourseOptions] = useState<Option[]>([])
  const [teacherOptions, setTeacherOptions] = useState<Option[]>([])

  useEffect(() => {
    fetch("/api/courses?limit=100").then(r => r.json()).then(d => setCourseOptions(d.data || []))
    fetch("/api/teachers?limit=100").then(r => r.json()).then(d => setTeacherOptions(d.data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      ...form,
      grade: Number(form.grade),
      capacity: Number(form.capacity),
      period: form.period || "regular",
      courseId: form.courseId || null,
      supervisorId: form.supervisorId || null,
    }

    const parsed = createClassSchema.safeParse(payload)
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
      const url = mode === "edit" ? `/api/classes/${initialData?.id}` : "/api/classes"
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
        <FormField label="Nome" error={errors.name}>
          <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </FormField>
        <FormField label="Classe" error={errors.grade}>
          <select className={inputClass} value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: Number(e.target.value) }))}>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>{g}ª classe</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Capacidade" error={errors.capacity}>
          <input className={inputClass} type="number" min={1} max={200} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
        </FormField>
        <FormField label="Período" error={errors.period}>
          <select className={inputClass} value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}>
            <option value="regular">Regular (Diurno)</option>
            <option value="pos_laboral">Pós-laboral (Nocturno)</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Curso" error={errors.courseId}>
          <select className={inputClass} value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
            <option value="">Nenhum</option>
            {courseOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Director de turma" error={errors.supervisorId}>
        <select className={inputClass} value={form.supervisorId} onChange={(e) => setForm((f) => ({ ...f, supervisorId: e.target.value }))}>
          <option value="">Nenhum</option>
          {teacherOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </FormField>

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

export default ClassForm
