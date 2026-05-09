"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2, MessageSquare } from "lucide-react"
import { useEntityList } from "@/hooks/useEntityList"
import Pagination from "@/components/ui/Pagination"
import FormModal from "@/components/ui/FormModal"
import SupportTicketForm from "@/components/forms/SupportTicketForm"
import StatusBadge from "@/components/ui/StatusBadge"

type Ticket = {
  id: string
  subject: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
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

export default function SupportPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const { data, totalPages, page, setPage, loading, refetch, filters, setFilters } = useEntityList<Ticket>({ endpoint: "/api/support", limit: 10 })

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Suporte</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Os seus tickets de suporte técnico</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.status || ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-2 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Todos os estados</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="resolvido">Resolvido</option>
            <option value="arquivado">Arquivado</option>
          </select>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo ticket</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-zinc-400 text-sm">Nenhum ticket de suporte encontrado</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Criar o primeiro ticket
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => router.push(`/support/${ticket.id}`)}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{ticket.subject}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
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

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Ticket de Suporte">
        <SupportTicketForm onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>
    </div>
  )
}
