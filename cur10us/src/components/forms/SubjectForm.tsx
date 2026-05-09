"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createSubjectSchema, updateSubjectSchema } from "@/lib/validations/academic"

type GlobalSubject = { id: string; name: string; code: string }

type SubjectData = {
  id?: string
  name: string
  globalSubjectId?: string
}

type Props = {
  mode: "create" | "edit"
  initialData?: SubjectData
  onSuccess: () => void
  onCancel: () => void
}

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const SubjectForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    globalSubjectId: initialData?.globalSubjectId || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [globalSubjects, setGlobalSubjects] = useState<GlobalSubject[]>([])

  useEffect(() => {
    if (mode === "create") {
      fetch("/api/school-catalog/subjects")
        .then((r) => r.json())
        .then((d) => setGlobalSubjects(d.data || []))
        .catch(() => {})
    }
  }, [mode])

  const handleGlobalSelect = (id: string) => {
    const gs = globalSubjects.find((s) => s.id === id)
    setForm((f) => ({ ...f, globalSubjectId: id, name: gs?.name || f.name }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const schema = mode === "edit" ? updateSubjectSchema : createSubjectSchema
    const parsed = schema.safeParse(mode === "edit" ? { name: form.name } : form)
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
      const url = mode === "edit" ? `/api/subjects/${initialData?.id}` : "/api/subjects"
      const payload = mode === "edit" ? { name: form.name } : form
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
        <FormField label="Disciplina do Catálogo Global" error={errors.globalSubjectId}>
          <select
            className={inputClass}
            value={form.globalSubjectId}
            onChange={(e) => handleGlobalSelect(e.target.value)}
          >
            <option value="">Selecionar disciplina...</option>
            {globalSubjects.map((gs) => (
              <option key={gs.id} value={gs.id}>{gs.name} ({gs.code})</option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Nome local (pode personalizar)" error={errors.name}>
        <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
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

export default SubjectForm
