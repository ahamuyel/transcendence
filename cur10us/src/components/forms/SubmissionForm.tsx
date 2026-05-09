"use client"
import { useState } from "react"
import FormField from "@/components/ui/FormField"
import { AlertTriangle } from "lucide-react"

type Props = {
  assignmentId: string
  isPastDue: boolean
  onSuccess: () => void
  onCancel: () => void
}

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const SubmissionForm = ({ assignmentId, isPastDue, onSuccess, onCancel }: Props) => {
  const [content, setContent] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, attachmentUrl: attachmentUrl || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || "Erro ao submeter")
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
      {isPastDue && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 text-sm">
          <AlertTriangle size={16} /> O prazo de entrega já passou. A submissão será marcada como atrasada.
        </div>
      )}

      {apiError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm">{apiError}</div>
      )}

      <FormField label="Conteúdo (opcional)">
        <textarea
          className={inputClass}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva a sua resposta ou comentários..."
        />
      </FormField>

      <FormField label="Link do anexo (opcional)">
        <input
          className={inputClass}
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          placeholder="https://..."
        />
      </FormField>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
          {loading ? "Submetendo..." : "Submeter"}
        </button>
      </div>
    </form>
  )
}

export default SubmissionForm
