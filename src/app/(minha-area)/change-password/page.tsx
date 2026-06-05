"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Lock, CheckCircle2, ShieldAlert } from "lucide-react"
import { csrfPost } from "@/lib/csrf-client"
import { changePasswordSchema } from "@/lib/validations/auth"
import {
  AuthCard,
  PasswordInput,
  SubmitButton,
  AlertBanner,
} from "@/components/auth"

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const hasPassword = session?.user?.hasPassword
  const isMustChange = session?.user?.mustChangePassword

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (newPassword !== confirmPassword) {
      e.confirmPassword = "As palavras-passe não coincidem"
    }
    const payload = hasPassword ? { currentPassword, newPassword } : { newPassword }
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
      const payload = hasPassword ? { currentPassword, newPassword } : { newPassword }
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
        <div className="w-full max-w-md">
          <AuthCard>
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Palavra-passe definida!
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Agora pode entrar com e-mail e senha. Vai ser redirecionado...
              </p>
            </div>
          </AuthCard>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <AuthCard>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary dark:text-primary-400" />
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
              <AlertBanner variant="warning" icon={ShieldAlert} className="mb-4">
                A sua conta foi criada com o Google. Defina uma palavra-passe para
                poder entrar também com e-mail e senha.
              </AlertBanner>
            )}

            {errors.general && (
              <AlertBanner variant="error" className="mb-4">
                {errors.general}
              </AlertBanner>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {hasPassword && (
                <PasswordInput
                  id="currentPassword"
                  label="Palavra-passe actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  error={errors.currentPassword}
                  required
                />
              )}

              <PasswordInput
                id="newPassword"
                label="Nova palavra-passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
                required
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirmar nova palavra-passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
              />

              <SubmitButton loading={loading} loadingText="A guardar...">
                {hasPassword ? "Alterar palavra-passe" : "Definir palavra-passe"}
              </SubmitButton>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
              >
                Voltar
              </button>
            </form>
          </div>
        </AuthCard>
      </div>
    </div>
  )
}
