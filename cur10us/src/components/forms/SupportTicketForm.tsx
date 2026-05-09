"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createTicketSchema } from "@/lib/validations/support"

type Props = {
  onSuccess: () => void
  onCancel: () => void
}

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

export default function SupportTicketForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({ subject: "", description: "", priority: "media" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const parsed = createTicketSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao criar ticket")
        return
      }
      onSuccess()
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Assunto</label>
        <input
          className={inputClass}
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="Descreva brevemente o problema"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Descrição</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={5}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descreva detalhadamente o que está a acontecer..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Prioridade</label>
        <select
          className={inputClass}
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Enviando..." : "Criar ticket"}
        </button>
      </div>
    </form>
  )
}
