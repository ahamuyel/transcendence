"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Download, FileSpreadsheet, Trash2, AlertTriangle, Ghost } from "lucide-react"
import { useEntityList } from "@/hooks/useEntityList"
import Pagination from "@/components/ui/Pagination"
import StatusBadge from "@/components/ui/StatusBadge"

type ImportJob = {
  id: string
  filename: string
  userType: string
  status: string
  totalRows: number
  successCount: number
  failedCount: number
  createdAt: string
  importedBy: { id: string; name: string }
}

type OrphanedUser = {
  id: string
  name: string
  email: string
  createdAt: string
}

type CleanupInfo = {
  orphanedCount: number
  totalUsersWithRole: number
  orphanedUsers: OrphanedUser[]
}

const typeLabels: Record<string, string> = {
  student: "Alunos",
  teacher: "Professores",
  parent: "Encarregados",
}

export default function ImportHistoryPage() {
  const router = useRouter()
  const { data, totalPages, page, setPage, loading, refetch } = useEntityList<ImportJob>({ endpoint: "/api/import", limit: 10 })

  const [cleanupRole, setCleanupRole] = useState("student")
  const [cleanupInfo, setCleanupInfo] = useState<CleanupInfo | null>(null)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [cleanupDeleting, setCleanupDeleting] = useState(false)
  const [cleanupMessage, setCleanupMessage] = useState("")

  const handleCheckOrphans = useCallback(async () => {
    setCleanupLoading(true)
    setCleanupMessage("")
    setCleanupInfo(null)
    try {
      const res = await fetch(`/api/import/cleanup?role=${cleanupRole}`)
      const data = await res.json()
      if (!res.ok) {
        setCleanupMessage(data.error || "Erro ao verificar")
        return
      }
      setCleanupInfo(data)
      if (data.orphanedCount === 0) {
        setCleanupMessage("Nenhum registo órfão encontrado.")
      }
    } catch {
      setCleanupMessage("Erro de conexão")
    } finally {
      setCleanupLoading(false)
    }
  }, [cleanupRole])

  const handleDeleteOrphans = useCallback(async () => {
    if (!cleanupInfo || cleanupInfo.orphanedCount === 0) return
    setCleanupDeleting(true)
    setCleanupMessage("")
    try {
      const res = await fetch("/api/import/cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: cleanupRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCleanupMessage(data.error || "Erro ao eliminar")
        return
      }
      setCleanupMessage(`${data.deletedCount} registo(s) órfão(s) eliminado(s) com sucesso.`)
      setCleanupInfo(null)
      refetch()
    } catch {
      setCleanupMessage("Erro de conexão")
    } finally {
      setCleanupDeleting(false)
    }
  }, [cleanupRole, cleanupInfo, refetch])

  const inputClass = "px-3 py-1.5 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

  return (
    <div className="m-2 sm:m-3 space-y-4 max-w-3xl">
      {/* Import History */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/import")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Histórico de Importações</h1>
            <p className="text-xs sm:text-sm text-zinc-500">Todas as importações realizadas nesta escola</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">Nenhuma importação realizada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{job.filename}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span>{typeLabels[job.userType] || job.userType}</span>
                    <span>{job.successCount}/{job.totalRows} importados</span>
                    {job.failedCount > 0 && <span className="text-rose-500">{job.failedCount} falhados</span>}
                    <span>{new Date(job.createdAt).toLocaleDateString("pt")}</span>
                    <span>por {job.importedBy.name}</span>
                  </div>
                </div>
                <a
                  href={`/api/import/${job.id}/export`}
                  className="shrink-0 ml-2 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition"
                  title="Descarregar relatório"
                >
                  <Download size={14} />
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Orphan Cleanup */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Ghost size={18} className="text-amber-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Registos Órfãos</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Utilizadores criados por importações falhadas que ficaram sem registo completo.
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className={inputClass}
            value={cleanupRole}
            onChange={(e) => { setCleanupRole(e.target.value); setCleanupInfo(null); setCleanupMessage("") }}
          >
            <option value="student">Alunos</option>
            <option value="teacher">Professores</option>
            <option value="parent">Encarregados</option>
          </select>
          <button
            onClick={handleCheckOrphans}
            disabled={cleanupLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {cleanupLoading ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
            Verificar
          </button>
        </div>

        {cleanupMessage && (
          <p className={`mt-3 text-sm ${cleanupInfo === null && !cleanupMessage.includes("Erro") ? "text-emerald-600" : cleanupMessage.includes("Erro") ? "text-rose-600" : "text-emerald-600"}`}>
            {cleanupMessage}
          </p>
        )}

        {cleanupInfo && cleanupInfo.orphanedCount > 0 && (
          <div className="mt-3 space-y-2">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {cleanupInfo.orphanedCount} registo(s) órfão(s) encontrado(s)
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                De {cleanupInfo.totalUsersWithRole} utilizadores com esta função
              </p>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {cleanupInfo.orphanedUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs">
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                    <span className="text-zinc-500 ml-2">{u.email}</span>
                  </div>
                  <span className="text-zinc-400 text-[10px]">{new Date(u.createdAt).toLocaleDateString("pt")}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleDeleteOrphans}
              disabled={cleanupDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
            >
              {cleanupDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Eliminar {cleanupInfo.orphanedCount} registo(s) órfão(s)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
