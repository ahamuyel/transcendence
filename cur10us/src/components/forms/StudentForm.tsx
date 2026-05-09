"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createStudentSchema } from "@/lib/validations/entities"
import { Copy, Check } from "lucide-react"

type StudentData = {
  id?: string
  name: string
  email: string
  phone: string
  address: string
  foto?: string | null
  classId?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  documentType?: string | null
  documentNumber?: string | null
}

type Props = {
  mode: "create" | "edit"
  initialData?: StudentData
  onSuccess: () => void
  onCancel: () => void
}

type ClassOption = { id: string; name: string; grade: number }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const StudentForm = ({ mode, initialData, onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    foto: initialData?.foto || "",
    classId: initialData?.classId || "",
    gender: initialData?.gender || "",
    dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.slice(0, 10) : "",
    documentType: initialData?.documentType || "",
    documentNumber: initialData?.documentNumber || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [createAccount, setCreateAccount] = useState(false)
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])

  useEffect(() => {
    fetch("/api/classes?limit=100").then(r => r.json()).then(d => setClassOptions(d.data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const submitData = {
      ...form,
      classId: form.classId || null,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      documentType: form.documentType || undefined,
      documentNumber: form.documentNumber || undefined,
    }
    const parsed = createStudentSchema.safeParse(submitData)
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
      const url = mode === "edit" ? `/api/students/${initialData?.id}` : "/api/students"
      const payload = mode === "create" && createAccount ? { ...submitData, createAccount: true } : submitData
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
      if (data.tempPassword) {
        setCreatedCreds({ email: form.email, password: data.tempPassword })
        return
      }
      onSuccess()
    } catch {
      setApiError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!createdCreds) return
    navigator.clipboard.writeText(`E-mail: ${createdCreds.email}\nPalavra-passe: ${createdCreds.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdCreds) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">Aluno criado com conta de acesso!</p>
          <code className="block text-xs bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 mb-2">
            E-mail: {createdCreds.email}<br />Palavra-passe: {createdCreds.password}
          </code>
          <button type="button" onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copiado" : "Copiar credenciais"}
          </button>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">O utilizador será obrigado a alterar a palavra-passe no primeiro acesso.</p>
        </div>
        <button type="button" onClick={onSuccess} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20">
          Fechar
        </button>
      </div>
    )
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Telefone" error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </FormField>
        <FormField label="Foto (URL)" error={errors.foto}>
          <input className={inputClass} value={form.foto} onChange={(e) => setForm((f) => ({ ...f, foto: e.target.value }))} />
        </FormField>
      </div>

      <FormField label="Endereço" error={errors.address}>
        <input className={inputClass} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Género" error={errors.gender}>
          <select className={inputClass} value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </FormField>
        <FormField label="Data de Nascimento" error={errors.dateOfBirth}>
          <input className={inputClass} type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Tipo de Documento" error={errors.documentType}>
          <select className={inputClass} value={form.documentType} onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}>
            <option value="">Selecione</option>
            <option value="BI">BI</option>
            <option value="Passaporte">Passaporte</option>
          </select>
        </FormField>
        <FormField label="N.º do Documento" error={errors.documentNumber}>
          <input className={inputClass} value={form.documentNumber} onChange={(e) => setForm((f) => ({ ...f, documentNumber: e.target.value }))} />
        </FormField>
      </div>

      <FormField label="Turma" error={errors.classId}>
        <select className={inputClass} value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}>
          <option value="">Sem turma atribuída</option>
          {classOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.grade}.ª classe)</option>
          ))}
        </select>
      </FormField>

      {mode === "create" && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Criar conta de acesso (palavra-passe temporária)</span>
        </label>
      )}

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

export default StudentForm
