"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import LessonForm from "@/components/forms/LessonForm"
import LessonAttendanceForm from "@/components/forms/LessonAttendanceForm"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, ClipboardCheck, Paperclip, ExternalLink } from "lucide-react"

type Material = { title: string; url: string; type?: string }

type Lesson = {
  id: string
  day: string
  startTime: string
  endTime: string
  room?: string
  materials?: Material[] | null
  subjectId: string
  classId: string
  teacherId: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  teacher?: { id: string; name: string }
}

const columns = [
  { header: "Dia", accessor: "day" },
  { header: "Horário", accessor: "time" },
  { header: "Disciplina", accessor: "subject" },
  { header: "Turma", accessor: "class", className: "hidden md:table-cell" },
  { header: "Professor", accessor: "teacher", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const LessonListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"
  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Lesson>({ endpoint: "/api/lessons", limit: 5 })

  const filterConfig = [
    { key: "day", label: "Dia", type: "select" as const, options: [{ value: "Segunda", label: "Segunda" }, { value: "Terça", label: "Terça" }, { value: "Quarta", label: "Quarta" }, { value: "Quinta", label: "Quinta" }, { value: "Sexta", label: "Sexta" }] },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "subjectId", label: "Disciplina", type: "select" as const, optionsEndpoint: "/api/subjects?limit=100" },
  ]
  const sortOptions = [
    { field: "day", label: "Dia" },
    { field: "startTime", label: "Hora de início" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Lesson | null>(null)
  const [deleteItem, setDeleteItem] = useState<Lesson | null>(null)
  const [attendanceLesson, setAttendanceLesson] = useState<Lesson | null>(null)
  const [materialsLesson, setMaterialsLesson] = useState<Lesson | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/lessons/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Lesson) => (
    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">{item.day}</span>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.startTime} - {item.endTime}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] sm:text-[10px] font-bold">
          {item.subject?.name}
        </span>
      </td>
      <td className="hidden md:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.class?.name}
      </td>
      <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.teacher?.name}
      </td>
      <td className="px-1.5 sm:px-2">
        <div className="flex items-center gap-1 justify-end">
          {item.materials && (item.materials as Material[]).length > 0 && (
            <button
              onClick={() => setMaterialsLesson(item)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-all active:scale-90"
              title="Materiais"
            >
              <Paperclip size={13} />
            </button>
          )}
          {canManage && (
            <>
              <button
                onClick={() => setAttendanceLesson(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all active:scale-90"
                title="Registar Presença"
              >
                <ClipboardCheck size={13} />
              </button>
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
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Aulas</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Gerencie o horário das aulas</p>
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
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhuma aula encontrada</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Aula">
        <LessonForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Aula">
        {editItem && (
          <LessonForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      {/* Attendance Modal */}
      <FormModal open={!!attendanceLesson} onClose={() => setAttendanceLesson(null)} title={`Presença — ${attendanceLesson?.subject?.name || ""} (${attendanceLesson?.class?.name || ""})`}>
        {attendanceLesson && (
          <LessonAttendanceForm
            lessonId={attendanceLesson.id}
            classId={attendanceLesson.classId}
            onSuccess={() => { setAttendanceLesson(null); refetch() }}
            onCancel={() => setAttendanceLesson(null)}
          />
        )}
      </FormModal>

      {/* Materials Modal */}
      <FormModal open={!!materialsLesson} onClose={() => setMaterialsLesson(null)} title={`Materiais — ${materialsLesson?.subject?.name || ""}`}>
        {materialsLesson?.materials && (
          <div className="flex flex-col gap-2">
            {(materialsLesson.materials as Material[]).map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                <Paperclip size={16} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{m.title}</p>
                  {m.type && <span className="text-[10px] text-zinc-400 uppercase">{m.type}</span>}
                </div>
                <ExternalLink size={14} className="text-zinc-400 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.subject?.name || deleteItem?.day || ""} />
    </div>
  )
}

export default LessonListPage
