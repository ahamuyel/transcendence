"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createLessonSchema } from "@/lib/validations/academic"
import { Plus, Trash2 } from "lucide-react"

type Material = { title: string; url: string; type?: string }

type LessonData = {
  id?: string
  day: string
  startTime: string
  endTime: string
  room?: string
  subjectId: string
  classId: string
  teacherId: string
  materials?: Material[] | null
}

type Props = {
  mode: "create" | "edit"
  initialData?: LessonData
  onSuccess: () => void
  onCancel: () => void
}

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const DAYS = [
  { value: "Segunda", label: "Segunda" },
  { value: "Terça", label: "Terça" },
  { value: "Quarta", label: "Quarta" },
  { value: "Quinta", label: "Quinta" },
  { value: "Sexta", label: "Sexta" },
]

const materialTypes = ["pdf", "video", "link", "documento", "outro"]

const LessonForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    day: initialData?.day || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    room: initialData?.room || "",
    subjectId: initialData?.subjectId || "",
    classId: initialData?.classId || "",
    teacherId: initialData?.teacherId || "",
  })
  const [materials, setMaterials] = useState<Material[]>(
    (initialData?.materials as Material[]) || []
  )
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

  const addMaterial = () => setMaterials([...materials, { title: "", url: "", type: "link" }])
  const removeMaterial = (i: number) => setMaterials(materials.filter((_, idx) => idx !== i))
  const updateMaterial = (i: number, field: keyof Material, value: string) => {
    const updated = [...materials]
    updated[i] = { ...updated[i], [field]: value }
    setMaterials(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      ...form,
      materials: materials.length > 0 ? materials : null,
    }

    const parsed = createLessonSchema.safeParse(payload)
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
      const url = mode === "edit" ? `/api/lessons/${initialData?.id}` : "/api/lessons"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Dia" error={errors.day}>
          <select className={inputClass} value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}>
            <option value="">Selecionar dia...</option>
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Hora de Início" error={errors.startTime}>
          <input className={inputClass} type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
        </FormField>
        <FormField label="Hora de Fim" error={errors.endTime}>
          <input className={inputClass} type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
        </FormField>
      </div>

      <FormField label="Sala (opcional)" error={errors.room}>
        <input className={inputClass} value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
      </FormField>

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

      {/* Materials Section */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Materiais</span>
          <button type="button" onClick={addMaterial} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            <Plus size={14} /> Adicionar
          </button>
        </div>
        {materials.length === 0 && (
          <p className="text-xs text-zinc-400">Nenhum material adicionado.</p>
        )}
        <div className="flex flex-col gap-2">
          {materials.map((m, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  className={inputClass}
                  placeholder="Título"
                  value={m.title}
                  onChange={(e) => updateMaterial(i, "title", e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="URL"
                  value={m.url}
                  onChange={(e) => updateMaterial(i, "url", e.target.value)}
                />
                <select
                  className={inputClass}
                  value={m.type || "link"}
                  onChange={(e) => updateMaterial(i, "type", e.target.value)}
                >
                  {materialTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => removeMaterial(i)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
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

export default LessonForm
