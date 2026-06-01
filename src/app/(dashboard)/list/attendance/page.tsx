"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import AttendanceForm from "@/components/forms/AttendanceForm"
import AttendanceStatsPanel from "@/components/ui/AttendanceStatsPanel"
import StudentAttendanceCard from "@/components/ui/StudentAttendanceCard"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { useEntityList } from "@/hooks/useEntityList"
import { Plus, Loader2, BarChart3 } from "lucide-react"

type Attendance = {
  id: string
  date: string
  status: string
  studentId: string
  classId: string
  lessonId?: string | null
  student?: { id: string; name: string }
  class?: { id: string; name: string }
  lesson?: { id: string; subject?: { name: string }; startTime?: string; endTime?: string } | null
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "presente": return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
    case "ausente": return "bg-rose-100 dark:bg-rose-950/40 text-rose-600"
    case "atrasado": return "bg-amber-100 dark:bg-amber-950/40 text-amber-600"
    default: return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
  }
}

const columns = [
  { header: "Aluno", accessor: "student" },
  { header: "Turma", accessor: "class" },
  { header: "Data", accessor: "date" },
  { header: "Aula", accessor: "lesson", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
]

const AttendanceListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"

  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Attendance>({
    endpoint: "/api/attendance",
    limit: 10,
  })

  const filterConfig = [
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "status", label: "Estado", type: "select" as const, options: [{ value: "presente", label: "Presente" }, { value: "ausente", label: "Ausente" }, { value: "atrasado", label: "Atrasado" }] },
    { key: "date", label: "Período", type: "dateRange" as const },
  ]
  const sortOptions = [
    { field: "date", label: "Data" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [statsClass, setStatsClass] = useState<string | null>(null)
  const [statsStudent, setStatsStudent] = useState<string | null>(null)

  const renderRow = (item: Attendance) => (
    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <button onClick={() => setStatsStudent(item.studentId)} className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm hover:text-indigo-600 transition">
          {item.student?.name}
        </button>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.class?.name}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {new Date(item.date).toLocaleDateString("pt")}
      </td>
      <td className="hidden md:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-500 text-xs">
        {item.lesson ? `${item.lesson.subject?.name || ""} ${item.lesson.startTime || ""}` : "—"}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${getStatusBadge(item.status)}`}>
          {item.status}
        </span>
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Assiduidade</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Controlo de presenças</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            {canManage && filters.classId && (
              <button
                onClick={() => setStatsClass(filters.classId)}
                className="p-2 sm:p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition active:scale-95"
                title="Estatísticas"
              >
                <BarChart3 size={16} />
              </button>
            )}
            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Registar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhum registo de assiduidade encontrado</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Registar Assiduidade">
        <AttendanceForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      {/* Class Stats Modal */}
      <FormModal open={!!statsClass} onClose={() => setStatsClass(null)} title="Estatísticas da Turma">
        {statsClass && <AttendanceStatsPanel classId={statsClass} />}
      </FormModal>

      {/* Student Stats Modal */}
      <FormModal open={!!statsStudent} onClose={() => setStatsStudent(null)} title="Assiduidade do Aluno">
        {statsStudent && <StudentAttendanceCard studentId={statsStudent} />}
      </FormModal>
    </div>
  )
}

export default AttendanceListPage
