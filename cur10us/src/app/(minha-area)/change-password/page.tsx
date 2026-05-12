"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert } from "lucide-react"
import { csrfPost } from "@/lib/csrf-client"
import { changePasswordSchema } from "@/lib/validations/auth"

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
  const hasPassword = session?.user?.hasPassword

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const isMustChange = session?.user?.mustChangePassword

  function validate() {
    const e: Record<string, string> = {}

    if (newPassword !== confirmPassword) {
      e.confirmPassword = "As palavras-passe não coincidem"
    }

    const payload = hasPassword
      ? { currentPassword, newPassword }
      : { newPassword }

    const parsed = changePasswordSchema.safeParse(payload)
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => {
        const field = i.path[0] as string
        if (field === "newPassword") e.newPassword = i.message
        if (field === "currentPassword") e.currentPassword = i.message
      })
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validate()) return

    setLoading(true)
    try {
      const payload = hasPassword
        ? { currentPassword, newPassword }
        : { newPassword }

      const res = await csrfPost("/api/auth/change-password", payload)
      const data = await res.json()

      if (!res.ok) {
        setErrors({ general: data.error || "Erro ao alterar palavra-passe" })
        return
      }

      setSuccess(true)
      setTimeout(() => {
        signOut({ callbackUrl: "/signin?reason=password_changed" })
      }, 2000)
    } catch {
      setErrors({ general: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">Palavra-passe definida!</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Agora pode entrar com e-mail e senha. Vai ser redirecionado...
            </p>
          </div>
        </div>
      </div>
    )
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
                {hasPassword ? "Alterar palavra-passe" : "Definir palavra-passe"}
              </h1>
              {isMustChange && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Tem de alterar a sua palavra-passe temporária antes de continuar.
                </p>
              )}
            </div>
          </div>

          {!hasPassword && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 mb-4 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                A sua conta foi criada com o Google. Defina uma palavra-passe para
                poder entrar também com e-mail e senha.
              </span>
            </div>
          )}

          {errors.general && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {hasPassword && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Palavra-passe actual
                </label>
                <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nova palavra-passe
              </label>
              <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Confirmar nova palavra-passe
              </label>
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading
                ? "A guardar..."
                : hasPassword
                  ? "Alterar palavra-passe"
                  : "Definir palavra-passe"}
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
