"use client"
import { useState } from "react"
import FormField from "@/components/ui/FormField"

type SubmissionData = {
  id: string
  assignmentId: string
  content?: string | null
  attachmentUrl?: string | null
  student?: { id: string; name: string }
}

type Props = {
  submission: SubmissionData
  maxScore: number
  onSuccess: () => void
  onCancel: () => void
}

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const EvaluateSubmissionForm = ({ submission, maxScore, onSuccess, onCancel }: Props) => {
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    const scoreNum = parseFloat(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
      setApiError(`Nota deve ser entre 0 e ${maxScore}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/assignments/${submission.assignmentId}/submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreNum, feedback }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || "Erro ao avaliar")
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

      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{submission.student?.name}</p>
        {submission.content && <p className="text-xs text-zinc-500 mt-1">{submission.content}</p>}
        {submission.attachmentUrl && (
          <a href={submission.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
            Ver anexo
          </a>
        )}
      </div>

      <FormField label={`Nota (0-${maxScore})`}>
        <input
          className={inputClass}
          type="number"
          step="0.1"
          min="0"
          max={maxScore}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0"
        />
      </FormField>

      <FormField label="Feedback (opcional)">
        <textarea
          className={inputClass}
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Comentários sobre o trabalho..."
        />
      </FormField>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
          {loading ? "Avaliando..." : "Avaliar"}
        </button>
      </div>
    </form>
  )
}

export default EvaluateSubmissionForm
