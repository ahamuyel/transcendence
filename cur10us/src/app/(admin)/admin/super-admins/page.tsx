"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Plus, ShieldCheck, Copy, Check, Power } from "lucide-react"
import { useSession } from "next-auth/react"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"

interface SuperAdmin {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
}

export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<SuperAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<SuperAdmin | null>(null)
  const { data: session } = useSession()

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/super-admins")
      const data = await res.json()
      setAdmins(data.data || [])
    } catch {
      console.error("Erro ao carregar super admins")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)
    try {
      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Erro ao criar")
        return
      }
      setCreatedCreds({ email: data.email, password: form.password })
      setShowForm(false)
      setForm({ name: "", email: "", password: "" })
      fetchAdmins()
    } catch {
      setFormError("Erro de conexão")
    } finally {
      setFormLoading(false)
    }
  }

  const handleCopy = () => {
    if (!createdCreds) return
    navigator.clipboard.writeText(`E-mail: ${createdCreds.email}\nPalavra-passe: ${createdCreds.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    const res = await fetch(`/api/admin/super-admins/${toggleTarget.id}/toggle-active`, { method: "POST" })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "Erro ao alterar estado")
      return
    }
    setToggleTarget(null)
    fetchAdmins()
  }

  const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Super Admins</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerir administradores da plataforma</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setCreatedCreds(null) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} />
          Criar Super Admin
        </button>
      </div>

      {/* Created credentials banner */}
      {createdCreds && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
            Super admin criado com sucesso! Credenciais temporárias:
          </p>
          <div className="flex items-center gap-3">
            <code className="text-xs bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex-1">
              E-mail: {createdCreds.email} | Palavra-passe: {createdCreds.password}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            O utilizador será obrigado a alterar a palavra-passe no primeiro acesso.
          </p>
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Novo Super Admin</h2>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm mb-4">{formError}</div>
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-mail</label>
                <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Palavra-passe temporária</label>
                <input className={inputClass} type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} />
                <p className="text-xs text-zinc-400 mt-1">O utilizador será obrigado a alterar no primeiro acesso.</p>
              </div>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20">
                  {formLoading ? "A criar..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">Nenhum super admin encontrado</div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 uppercase">
                <th className="text-left py-3 px-4 font-medium">Nome</th>
                <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">E-mail</th>
                <th className="text-left py-3 px-4 font-medium">Estado</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Criado em</th>
                <th className="text-right py-3 px-4 font-medium">Acções</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                        <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{admin.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">{admin.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${admin.isActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                      {admin.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-500 hidden md:table-cell">{new Date(admin.createdAt).toLocaleDateString("pt")}</td>
                  <td className="py-3 px-4 text-right">
                    {session?.user?.id !== admin.id && (
                      <button
                        onClick={() => setToggleTarget(admin)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          admin.isActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <Power size={12} />
                        <span className="hidden sm:inline">{admin.isActive ? "Desactivar" : "Activar"}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleActive}
        title={toggleTarget?.isActive ? "Desactivar Super Admin" : "Activar Super Admin"}
        message={
          toggleTarget?.isActive
            ? `Tem a certeza que deseja desactivar "${toggleTarget?.name}"? Não poderá aceder à plataforma.`
            : `Tem a certeza que deseja reactivar "${toggleTarget?.name}"?`
        }
        confirmLabel={toggleTarget?.isActive ? "Desactivar" : "Activar"}
        confirmColor={toggleTarget?.isActive ? "red" : "emerald"}
      />
    </div>
  )
}
