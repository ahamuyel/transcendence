"use client"

import { useEffect, useState, useCallback } from "react"
import {
  BookOpen,
  GraduationCap,
  Layers,
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
} from "lucide-react"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"

/* ──────────────────────── Types ──────────────────────── */

interface GlobalSubject {
  id: string
  name: string
  code: string
  active: boolean
  _count: { schoolSubjects: number }
}

interface GlobalCourse {
  id: string
  name: string
  code: string
  active: boolean
  _count: { schoolCourses: number }
}

interface GlobalClass {
  id: string
  name: string
  grade: number
  active: boolean
  cycleId: string | null
  cycle: { id: string; name: string; level: string } | null
  _count: { schoolClasses: number }
}

interface EducationCycle {
  id: string
  name: string
  level: string
  startGrade: number
  endGrade: number
  active: boolean
  _count: { globalClasses: number }
}

type TabKey = "subjects" | "courses" | "classes" | "cycles"

const LEVEL_LABELS: Record<string, string> = {
  primario: "Primário",
  primeiro_ciclo: "1º Ciclo",
  segundo_ciclo: "2º Ciclo",
}

const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS)

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-zinc-900 dark:text-zinc-100"

const selectClass = inputClass + " appearance-none"

/* ──────────────────────── Active Badge ──────────────────────── */

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      Inativo
    </span>
  )
}

/* ──────────────────────── Tab: Subjects ──────────────────────── */

function SubjectsTab() {
  const [items, setItems] = useState<GlobalSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GlobalSubject | null>(null)
  const [form, setForm] = useState({ name: "", code: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<GlobalSubject | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), search })
      const res = await fetch(`/api/admin/catalog/subjects?${params}`)
      const json = await res.json()
      setItems(json.data ?? [])
      setTotalPages(json.totalPages ?? 1)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", code: "" })
    setError("")
    setModalOpen(true)
  }

  function openEdit(item: GlobalSubject) {
    setEditing(item)
    setForm({ name: item.name, code: item.code })
    setError("")
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const url = editing
        ? `/api/admin/catalog/subjects/${editing.id}`
        : "/api/admin/catalog/subjects"
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, code: form.code.toUpperCase() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Erro ao guardar")
        return
      }
      setModalOpen(false)
      fetchData()
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: GlobalSubject) {
    await fetch(`/api/admin/catalog/subjects/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    })
    fetchData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/catalog/subjects/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || "Erro ao excluir")
    }
    setDeleteTarget(null)
    fetchData()
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            className={inputClass + " pl-9"}
            placeholder="Pesquisar disciplinas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Nova Disciplina
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400">Nenhuma disciplina encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Escolas</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{s.name}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{s.code}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(s)} title="Alternar estado">
                        <ActiveBadge active={s.active} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{s._count.schoolSubjects}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Disciplina" : "Nova Disciplina"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Nome</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Código</label>
            <input className={inputClass + " uppercase"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name ?? ""}
      />
    </>
  )
}

/* ──────────────────────── Tab: Courses ──────────────────────── */

function CoursesTab() {
  const [items, setItems] = useState<GlobalCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GlobalCourse | null>(null)
  const [form, setForm] = useState({ name: "", code: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<GlobalCourse | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), search })
      const res = await fetch(`/api/admin/catalog/courses?${params}`)
      const json = await res.json()
      setItems(json.data ?? [])
      setTotalPages(json.totalPages ?? 1)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", code: "" })
    setError("")
    setModalOpen(true)
  }

  function openEdit(item: GlobalCourse) {
    setEditing(item)
    setForm({ name: item.name, code: item.code })
    setError("")
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const url = editing
        ? `/api/admin/catalog/courses/${editing.id}`
        : "/api/admin/catalog/courses"
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, code: form.code.toUpperCase() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Erro ao guardar")
        return
      }
      setModalOpen(false)
      fetchData()
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: GlobalCourse) {
    await fetch(`/api/admin/catalog/courses/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    })
    fetchData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/catalog/courses/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || "Erro ao excluir")
    }
    setDeleteTarget(null)
    fetchData()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            className={inputClass + " pl-9"}
            placeholder="Pesquisar cursos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Novo Curso
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400">Nenhum curso encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Escolas</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)} title="Alternar estado">
                        <ActiveBadge active={c.active} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{c._count.schoolCourses}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Curso" : "Novo Curso"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Nome</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Código</label>
            <input className={inputClass + " uppercase"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </FormModal>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name ?? ""}
      />
    </>
  )
}

/* ──────────────────────── Tab: Classes ──────────────────────── */

function ClassesTab() {
  const [items, setItems] = useState<GlobalClass[]>([])
  const [cycles, setCycles] = useState<EducationCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GlobalClass | null>(null)
  const [form, setForm] = useState({ name: "", grade: 1, cycleId: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<GlobalClass | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [classRes, cycleRes] = await Promise.all([
        fetch("/api/admin/catalog/classes"),
        fetch("/api/admin/catalog/cycles"),
      ])
      const classJson = await classRes.json()
      const cycleJson = await cycleRes.json()
      setItems(classJson.data ?? [])
      setCycles(cycleJson.data ?? [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", grade: 1, cycleId: "" })
    setError("")
    setModalOpen(true)
  }

  function openEdit(item: GlobalClass) {
    setEditing(item)
    setForm({ name: item.name, grade: item.grade, cycleId: item.cycleId ?? "" })
    setError("")
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const url = editing
        ? `/api/admin/catalog/classes/${editing.id}`
        : "/api/admin/catalog/classes"
      const body: Record<string, unknown> = { name: form.name, grade: form.grade }
      if (form.cycleId) body.cycleId = form.cycleId
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Erro ao guardar")
        return
      }
      setModalOpen(false)
      fetchData()
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: GlobalClass) {
    await fetch(`/api/admin/catalog/classes/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    })
    fetchData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/catalog/classes/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || "Erro ao excluir")
    }
    setDeleteTarget(null)
    fetchData()
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Nova Classe
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400">Nenhuma classe encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Classe</th>
                  <th className="px-4 py-3">Ciclo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Escolas</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-500">{c.grade}ª</td>
                    <td className="px-4 py-3 text-zinc-500">{c.cycle ? c.cycle.name : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)} title="Alternar estado">
                        <ActiveBadge active={c.active} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{c._count.schoolClasses}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Classe" : "Nova Classe"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Nome</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Classe (1-13)</label>
            <input className={inputClass} type="number" min={1} max={13} value={form.grade} onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Ciclo</label>
            <select className={selectClass} value={form.cycleId} onChange={(e) => setForm({ ...form, cycleId: e.target.value })}>
              <option value="">— Sem ciclo —</option>
              {cycles.map((cy) => (
                <option key={cy.id} value={cy.id}>{cy.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </FormModal>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name ?? ""}
      />
    </>
  )
}

/* ──────────────────────── Tab: Cycles ──────────────────────── */

function CyclesTab() {
  const [items, setItems] = useState<EducationCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EducationCycle | null>(null)
  const [form, setForm] = useState({ name: "", level: "primario", startGrade: 1, endGrade: 6 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<EducationCycle | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/catalog/cycles")
      const json = await res.json()
      setItems(json.data ?? [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", level: "primario", startGrade: 1, endGrade: 6 })
    setError("")
    setModalOpen(true)
  }

  function openEdit(item: EducationCycle) {
    setEditing(item)
    setForm({ name: item.name, level: item.level, startGrade: item.startGrade, endGrade: item.endGrade })
    setError("")
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const url = editing
        ? `/api/admin/catalog/cycles/${editing.id}`
        : "/api/admin/catalog/cycles"
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Erro ao guardar")
        return
      }
      setModalOpen(false)
      fetchData()
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: EducationCycle) {
    await fetch(`/api/admin/catalog/cycles/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    })
    fetchData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/catalog/cycles/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || "Erro ao excluir")
    }
    setDeleteTarget(null)
    fetchData()
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Novo Ciclo
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400">Nenhum ciclo encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Nível</th>
                  <th className="px-4 py-3">Classes</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Classes Assoc.</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((cy) => (
                  <tr key={cy.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{cy.name}</td>
                    <td className="px-4 py-3 text-zinc-500">{LEVEL_LABELS[cy.level] ?? cy.level}</td>
                    <td className="px-4 py-3 text-zinc-500">{cy.startGrade}ª - {cy.endGrade}ª</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(cy)} title="Alternar estado">
                        <ActiveBadge active={cy.active} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{cy._count.globalClasses}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cy)} className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(cy)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Ciclo" : "Novo Ciclo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Nome</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Nível</label>
            <select className={selectClass} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
              {LEVEL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Classe Inicial</label>
              <input className={inputClass} type="number" min={1} max={13} value={form.startGrade} onChange={(e) => setForm({ ...form, startGrade: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Classe Final</label>
              <input className={inputClass} type="number" min={1} max={13} value={form.endGrade} onChange={(e) => setForm({ ...form, endGrade: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </FormModal>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name ?? ""}
      />
    </>
  )
}

/* ──────────────────────── Main Page ──────────────────────── */

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "subjects", label: "Disciplinas", icon: BookOpen },
  { key: "courses", label: "Cursos", icon: GraduationCap },
  { key: "classes", label: "Classes", icon: Layers },
  { key: "cycles", label: "Ciclos", icon: GitBranch },
]

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("subjects")

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Catálogo Global</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Gerir disciplinas, cursos, classes e ciclos de ensino da plataforma
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "subjects" && <SubjectsTab />}
      {activeTab === "courses" && <CoursesTab />}
      {activeTab === "classes" && <ClassesTab />}
      {activeTab === "cycles" && <CyclesTab />}
    </div>
  )
}
