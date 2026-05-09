"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface SchoolFormProps {
  initialData?: {
    name?: string
    slug?: string
    nif?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    provincia?: string
    logo?: string
  }
  onSubmit: (data: Record<string, string>) => Promise<void>
  onCancel: () => void
}

export default function SchoolForm({ initialData, onSubmit, onCancel }: SchoolFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    fd.forEach((v, k) => { data[k] = v.toString() })

    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: "name", label: "Nome da escola", required: true },
    { name: "slug", label: "Slug (URL)", required: true, placeholder: "minha-escola" },
    { name: "nif", label: "NIF", required: false },
    { name: "email", label: "E-mail", required: true, type: "email" },
    { name: "phone", label: "Telefone", required: true },
    { name: "address", label: "Endereço", required: true },
    { name: "city", label: "Cidade", required: true },
    { name: "provincia", label: "Província", required: true, placeholder: "Luanda" },
    { name: "logo", label: "URL do logo", required: false, type: "url" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type || "text"}
              required={f.required}
              defaultValue={initialData?.[f.name as keyof typeof initialData] || ""}
              placeholder={f.placeholder}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Salvar" : "Criar escola"}
        </button>
      </div>
    </form>
  )
}
