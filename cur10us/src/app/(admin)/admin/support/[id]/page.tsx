"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Send, CheckCircle2, Archive } from "lucide-react"
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

const priorityLabels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" }
const roleLabels: Record<string, string> = { super_admin: "Super Admin", school_admin: "Admin Escola", teacher: "Professor", student: "Aluno", parent: "Encarregado" }

export default function AdminTicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState("")

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/support/${id}`)
      if (!res.ok) { router.replace("/admin/support"); return }
      setTicket(await res.json())
    } catch {
      router.replace("/admin/support")
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
      if (res.ok) { setReply(""); fetchTicket() }
    } catch {
      // silently fail
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(status: string) {
    setUpdating(status)
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchTicket()
    } catch {
      // silently fail
    } finally {
      setUpdating("")
    }
  }

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-3xl">
      <button
        onClick={() => router.push("/admin/support")}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 flex-wrap">
              <span>{ticket.user.name} ({roleLabels[ticket.user.role]})</span>
              <span>&middot;</span>
              <span>{ticket.user.email}</span>
              {ticket.school && <><span>&middot;</span><span>{ticket.school.name}</span></>}
              <span>&middot;</span>
              <span>Prioridade: {priorityLabels[ticket.priority]}</span>
              <span>&middot;</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString("pt")}</span>
            </div>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Description */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-700 dark:text-zinc-300 mb-4 whitespace-pre-wrap">
          {ticket.description}
        </div>

        {/* Admin actions */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {ticket.status !== "em_andamento" && ticket.status !== "resolvido" && ticket.status !== "arquivado" && (
            <button
              onClick={() => handleStatusChange("em_andamento")}
              disabled={!!updating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-50"
            >
              {updating === "em_andamento" ? <Loader2 size={12} className="animate-spin" /> : null}
              Em andamento
            </button>
          )}
          {ticket.status !== "resolvido" && (
            <button
              onClick={() => handleStatusChange("resolvido")}
              disabled={!!updating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {updating === "resolvido" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Resolver
            </button>
          )}
          {ticket.status !== "arquivado" && (
            <button
              onClick={() => handleStatusChange("arquivado")}
              disabled={!!updating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {updating === "arquivado" ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}
              Arquivar
            </button>
          )}
          {(ticket.status === "resolvido" || ticket.status === "arquivado") && (
            <button
              onClick={() => handleStatusChange("aberto")}
              disabled={!!updating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Reabrir
            </button>
          )}
        </div>

        {/* Messages */}
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

        {/* Reply */}
        <form onSubmit={handleReply} className="flex items-end gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Responder ao ticket..."
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
      </div>
    </div>
  )
}
