"use client"
import { useState } from "react"
import { Download, Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react"

export default function GDPRPage() {
  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDone, setDeleteDone] = useState(false)
  const [error, setError] = useState("")

  const handleExport = async () => {
    setExporting(true)
    setError("")
    try {
      const res = await fetch("/api/gdpr/export")
      if (!res.ok) throw new Error("Erro ao exportar")
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meus-dados-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportDone(true)
      setTimeout(() => setExportDone(false), 5000)
    } catch {
      setError("Erro ao exportar dados. Tente novamente.")
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError("")
    try {
      const res = await fetch("/api/gdpr/account", { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao eliminar")
      setDeleteDone(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
    } catch {
      setError("Erro ao eliminar conta. Tente novamente.")
      setDeleting(false)
    }
  }

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Privacidade e Dados
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Gerencie os seus dados pessoais em conformidade com o RGPD
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {exportDone && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle size={16} />
            Dados exportados com sucesso!
          </div>
        )}

        {deleteDone && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-600 dark:text-amber-400">
            Conta eliminada. A redirecionar...
          </div>
        )}

        {/* Export */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Exportar os meus dados
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Descarregue uma cópia de todos os seus dados pessoais armazenados na plataforma
            (formato JSON).
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "A exportar..." : "Exportar dados"}
          </button>
        </div>

        {/* Delete */}
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
            <AlertTriangle size={16} />
            Eliminar conta
          </h2>
          <p className="text-xs text-red-600 dark:text-red-400/80 mb-3">
            Esta ação é irreversível. Todos os seus dados serão permanentemente eliminados
            da plataforma.
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              <Trash2 size={16} />
              Eliminar minha conta
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {deleting ? "A eliminar..." : "Confirmar eliminação"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
