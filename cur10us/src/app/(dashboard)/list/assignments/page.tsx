"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import AssignmentForm from "@/components/forms/AssignmentForm"
import SubmissionForm from "@/components/forms/SubmissionForm"
import EvaluateSubmissionForm from "@/components/forms/EvaluateSubmissionForm"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, Send, CheckCircle, Clock, AlertTriangle, Eye } from "lucide-react"

type MySubmission = { id: string; status: string; score?: number | null; submittedAt?: string | null }
type Submission = { id: string; assignmentId: string; status: string; score?: number | null; content?: string | null; attachmentUrl?: string | null; feedback?: string | null; student?: { id: string; name: string }; submittedAt?: string | null }

type Assignment = {
  id: string
  title: string
  description?: string | null
  dueDate: string
  maxScore: number
  subjectId: string
  classId: string
  teacherId: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  teacher?: { id: string; name: string }
  submissionCount: number
  mySubmission?: MySubmission | null
  isPastDue: boolean
}

const statusBadge: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  pendente: { label: "Pendente", class: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600", icon: Clock },
  entregue: { label: "Entregue", class: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600", icon: Send },
  avaliada: { label: "Avaliada", class: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600", icon: CheckCircle },
  atrasada: { label: "Atrasada", class: "bg-rose-100 dark:bg-rose-950/40 text-rose-600", icon: AlertTriangle },
}

const AssignmentListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isStudent = role === "student"
  const canManage = role === "school_admin" || role === "teacher"
  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Assignment>({ endpoint: "/api/assignments", limit: 5 })

  const filterConfig = [
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "subjectId", label: "Disciplina", type: "select" as const, optionsEndpoint: "/api/subjects?limit=100" },
  ]
  const sortOptions = [
    { field: "dueDate", label: "Prazo de entrega" },
    { field: "title", label: "Título" },
    { field: "createdAt", label: "Data de criação" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Assignment | null>(null)
  const [deleteItem, setDeleteItem] = useState<Assignment | null>(null)
  const [submitItem, setSubmitItem] = useState<Assignment | null>(null)
  const [detailItem, setDetailItem] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [evalSub, setEvalSub] = useState<{ sub: Submission; maxScore: number } | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/assignments/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) { setDeleteItem(null); refetch() }
  }

  const openDetail = async (item: Assignment) => {
    setDetailItem(item)
    if (canManage) {
      const res = await fetch(`/api/assignments/${item.id}/submissions`)
      const d = await res.json()
      setSubmissions(d.data || [])
    }
  }

  const columns = isStudent
    ? [
        { header: "Título", accessor: "title" },
        { header: "Disciplina", accessor: "subject" },
        { header: "Entrega", accessor: "dueDate" },
        { header: "Estado", accessor: "status" },
        { header: "Ações", accessor: "actions" },
      ]
    : [
        { header: "Título", accessor: "title" },
        { header: "Disciplina", accessor: "subject" },
        { header: "Turma", accessor: "class", className: "hidden md:table-cell" },
        { header: "Entrega", accessor: "dueDate" },
        { header: "Submissões", accessor: "submissions", className: "hidden lg:table-cell" },
        { header: "Ações", accessor: "actions" },
      ]

  const renderRow = (item: Assignment) => {
    const mySub = item.mySubmission
    const subStatus = mySub?.status || (item.isPastDue ? "atrasada" : "pendente")
    const badge = statusBadge[subStatus] || statusBadge.pendente
    const BadgeIcon = badge.icon

    return (
      <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
        <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
          <button onClick={() => openDetail(item)} className="text-left">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm hover:text-indigo-600 transition">{item.title || "—"}</span>
            {item.description && <p className="text-[11px] text-zinc-400 truncate max-w-xs">{item.description.slice(0, 50)}</p>}
          </button>
        </td>
        <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
          <span className="px-1.5 sm:px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded text-[9px] sm:text-[10px] font-bold">
            {item.subject?.name}
          </span>
        </td>
        {!isStudent && (
          <td className="hidden md:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
            {item.class?.name}
          </td>
        )}
        <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
          <span className={item.isPastDue ? "text-rose-500" : ""}>
            {new Date(item.dueDate).toLocaleDateString("pt")}
          </span>
        </td>
        {isStudent ? (
          <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${badge.class}`}>
              <BadgeIcon size={10} /> {badge.label}
              {mySub?.score != null && <span className="ml-1">({mySub.score})</span>}
            </span>
          </td>
        ) : (
          <td className="hidden lg:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs">
            {item.submissionCount} entregue(s)
          </td>
        )}
        <td className="px-1.5 sm:px-2">
          <div className="flex items-center gap-1 justify-end">
            {isStudent && !mySub && (
              <button
                onClick={() => setSubmitItem(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all active:scale-90"
                title="Submeter"
              >
                <Send size={13} />
              </button>
            )}
            {canManage && (
              <>
                <button
                  onClick={() => openDetail(item)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-cyan-600 hover:text-white transition-all active:scale-90"
                  title="Ver submissões"
                >
                  <Eye size={13} />
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
  }

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tarefas</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            {isStudent ? "As suas tarefas e trabalhos" : "Gerencie as tarefas e trabalhos"}
          </p>
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
          <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhuma tarefa encontrada</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Tarefa">
        <AssignmentForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Tarefa">
        {editItem && <AssignmentForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />}
      </FormModal>

      {/* Submit Modal (Student) */}
      <FormModal open={!!submitItem} onClose={() => setSubmitItem(null)} title={`Submeter — ${submitItem?.title || ""}`}>
        {submitItem && <SubmissionForm assignmentId={submitItem.id} isPastDue={submitItem.isPastDue} onSuccess={() => { setSubmitItem(null); refetch() }} onCancel={() => setSubmitItem(null)} />}
      </FormModal>

      {/* Detail Modal (Teacher/Admin - submissions list) */}
      <FormModal open={!!detailItem && !evalSub} onClose={() => { setDetailItem(null); setSubmissions([]) }} title={`Submissões — ${detailItem?.title || ""}`}>
        {detailItem && (
          <div className="flex flex-col gap-2">
            {detailItem.description && <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{detailItem.description}</p>}
            <div className="text-xs text-zinc-500 mb-3">Nota máxima: {detailItem.maxScore} | Entrega: {new Date(detailItem.dueDate).toLocaleDateString("pt")}</div>
            {submissions.length === 0 ? (
              <div className="text-sm text-zinc-400 text-center py-4">Nenhuma submissão ainda</div>
            ) : (
              submissions.map((sub) => {
                const badge = statusBadge[sub.status] || statusBadge.pendente
                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{sub.student?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badge.class}`}>{badge.label}</span>
                        {sub.score != null && <span className="text-xs font-bold text-emerald-600">{sub.score}/{detailItem.maxScore}</span>}
                        {sub.submittedAt && <span className="text-[10px] text-zinc-400">{new Date(sub.submittedAt).toLocaleDateString("pt")}</span>}
                      </div>
                    </div>
                    {sub.status !== "avaliada" && canManage && (
                      <button
                        onClick={() => setEvalSub({ sub: { ...sub, assignmentId: detailItem.id }, maxScore: detailItem.maxScore })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition"
                      >
                        Avaliar
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </FormModal>

      {/* Evaluate Modal */}
      <FormModal open={!!evalSub} onClose={() => setEvalSub(null)} title="Avaliar Submissão">
        {evalSub && (
          <EvaluateSubmissionForm
            submission={evalSub.sub}
            maxScore={evalSub.maxScore}
            onSuccess={() => {
              setEvalSub(null)
              if (detailItem) openDetail(detailItem)
              refetch()
            }}
            onCancel={() => setEvalSub(null)}
          />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.title || ""} />
    </div>
  )
}

export default AssignmentListPage
