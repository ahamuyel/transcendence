"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import MessageForm from "@/components/forms/MessageForm"
import { useEntityList } from "@/hooks/useEntityList"
import { SlidersHorizontal, ArrowUpDown, Send, Loader2 } from "lucide-react"

type Message = {
  id: string
  subject: string
  body: string
  fromId: string
  toId?: string | null
  toAll: boolean
  read: boolean
  createdAt: string
  from?: { id: string; name: string }
  to?: { id: string; name: string } | null
}

const columns = [
  { header: "De", accessor: "from" },
  { header: "Para", accessor: "to", className: "hidden md:table-cell" },
  { header: "Assunto", accessor: "subject" },
  { header: "Data", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Estado", accessor: "status" },
]

const MessageListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Message>({ endpoint: "/api/messages", limit: 5 })

  const [createOpen, setCreateOpen] = useState(false)

  const renderRow = (item: Message) => (
    <tr
      key={item.id}
      className={`border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${
        !item.read ? "border-l-2 border-l-indigo-500" : ""
      }`}
    >
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`text-xs sm:text-sm ${!item.read ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>
          {item.from?.name || "\u2014"}
        </span>
      </td>
      <td className="hidden md:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.toAll ? "Todos" : item.to?.name || "\u2014"}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 max-w-[120px] sm:max-w-[200px]">
        <span className={`text-xs sm:text-sm truncate block ${!item.read ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>
          {item.subject}
        </span>
      </td>
      <td className="hidden lg:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-500 dark:text-zinc-500 text-xs">
        {new Date(item.createdAt).toLocaleDateString("pt")}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
          item.read
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            : "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600"
        }`}>
          {item.read ? "Lida" : "N\u00e3o lida"}
        </span>
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Mensagens</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Comunica\u00e7\u00e3o interna</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <button className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95">
              <SlidersHorizontal size={16} />
            </button>
            <button className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95">
              <ArrowUpDown size={16} />
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Nova</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhuma mensagem encontrada</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Mensagem">
        <MessageForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>
    </div>
  )
}

export default MessageListPage
