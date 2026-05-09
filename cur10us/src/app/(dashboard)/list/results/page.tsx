"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ResultForm from "@/components/forms/ResultForm"
import StudentGradeSummary from "@/components/ui/StudentGradeSummary"
import ClassGradeSummary from "@/components/ui/ClassGradeSummary"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, BarChart3 } from "lucide-react"

type Result = {
  id: string
  score: number
  type: string
  date: string
  trimester?: string | null
  academicYear?: string | null
  studentId: string
  subjectId: string
  examId?: string | null
  assignmentId?: string | null
  student?: { id: string; name: string }
  subject?: { id: string; name: string }
  exam?: { id: string; title?: string | null }
  assignment?: { id: string; title?: string | null }
}

const getScoreColor = (score: number) => {
  if (score >= 14) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "Prova": return "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
    case "Tarefa": return "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"
    case "Trabalho": return "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
    case "Participação": return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
    default: return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
  }
}

const trimesterLabels: Record<string, string> = { primeiro: "1.º Trim.", segundo: "2.º Trim.", terceiro: "3.º Trim." }

const columns = [
  { header: "Aluno", accessor: "student" },
  { header: "Disciplina", accessor: "subject" },
  { header: "Nota", accessor: "score" },
  { header: "Tipo", accessor: "type" },
  { header: "Trim.", accessor: "trimester", className: "hidden md:table-cell" },
  { header: "Data", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const ResultListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isStudent = role === "student"
  const canManage = role === "school_admin" || role === "teacher"

  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Result>({
    endpoint: "/api/results",
    limit: 5,
  })

  const filterConfig = [
    { key: "trimester", label: "Trimestre", type: "select" as const, options: [{ value: "primeiro", label: "1.º Trimestre" }, { value: "segundo", label: "2.º Trimestre" }, { value: "terceiro", label: "3.º Trimestre" }] },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "type", label: "Tipo", type: "select" as const, options: [{ value: "Prova", label: "Prova" }, { value: "Tarefa", label: "Tarefa" }, { value: "Trabalho", label: "Trabalho" }, { value: "Participação", label: "Participação" }] },
  ]
  const sortOptions = [
    { field: "date", label: "Data" },
    { field: "score", label: "Nota" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Result | null>(null)
  const [deleteItem, setDeleteItem] = useState<Result | null>(null)
  const [summaryStudent, setSummaryStudent] = useState<string | null>(null)
  const [classSummary, setClassSummary] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/results/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) { setDeleteItem(null); refetch() }
  }

  const renderRow = (item: Result) => (
    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <button onClick={() => setSummaryStudent(item.studentId)} className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm hover:text-indigo-600 transition">
          {item.student?.name}
        </button>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">{item.subject?.name}</td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`font-bold text-sm ${getScoreColor(item.score)}`}>{item.score}</span>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${getTypeBadge(item.type)}`}>{item.type}</span>
      </td>
      <td className="hidden md:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-500 text-xs">
        {item.trimester ? trimesterLabels[item.trimester] || item.trimester : "—"}
      </td>
      <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {new Date(item.date).toLocaleDateString("pt")}
      </td>
      <td className="px-1.5 sm:px-2">
        <div className="flex items-center gap-1 justify-end">
          {canManage && (
            <>
              <button onClick={() => setEditItem(item)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
                <Pencil size={13} />
              </button>
              <button onClick={() => setDeleteItem(item)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-600 hover:text-white transition-all active:scale-90">
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
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Resultados</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Notas e avaliações dos alunos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            {canManage && (
              <>
                <button
                  onClick={() => setClassSummary(filters.classId || "")}
                  className="p-2 sm:p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition active:scale-95"
                  title="Resumo da Turma"
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhum resultado encontrado</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Resultado">
        <ResultForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Resultado">
        {editItem && <ResultForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />}
      </FormModal>

      {/* Student Grade Summary Modal */}
      <FormModal open={!!summaryStudent} onClose={() => setSummaryStudent(null)} title="Médias do Aluno">
        {summaryStudent && <StudentGradeSummary studentId={summaryStudent} trimester={filters.trimester || ""} academicYear={filters.academicYear || ""} />}
      </FormModal>

      {/* Class Grade Summary Modal */}
      <FormModal open={!!classSummary} onClose={() => setClassSummary(null)} title="Resumo da Turma">
        {classSummary && <ClassGradeSummary classId={classSummary} trimester={filters.trimester || ""} academicYear={filters.academicYear || ""} />}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.student?.name || ""} />
    </div>
  )
}

export default ResultListPage
