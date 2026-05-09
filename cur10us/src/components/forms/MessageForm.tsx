"use client"
import { useState, useEffect } from "react"
import FormField from "@/components/ui/FormField"
import { createMessageSchema } from "@/lib/validations/academic"

type MessageData = {
  id?: string
  subject: string
  body: string
  toId?: string | null
  toAll?: boolean
}

type Props = {
  mode: "create" | "edit"
  initialData?: MessageData
  onSuccess: () => void
  onCancel: () => void
}

type Recipient = { id: string; name: string; role: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const MessageForm = ({ onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    subject: "",
    body: "",
    toId: "",
    toAll: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [recipients, setRecipients] = useState<Recipient[]>([])

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const [teachersRes, studentsRes, parentsRes] = await Promise.all([
          fetch("/api/teachers?limit=100").then((r) => r.json()),
          fetch("/api/students?limit=100").then((r) => r.json()),
          fetch("/api/parents?limit=100").then((r) => r.json()),
        ])

        const list: Recipient[] = []

        for (const t of teachersRes.data || []) {
          if (t.userId) list.push({ id: t.userId, name: t.name, role: "Professor" })
        }
        for (const s of studentsRes.data || []) {
          if (s.userId) list.push({ id: s.userId, name: s.name, role: "Aluno" })
        }
        for (const p of parentsRes.data || []) {
          if (p.userId) list.push({ id: p.userId, name: p.name, role: "Encarregado" })
        }

        list.sort((a, b) => a.name.localeCompare(b.name))
        setRecipients(list)
      } catch {
        // silently fail — recipients list will be empty
      }
    }

    fetchRecipients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      subject: form.subject,
      body: form.body,
      toId: form.toAll ? null : form.toId || null,
      toAll: form.toAll,
    }

    const parsed = createMessageSchema.safeParse(payload)
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
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || "Erro ao enviar mensagem")
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

      <FormField label="Enviar para todos" error={errors.toAll}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.toAll}
            onChange={(e) => setForm((f) => ({ ...f, toAll: e.target.checked }))}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Enviar para todos os utilizadores da escola</span>
        </label>
      </FormField>

      {!form.toAll && (
        <FormField label="Destinatário" error={errors.toId}>
          <select
            className={inputClass}
            value={form.toId}
            onChange={(e) => setForm((f) => ({ ...f, toId: e.target.value }))}
          >
            <option value="">Selecionar destinatário...</option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.role})
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Assunto" error={errors.subject}>
        <input
          className={inputClass}
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="Assunto da mensagem"
        />
      </FormField>

      <FormField label="Mensagem" error={errors.body}>
        <textarea
          className={inputClass}
          rows={4}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder="Escreva a sua mensagem..."
        />
      </FormField>

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
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  )
}

export default MessageForm
