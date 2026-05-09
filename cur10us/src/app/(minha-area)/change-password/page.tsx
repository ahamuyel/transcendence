"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { csrfPost } from "@/lib/csrf-client"

const inputClass =
  "w-full px-3 py-2 pr-10 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

function PasswordInput({ value, onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={inputClass} value={value} onChange={onChange} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isMustChange = session?.user?.mustChangePassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("As palavras-passe não coincidem")
      return
    }

    if (newPassword.length < 8) {
      setError("Nova palavra-passe deve ter pelo menos 8 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await csrfPost("/api/auth/change-password", { currentPassword, newPassword })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao alterar palavra-passe")
        return
      }

      signOut({ callbackUrl: "/signin" })
      return
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Alterar palavra-passe
              </h1>
              {isMustChange && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Tem de alterar a sua palavra-passe temporária antes de continuar.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Palavra-passe actual
              </label>
              <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nova palavra-passe
              </label>
              <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Confirmar nova palavra-passe
              </label>
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading ? "A alterar..." : "Alterar palavra-passe"}
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
            >
              Voltar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
