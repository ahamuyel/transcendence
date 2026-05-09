"use client"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Table from "@/components/ui/Table"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"
import { Pencil, Trash2, Plus, Loader2, Star, Lock, CalendarClock } from "lucide-react"

type AcademicYear = {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  status: "aberto" | "em_encerramento" | "encerrado"
  _count?: { enrollments: number; classes: number }
}

const statusConfig: Record<AcademicYear["status"], { label: string; classes: string }> = {
  aberto: { label: "Aberto", classes: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
  em_encerramento: { label: "Em encerramento", classes: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
  encerrado: { label: "Encerrado", classes: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" },
}

const columns = [
  { header: "Nome", accessor: "name" },
  { header: "Periodo", accessor: "period", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
  { header: "Corrente", accessor: "isCurrent" },
  { header: "Matriculas", accessor: "enrollments", className: "hidden lg:table-cell" },
  { header: "Turmas", accessor: "classes", className: "hidden lg:table-cell" },
  { header: "Acoes", accessor: "actions" },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function toInputDate(dateStr: string) {
  return dateStr ? dateStr.slice(0, 10) : ""
}

const AcademicYearsPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  const [data, setData] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AcademicYear | null>(null)
  const [deleteItem, setDeleteItem] = useState<AcademicYear | null>(null)
  const [setCurrentItem, setSetCurrentItem] = useState<AcademicYear | null>(null)
  const [closeItem, setCloseItem] = useState<AcademicYear | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formStartDate, setFormStartDate] = useState("")
  const [formEndDate, setFormEndDate] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/academic-years")
      const json = await res.json()
      setData(json.data || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset form when opening create
  const openCreate = () => {
    setFormName("")
    setFormStartDate("")
    setFormEndDate("")
    setCreateOpen(true)
  }

  // Set form when opening edit
  const openEdit = (item: AcademicYear) => {
    setFormName(item.name)
    setFormStartDate(toInputDate(item.startDate))
    setFormEndDate(toInputDate(item.endDate))
    setEditItem(item)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const res = await fetch("/api/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, startDate: formStartDate, endDate: formEndDate }),
      })
      if (res.ok) {
        setCreateOpen(false)
        fetchData()
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setFormLoading(true)
    try {
      const res = await fetch(`/api/academic-years/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, startDate: formStartDate, endDate: formEndDate }),
      })
      if (res.ok) {
        setEditItem(null)
        fetchData()
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/academic-years/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      fetchData()
    }
  }

  const handleSetCurrent = async () => {
    if (!setCurrentItem) return
    const res = await fetch(`/api/academic-years/${setCurrentItem.id}/set-current`, { method: "POST" })
    if (res.ok) {
      setSetCurrentItem(null)
      fetchData()
    }
  }

  const handleClose = async () => {
    if (!closeItem) return
    const res = await fetch(`/api/academic-years/${closeItem.id}/close`, { method: "POST" })
    if (res.ok) {
      setCloseItem(null)
      fetchData()
    }
  }

  const formFields = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome</label>
        <input
          type="text"
          required
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Ex: 2025/2026"
          className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Data de Inicio</label>
        <input
          type="date"
          required
          value={formStartDate}
          onChange={(e) => setFormStartDate(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Data de Fim</label>
        <input
          type="date"
          required
          value={formEndDate}
          onChange={(e) => setFormEndDate(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
    </div>
  )

  const formButtons = (onCancel: () => void) => (
    <div className="flex items-center gap-3 justify-end mt-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={formLoading}
        className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={formLoading}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
      >
        {formLoading ? "Salvando..." : "Salvar"}
      </button>
    </div>
  )

  const renderRow = (item: AcademicYear) => {
    const st = statusConfig[item.status]
    return (
      <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
        <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">{item.name}</span>
        </td>
        <td className="hidden md:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </td>
        <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${st.classes}`}>
            {st.label}
          </span>
        </td>
        <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
          {item.isCurrent ? (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Star size={10} className="fill-current" />
              Corrente
            </span>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500 text-xs">&mdash;</span>
          )}
        </td>
        <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
          {item._count?.enrollments ?? 0}
        </td>
        <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
          {item._count?.classes ?? 0}
        </td>
        <td className="px-1.5 sm:px-2">
          <div className="flex items-center gap-1 justify-end">
            {isAdmin && !item.isCurrent && item.status === "aberto" && (
              <button
                onClick={() => setSetCurrentItem(item)}
                title="Definir como Corrente"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
              >
                <Star size={13} />
              </button>
            )}
            {isAdmin && item.status !== "encerrado" && (
              <button
                onClick={() => setCloseItem(item)}
                title="Encerrar"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-600 hover:text-white transition-all active:scale-90"
              >
                <Lock size={13} />
              </button>
            )}
            <button
              onClick={() => openEdit(item)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
            >
              <Pencil size={13} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setDeleteItem(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-600 hover:text-white transition-all active:scale-90"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Anos Letivos</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Gerencie os anos letivos da escola</p>
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          {isAdmin && (
            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhum ano letivo encontrado</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {/* Create Modal */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Ano Letivo">
        <form onSubmit={handleCreate}>
          {formFields}
          {formButtons(() => setCreateOpen(false))}
        </form>
      </FormModal>

      {/* Edit Modal */}
      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Ano Letivo">
        {editItem && (
          <form onSubmit={handleEdit}>
            {formFields}
            {formButtons(() => setEditItem(null))}
          </form>
        )}
      </FormModal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.name || ""}
      />

      {/* Set Current Modal */}
      <ConfirmActionModal
        open={!!setCurrentItem}
        onClose={() => setSetCurrentItem(null)}
        onConfirm={handleSetCurrent}
        title="Definir como Corrente"
        message={`Tem certeza que deseja definir "${setCurrentItem?.name || ""}" como o ano letivo corrente? O ano corrente anterior sera desmarcado.`}
        confirmLabel="Definir como Corrente"
        confirmColor="indigo"
      />

      {/* Close/Encerrar Modal */}
      <ConfirmActionModal
        open={!!closeItem}
        onClose={() => setCloseItem(null)}
        onConfirm={handleClose}
        title="Encerrar Ano Letivo"
        message={
          closeItem?.status === "aberto"
            ? `Tem certeza que deseja iniciar o encerramento de "${closeItem?.name || ""}"? O estado passara para "Em encerramento".`
            : `Tem certeza que deseja encerrar definitivamente "${closeItem?.name || ""}"? Esta acao nao pode ser revertida.`
        }
        confirmLabel={closeItem?.status === "aberto" ? "Iniciar Encerramento" : "Encerrar Definitivamente"}
        confirmColor={closeItem?.status === "aberto" ? "amber" : "red"}
      />
    </div>
  )
}

export default AcademicYearsPage
