"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"

type Message = {
  id: string
  content: string
  isStaff: boolean
  createdAt: string
  user: { id: string; name: string; role: string }
}

type TicketDetail = {
  id: string
  subject: string
  description: string
  priority: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  school: { id: string; name: string } | null
  messages: Message[]
}

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/support/${id}`)
      if (!res.ok) { router.replace("/support"); return }
      setTicket(await res.json())
    } catch {
      router.replace("/support")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTicket() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/support/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      })
      if (res.ok) {
        setReply("")
        fetchTicket()
      }
    } catch {
      // silently fail
    } finally {
      setSending(false)
    }
  }

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const isClosed = ticket.status === "resolvido" || ticket.status === "arquivado"

  return (
    <div className="m-2 sm:m-3 max-w-3xl">
      <button
        onClick={() => router.push("/support")}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
              <span>Prioridade: {priorityLabels[ticket.priority]}</span>
              <span>&middot;</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString("pt")}</span>
            </div>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-700 dark:text-zinc-300 mb-6 whitespace-pre-wrap">
          {ticket.description}
        </div>

        {/* Messages thread */}
        {ticket.messages.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Mensagens</h3>
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl text-sm ${
                  msg.isStaff
                    ? "bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{msg.user.name}</span>
                  {msg.isStaff && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium">
                      Equipa
                    </span>
                  )}
                  <span className="text-zinc-400">{new Date(msg.createdAt).toLocaleString("pt")}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {!isClosed ? (
          <form onSubmit={handleReply} className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreva uma mensagem..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-zinc-400 py-3">
            Este ticket foi {ticket.status === "resolvido" ? "resolvido" : "arquivado"}.
          </p>
        )}
      </div>
    </div>
  )
}
