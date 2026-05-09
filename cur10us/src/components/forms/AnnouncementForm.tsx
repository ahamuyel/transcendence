"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createAnnouncementSchema } from "@/lib/validations/academic"

type AnnouncementData = {
  id?: string
  title: string
  description: string
  priority?: string
  classId?: string | null
  courseId?: string | null
  targetUserId?: string | null
  scheduledAt?: string | null
}

type Props = {
  mode: "create" | "edit"
  initialData?: AnnouncementData
  onSuccess: () => void
  onCancel: () => void
}

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const AnnouncementForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "informativo",
    classId: initialData?.classId || "",
    courseId: initialData?.courseId || "",
    targetUserId: initialData?.targetUserId || "",
    scheduledAt: initialData?.scheduledAt ? initialData.scheduledAt.split("T")[0] + "T" + (initialData.scheduledAt.split("T")[1]?.slice(0, 5) || "08:00") : "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [classOptions, setClassOptions] = useState<Option[]>([])
  const [courseOptions, setCourseOptions] = useState<Option[]>([])
  const [userOptions, setUserOptions] = useState<Option[]>([])

  useEffect(() => {
    fetch("/api/classes?limit=100").then((r) => r.json()).then((d) => setClassOptions(d.data || []))
    fetch("/api/courses?limit=100").then((r) => r.json()).then((d) => setCourseOptions(d.data || []))
    fetch("/api/students?limit=200").then((r) => r.json()).then((d) => {
      const items = d.data || []
      setUserOptions(items.map((s: { id: string; name: string; userId?: string }) => ({
        id: s.userId || s.id,
        name: s.name,
      })).filter((u: Option) => u.id))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      classId: form.classId || null,
      courseId: form.courseId || null,
      targetUserId: form.targetUserId || null,
      scheduledAt: form.scheduledAt || null,
    }

    const parsed = createAnnouncementSchema.safeParse(payload)
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
      const url = mode === "edit" ? `/api/announcements/${initialData?.id}` : "/api/announcements"
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
        <input
          className={inputClass}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Título do comunicado"
        />
      </FormField>

      <FormField label="Descrição" error={errors.description}>
        <textarea
          className={inputClass}
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Escreva o comunicado..."
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Prioridade" error={errors.priority}>
          <select
            className={inputClass}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          >
            <option value="informativo">Informativo</option>
            <option value="importante">Importante</option>
            <option value="urgente">Urgente</option>
          </select>
        </FormField>

        <FormField label="Agendamento (opcional)" error={errors.scheduledAt}>
          <input
            className={inputClass}
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Turma (opcional)" error={errors.classId}>
          <select
            className={inputClass}
            value={form.classId}
            onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, courseId: "", targetUserId: "" }))}
          >
            <option value="">Todas as turmas</option>
            {classOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Curso (opcional)" error={errors.courseId}>
          <select
            className={inputClass}
            value={form.courseId}
            disabled={!!form.classId}
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value, classId: "", targetUserId: "" }))}
          >
            <option value="">Todos os cursos</option>
            {courseOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Utilizador (opcional)" error={errors.targetUserId}>
          <select
            className={inputClass}
            value={form.targetUserId}
            disabled={!!form.classId || !!form.courseId}
            onChange={(e) => setForm((f) => ({ ...f, targetUserId: e.target.value, classId: "", courseId: "" }))}
          >
            <option value="">Todos</option>
            {userOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
        >
          {loading ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  )
}

export default AnnouncementForm
