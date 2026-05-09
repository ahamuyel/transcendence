"use client"
import { useState } from "react"
import FormField from "@/components/ui/FormField"

type AdminData = {
  id?: string
  name: string
  email: string
  permissions: {
    canManageApplications: boolean
    canManageTeachers: boolean
    canManageStudents: boolean
    canManageParents: boolean
    canManageClasses: boolean
    canManageCourses: boolean
    canManageSubjects: boolean
    canManageLessons: boolean
    canManageExams: boolean
    canManageAssignments: boolean
    canManageResults: boolean
    canManageAttendance: boolean
    canManageMessages: boolean
    canManageAnnouncements: boolean
    canManageAdmins: boolean
  }
}

type Props = {
  mode: "create" | "edit"
  initialData?: AdminData
  onSuccess: () => void
  onCancel: () => void
}

const PERMISSION_OPTIONS = [
  { key: "canManageApplications", label: "Solicitacoes" },
  { key: "canManageTeachers", label: "Professores" },
  { key: "canManageStudents", label: "Alunos" },
  { key: "canManageParents", label: "Encarregados" },
  { key: "canManageClasses", label: "Turmas" },
  { key: "canManageCourses", label: "Cursos" },
  { key: "canManageSubjects", label: "Disciplinas" },
  { key: "canManageLessons", label: "Aulas" },
  { key: "canManageExams", label: "Provas" },
  { key: "canManageAssignments", label: "Tarefas" },
  { key: "canManageResults", label: "Resultados" },
  { key: "canManageAttendance", label: "Assiduidade" },
  { key: "canManageMessages", label: "Mensagens" },
  { key: "canManageAnnouncements", label: "Avisos" },
  { key: "canManageAdmins", label: "Administradores" },
] as const

const defaultPermissions = {
  canManageApplications: false,
  canManageTeachers: false,
  canManageStudents: false,
  canManageParents: false,
  canManageClasses: false,
  canManageCourses: false,
  canManageSubjects: false,
  canManageLessons: false,
  canManageExams: false,
  canManageAssignments: false,
  canManageResults: false,
  canManageAttendance: false,
  canManageMessages: false,
  canManageAnnouncements: false,
  canManageAdmins: false,
}

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const AdminForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    permissions: initialData?.permissions || { ...defaultPermissions },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const validate = () => {
    const fieldErrors: Record<string, string> = {}
    if (!form.name || form.name.length < 2) fieldErrors.name = "Nome deve ter pelo menos 2 caracteres"
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fieldErrors.email = "E-mail invalido"
    if (mode === "create" && (!form.password || form.password.length < 6)) fieldErrors.password = "Palavra-passe deve ter pelo menos 6 caracteres"
    if (mode === "edit" && form.password && form.password.length < 6) fieldErrors.password = "Palavra-passe deve ter pelo menos 6 caracteres"
    return fieldErrors
  }

  const togglePermission = (key: string) => {
    setForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        [key]: !f.permissions[key as keyof typeof f.permissions],
      },
    }))
  }

  const allSelected = Object.values(form.permissions).every(Boolean)

  const toggleAll = () => {
    const newValue = !allSelected
    const updated = { ...form.permissions }
    for (const key of Object.keys(updated)) {
      updated[key as keyof typeof updated] = newValue
    }
    setForm((f) => ({ ...f, permissions: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        permissions: form.permissions,
      }
      if (form.password) payload.password = form.password

      const url = mode === "edit" ? `/api/admins/${initialData?.id}` : "/api/admins"
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
      setApiError("Erro de conexao")
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
        <FormField label="E-mail" error={errors.email}>
          <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </FormField>
      </div>

      <FormField label={mode === "create" ? "Palavra-passe" : "Palavra-passe (deixe vazio para manter)"} error={errors.password}>
        <input
          className={inputClass}
          type="password"
          value={form.password}
          placeholder={mode === "edit" ? "Deixe vazio para manter a actual" : ""}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Permissoes</label>
          <button
            type="button"
            onClick={toggleAll}
            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {allSelected ? "Desmarcar todas" : "Seleccionar todas"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PERMISSION_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={form.permissions[key as keyof typeof form.permissions]}
                onChange={() => togglePermission(key)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">{label}</span>
            </label>
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

export default AdminForm
