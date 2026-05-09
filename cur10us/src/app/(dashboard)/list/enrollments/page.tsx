"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import { useEntityList } from "@/hooks/useEntityList"
import { Eye, Plus, Loader2, SlidersHorizontal, ArrowUpDown } from "lucide-react"

type Enrollment = {
  id: string
  status: "ativa" | "transferida" | "cancelada" | "concluida" | "aprovada" | "reprovada" | "em_recurso"
  finalAverage: number | null
  failedSubjects: number | null
  observation: string | null
  enrolledAt: string
  decidedAt: string | null
  student: { id: string; name: string; email: string }
  class: { id: string; name: string; grade: number }
  academicYear: { id: string; name: string }
}

type SelectOption = { id: string; name: string }

const statusLabels: Record<string, string> = {
  ativa: "Ativa",
  transferida: "Transferida",
  cancelada: "Cancelada",
  concluida: "Concluida",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  em_recurso: "Em Recurso",
}

const statusColors: Record<string, string> = {
  ativa: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  aprovada: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
  reprovada: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
  em_recurso: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  transferida: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
  cancelada: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  concluida: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400",
}

const allStatuses = ["ativa", "transferida", "cancelada", "concluida", "aprovada", "reprovada", "em_recurso"]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014"
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const columns = [
  { header: "Aluno", accessor: "student" },
  { header: "Turma", accessor: "class" },
  { header: "Ano Letivo", accessor: "academicYear", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
  { header: "Media Final", accessor: "finalAverage", className: "hidden lg:table-cell" },
  { header: "Data Matricula", accessor: "enrolledAt", className: "hidden lg:table-cell" },
  { header: "Acoes", accessor: "actions" },
]

const EnrollmentListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  const { data, totalPages, page, search, setSearch, setPage, loading, refetch, filters, setFilters } =
    useEntityList<Enrollment>({ endpoint: "/api/enrollments", limit: 10 })

  const [createOpen, setCreateOpen] = useState(false)
  const [viewItem, setViewItem] = useState<Enrollment | null>(null)

  // Options for filters and create form
  const [academicYears, setAcademicYears] = useState<SelectOption[]>([])
  const [students, setStudents] = useState<(SelectOption & { email: string })[]>([])
  const [classes, setClasses] = useState<(SelectOption & { grade: number })[]>([])

  // Create form state
  const [createForm, setCreateForm] = useState({ studentId: "", classId: "", academicYearId: "", status: "ativa", observation: "" })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    fetch("/api/academic-years?limit=100")
      .then((r) => r.json())
      .then((j) => setAcademicYears(j.data || []))
      .catch(() => {})
  }, [])

  const loadCreateOptions = () => {
    if (students.length === 0) {
      fetch("/api/students?limit=500")
        .then((r) => r.json())
        .then((j) => setStudents(j.data || []))
        .catch(() => {})
    }
    if (classes.length === 0) {
      fetch("/api/classes?limit=500")
        .then((r) => r.json())
        .then((j) => setClasses(j.data || []))
        .catch(() => {})
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.studentId || !createForm.classId || !createForm.academicYearId) {
      setCreateError("Preencha todos os campos obrigatorios.")
      return
    }
    setCreateLoading(true)
    setCreateError("")
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Erro ao criar matricula")
      }
      setCreateOpen(false)
      setCreateForm({ studentId: "", classId: "", academicYearId: "", status: "ativa", observation: "" })
      refetch()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar matricula")
    } finally {
      setCreateLoading(false)
    }
  }

  const renderRow = (item: Enrollment) => (
    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">{item.student.name}</span>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[140px] sm:max-w-none">{item.student.email}</p>
        </div>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] sm:text-[10px] font-bold">
          {item.class.name}
        </span>
      </td>
      <td className="hidden md:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm px-1.5 sm:px-2">
        {item.academicYear.name}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${statusColors[item.status] || ""}`}>
          {statusLabels[item.status] || item.status}
        </span>
      </td>
      <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm px-1.5 sm:px-2">
        {item.finalAverage !== null ? item.finalAverage.toFixed(1) : "\u2014"}
      </td>
      <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm px-1.5 sm:px-2">
        {formatDate(item.enrolledAt)}
      </td>
      <td className="px-1.5 sm:px-2">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setViewItem(item)}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
            title="Ver detalhes"
          >
            <Eye size={13} />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Matriculas</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Gerencie as matriculas dos alunos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
            {/* Status filter */}
            <select
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-2 py-2 sm:py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Todos os estados</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
            {/* Academic year filter */}
            <select
              value={filters.academicYearId || ""}
              onChange={(e) => setFilters({ ...filters, academicYearId: e.target.value })}
              className="px-2 py-2 sm:py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Todos os anos</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>{ay.name}</option>
              ))}
            </select>
            <button className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95">
              <SlidersHorizontal size={16} />
            </button>
            <button className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95">
              <ArrowUpDown size={16} />
            </button>
            {isAdmin && (
              <button
                onClick={() => { setCreateOpen(true); loadCreateOptions() }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nova Matricula</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhuma matricula encontrada</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Create Modal */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Matricula">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {createError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm">
              {createError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Aluno *</label>
            <select
              value={createForm.studentId}
              onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Selecione um aluno</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Turma *</label>
            <select
              value={createForm.classId}
              onChange={(e) => setCreateForm({ ...createForm, classId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Selecione uma turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.grade}.a classe)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Ano Letivo *</label>
            <select
              value={createForm.academicYearId}
              onChange={(e) => setCreateForm({ ...createForm, academicYearId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Selecione o ano letivo</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>{ay.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Estado</label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Observacao</label>
            <textarea
              value={createForm.observation}
              onChange={(e) => setCreateForm({ ...createForm, observation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              placeholder="Observacoes opcionais..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {createLoading && <Loader2 size={14} className="animate-spin" />}
              Criar Matricula
            </button>
          </div>
        </form>
      </FormModal>

      {/* View Details Modal */}
      <FormModal open={!!viewItem} onClose={() => setViewItem(null)} title="Detalhes da Matricula">
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Aluno</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{viewItem.student.name}</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{viewItem.student.email}</p>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Turma</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{viewItem.class.name}</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{viewItem.class.grade}.a classe</p>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Ano Letivo</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">{viewItem.academicYear.name}</span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Estado</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[viewItem.status] || ""}`}>
                  {statusLabels[viewItem.status] || viewItem.status}
                </span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Media Final</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {viewItem.finalAverage !== null ? viewItem.finalAverage.toFixed(1) : "\u2014"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Disciplinas Reprovadas</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {viewItem.failedSubjects !== null ? viewItem.failedSubjects : "\u2014"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Data Matricula</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(viewItem.enrolledAt)}</span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Data Decisao</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(viewItem.decidedAt)}</span>
              </div>
            </div>
            {viewItem.observation && (
              <div>
                <span className="block text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Observacao</span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
                  {viewItem.observation}
                </p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}

export default EnrollmentListPage
