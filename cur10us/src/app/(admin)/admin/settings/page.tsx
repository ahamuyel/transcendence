"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, Check } from "lucide-react"

interface PlatformConfig {
  name: string
  logo: string | null
  contactEmail: string | null
  contactPhone: string | null
  description: string | null
  maintenanceMode: boolean
  allowRegistration: boolean
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError("Erro ao carregar configurações"))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!config) return
    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao salvar")
        return
      }
      const data = await res.json()
      setConfig(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="text-center py-16 text-zinc-400 text-sm">Erro ao carregar configurações</div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-zinc-900 dark:text-zinc-100"

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Configurações da Plataforma</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Gerir definições globais do Cur10usX</p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
          <Check size={14} />
          Configurações guardadas com sucesso!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Informações Gerais</h2>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Nome da plataforma
            </label>
            <input
              className={inputClass}
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Descrição
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={config.description || ""}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Descrição da plataforma..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              URL do logo
            </label>
            <input
              className={inputClass}
              type="url"
              value={config.logo || ""}
              onChange={(e) => setConfig({ ...config, logo: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contactos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                E-mail de contacto
              </label>
              <input
                className={inputClass}
                type="email"
                value={config.contactEmail || ""}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                placeholder="contacto@cur10usx.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Telefone de contacto
              </label>
              <input
                className={inputClass}
                value={config.contactPhone || ""}
                onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                placeholder="+244 ..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Funcionalidades</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.allowRegistration}
              onChange={(e) => setConfig({ ...config, allowRegistration: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Permitir solicitações</span>
              <p className="text-xs text-zinc-500">Novas escolas e utilizadores podem enviar solicitações</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
            />
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Modo de manutenção</span>
              <p className="text-xs text-zinc-500">A plataforma ficará indisponível para utilizadores não-admin</p>
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "A guardar..." : "Guardar configurações"}
          </button>
        </div>
      </form>
    </div>
  )
}
