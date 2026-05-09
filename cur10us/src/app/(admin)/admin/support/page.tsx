"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MessageSquare } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"

type Ticket = {
  id: string
  subject: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string; role: string }
  school: { id: string; name: string } | null
  _count: { messages: number }
}

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}

const priorityColors: Record<string, string> = {
  baixa: "text-zinc-500",
  media: "text-amber-600 dark:text-amber-400",
  alta: "text-orange-600 dark:text-orange-400",
  urgente: "text-red-600 dark:text-red-400",
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "Admin Escola",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

export default function AdminSupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (statusFilter) params.set("status", statusFilter)
      if (priorityFilter) params.set("priority", priorityFilter)
      const res = await fetch(`/api/support?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.data)
        setTotalPages(data.totalPages)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, priorityFilter])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Suporte Técnico</h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Todos os tickets de suporte da plataforma</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-2 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Todos os estados</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="resolvido">Resolvido</option>
            <option value="arquivado">Arquivado</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
            className="px-2 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Todas as prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-zinc-400 text-sm">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => router.push(`/admin/support/${ticket.id}`)}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{ticket.subject}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                  <span>{ticket.user.name} ({roleLabels[ticket.user.role] || ticket.user.role})</span>
                  {ticket.school && <span>{ticket.school.name}</span>}
                  <span className={priorityColors[ticket.priority]}>{priorityLabels[ticket.priority]}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString("pt")}</span>
                  {ticket._count.messages > 0 && (
                    <span className="flex items-center gap-0.5">
                      <MessageSquare size={10} /> {ticket._count.messages}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 disabled:opacity-50 transition"
          >
            Anterior
          </button>
          <span className="text-sm text-zinc-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 disabled:opacity-50 transition"
          >
            Seguinte
          </button>
        </div>
      )}
    </div>
  )
}
