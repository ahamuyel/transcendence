"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Plus, Search } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import SchoolForm from "@/components/forms/SchoolForm"
import Pagination from "@/components/ui/Pagination"

interface School {
  id: string
  name: string
  slug: string
  email: string
  city: string
  provincia: string
  status: string
  _count: { teachers: number; students: number; parents: number }
}

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Icolo e Bengo", "Luanda",
  "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire",
]

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "aprovada", label: "Aprovadas" },
  { value: "ativa", label: "Ativas" },
  { value: "suspensa", label: "Suspensas" },
  { value: "rejeitada", label: "Rejeitadas" },
]

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [provinciaFilter, setProvinciaFilter] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSchools = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (provinciaFilter) params.set("provincia", provinciaFilter)

      const res = await fetch(`/api/admin/schools?${params}`)
      const data = await res.json()
      setSchools(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      console.error("Erro ao carregar escolas")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, provinciaFilter])

  useEffect(() => { fetchSchools() }, [fetchSchools])

  async function handleCreateSchool(data: Record<string, string>) {
    const res = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erro ao criar escola")
    }
    setShowForm(false)
    fetchSchools()
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Escolas</h1>
          <p className="text-sm text-zinc-500">{total} escola(s) encontrada(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nova escola
        </button>
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
        <select
          value={provinciaFilter}
          onChange={(e) => { setProvinciaFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-200 outline-none"
        >
          <option value="">Todas províncias</option>
          {PROVINCIAS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Nova escola</h2>
            <SchoolForm onSubmit={handleCreateSchool} onCancel={() => setShowForm(false)} />
          </div>
        </div>
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
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium hidden sm:table-cell">Cidade</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium hidden md:table-cell">Professores</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium hidden md:table-cell">Alunos</th>
                  <th className="text-right px-4 py-3 text-zinc-500 font-medium hidden lg:table-cell">Encarregados</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition"
                    onClick={() => (window.location.href = `/admin/schools/${school.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{school.name}</div>
                      <div className="text-xs text-zinc-400">{school.email}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">{school.city}/{school.provincia}</td>
                    <td className="px-4 py-3"><StatusBadge status={school.status} /></td>
                    <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400 hidden md:table-cell">{school._count.teachers}</td>
                    <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400 hidden md:table-cell">{school._count.students}</td>
                    <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">{school._count.parents}</td>
                  </tr>
                ))}
                {schools.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Nenhuma escola encontrada</td>
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
