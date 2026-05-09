"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createCourseSchema, updateCourseSchema } from "@/lib/validations/academic"
import { X } from "lucide-react"

type GlobalCourse = { id: string; name: string; code: string }

type CourseData = {
  id?: string
  name: string
  globalCourseId?: string
  subjectIds?: string[]
  subjects?: string[]
}

type Props = {
  mode: "create" | "edit"
  initialData?: CourseData
  onSuccess: () => void
  onCancel: () => void
}

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const CourseForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    globalCourseId: initialData?.globalCourseId || "",
    subjectIds: initialData?.subjectIds || [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([])
  const [globalCourses, setGlobalCourses] = useState<GlobalCourse[]>([])

  useEffect(() => {
    fetch("/api/subjects?limit=100").then(r => r.json()).then(d => setSubjectOptions(d.data || []))
    if (mode === "create") {
      fetch("/api/school-catalog/courses").then(r => r.json()).then(d => setGlobalCourses(d.data || [])).catch(() => {})
    }
  }, [mode])

  const handleGlobalSelect = (id: string) => {
    const gc = globalCourses.find((c) => c.id === id)
    setForm((f) => ({ ...f, globalCourseId: id, name: gc?.name || f.name }))
  }

  const toggleId = (id: string) => {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds.includes(id) ? f.subjectIds.filter((v) => v !== id) : [...f.subjectIds, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const schema = mode === "edit" ? updateCourseSchema : createCourseSchema
    const payload = mode === "edit"
      ? { name: form.name, subjectIds: form.subjectIds }
      : form
    const parsed = schema.safeParse(payload)
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
      const url = mode === "edit" ? `/api/courses/${initialData?.id}` : "/api/courses"
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

      {mode === "create" && (
        <FormField label="Curso do Catálogo Global" error={errors.globalCourseId}>
          <select
            className={inputClass}
            value={form.globalCourseId}
            onChange={(e) => handleGlobalSelect(e.target.value)}
          >
            <option value="">Selecionar curso...</option>
            {globalCourses.map((gc) => (
              <option key={gc.id} value={gc.id}>{gc.name} ({gc.code})</option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Nome local (pode personalizar)" error={errors.name}>
        <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </FormField>

      <FormField label="Disciplinas" error={errors.subjectIds}>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {form.subjectIds.map((id) => {
            const s = subjectOptions.find((o) => o.id === id)
            return s ? (
              <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium">
                {s.name}
                <button type="button" onClick={() => toggleId(id)}><X size={12} /></button>
              </span>
            ) : null
          })}
        </div>
        <select className={inputClass} value="" onChange={(e) => { if (e.target.value) toggleId(e.target.value) }}>
          <option value="">Selecionar disciplina...</option>
          {subjectOptions.filter((o) => !form.subjectIds.includes(o.id)).map((o) => (
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

export default CourseForm
