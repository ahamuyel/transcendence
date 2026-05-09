"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import AnnouncementForm from "@/components/forms/AnnouncementForm"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, Eye, EyeOff } from "lucide-react"

type Announcement = {
  id: string
  title: string
  description: string
  priority: string
  classId?: string | null
  courseId?: string | null
  targetUserId?: string | null
  scheduledAt?: string | null
  class?: { id: string; name: string } | null
  course?: { id: string; name: string } | null
  author?: { id: string; name: string } | null
  readCount: number
  isRead: boolean
  createdAt: string
}

const priorityBadge: Record<string, string> = {
  informativo: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  importante: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  urgente: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
}

const columns = [
  { header: "Título", accessor: "title" },
  { header: "Prioridade", accessor: "priority" },
  { header: "Destino", accessor: "target" },
  { header: "Data", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const AnnouncementListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"
  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Announcement>({ endpoint: "/api/announcements", limit: 5 })

  const filterConfig = [
    { key: "priority", label: "Prioridade", type: "select" as const, options: [{ value: "informativo", label: "Informativo" }, { value: "importante", label: "Importante" }, { value: "urgente", label: "Urgente" }] },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
  ]
  const sortOptions = [
    { field: "createdAt", label: "Data" },
    { field: "priority", label: "Prioridade" },
    { field: "title", label: "Título" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Announcement | null>(null)
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null)
  const [detailItem, setDetailItem] = useState<Announcement | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/announcements/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const handleRead = async (item: Announcement) => {
    setDetailItem(item)
    if (!item.isRead) {
      await fetch(`/api/announcements/${item.id}/read`, { method: "POST" })
      refetch()
    }
  }

  const renderRow = (item: Announcement) => (
    <tr key={item.id} className={`border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${!item.isRead ? "bg-indigo-50/30 dark:bg-indigo-950/10" : ""}`}>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <button onClick={() => handleRead(item)} className="text-left">
          <div className="flex items-center gap-2">
            {!item.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">{item.title}</span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate max-w-xs mt-0.5">
            {item.description.length > 60 ? item.description.slice(0, 60) + "..." : item.description}
          </p>
        </button>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${priorityBadge[item.priority] || priorityBadge.informativo}`}>
          {item.priority}
        </span>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className="px-1.5 sm:px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
          {item.class?.name || item.course?.name || "Escola"}
        </span>
      </td>
      <td className="hidden lg:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {new Date(item.createdAt).toLocaleDateString("pt")}
      </td>
      <td className="px-1.5 sm:px-2">
        <div className="flex items-center gap-1 justify-end">
          {canManage && (
            <>
              <button
                onClick={() => setEditItem(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setDeleteItem(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-600 hover:text-white transition-all active:scale-90"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Avisos</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Comunicações e avisos escolares</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhum aviso encontrado</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Aviso">
        <AnnouncementForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Aviso">
        {editItem && (
          <AnnouncementForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem?.title || "Aviso"}>
        {detailItem && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge[detailItem.priority] || priorityBadge.informativo}`}>
                {detailItem.priority}
              </span>
              <span className="text-xs text-zinc-500">{new Date(detailItem.createdAt).toLocaleDateString("pt")}</span>
              {detailItem.author && <span className="text-xs text-zinc-400">por {detailItem.author.name}</span>}
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{detailItem.description}</div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center gap-1"><Eye size={12} /> {detailItem.readCount} leitura(s)</span>
              <span className="flex items-center gap-1">
                {detailItem.isRead ? <Eye size={12} /> : <EyeOff size={12} />}
                {detailItem.isRead ? "Lido" : "Não lido"}
              </span>
            </div>
          </div>
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.title || ""} />
    </div>
  )
}

export default AnnouncementListPage
