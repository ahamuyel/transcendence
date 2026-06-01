"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Search } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import ApplicationReviewForm from "@/components/forms/ApplicationReviewForm"
import Pagination from "@/components/ui/Pagination"

interface Application {
  id: string
  name: string
  email: string
  phone: string
  role: string
  message?: string | null
  status: string
  rejectReason?: string | null
  createdAt: string
}

const roleLabels: Record<string, string> = {
  teacher: "Professor(a)",
  student: "Aluno(a)",
  parent: "Encarregado",
}

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "em_analise", label: "Em análise" },
  { value: "aprovada", label: "Aprovadas" },
  { value: "matriculada", label: "Matriculadas" },
  { value: "rejeitada", label: "Rejeitadas" },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selected, setSelected] = useState<Application | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)

      const res = await fetch(`/api/applications?${params}`)
      const data = await res.json()
      setApplications(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      console.error("Erro ao carregar solicitações")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Solicitações</h1>
        <p className="text-sm text-zinc-500">{total} solicitação(ões) encontrada(s)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm flex-1 max-w-xs">
          <Search size={14} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="bg-transparent outline-none text-sm w-full text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === f.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <ApplicationReviewForm
          application={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchApplications}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium hidden sm:table-cell">Perfil</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{app.name}</div>
                      <div className="text-xs text-zinc-400">{app.email}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">{roleLabels[app.role] || app.role}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{new Date(app.createdAt).toLocaleDateString("pt")}</td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">Nenhuma solicitação encontrada</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 border-t border-zinc-200 dark:border-zinc-800">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
