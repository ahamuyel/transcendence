"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { KeyRound, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react"
import { useState, Suspense, useMemo } from "react"
import { csrfPost } from "@/lib/csrf-client"
import { resetPasswordSchema } from "@/lib/validations/auth"
import {
  AuthCard,
  AuthHeader,
  PasswordInput,
  SubmitButton,
  AlertBanner,
  AuthSuccess,
} from "@/components/auth"

function PasswordRequirements({ password }: { password: string }) {
  const checks = useMemo(
    () => [
      { label: "Mínimo 8 caracteres", met: password.length >= 8 },
      { label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
      { label: "Uma letra minúscula", met: /[a-z]/.test(password) },
      { label: "Um número", met: /[0-9]/.test(password) },
    ],
    [password],
  )

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div
          key={check.label}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            check.met
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          <svg
            className="w-3 h-3 shrink-0"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            {check.met ? (
              <path
                d="M3 6l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
          <span>{check.label}</span>
        </div>
      ))}
    </div>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <AuthCard>
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Link inválido
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Este link de redefinição é inválido ou expirou. Solicite um novo
              link.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition"
            >
              Solicitar novo link
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </AuthCard>
      </div>
    )
  }

  if (success) {
    return (
      <AuthSuccess
        icon={CheckCircle2}
        title="Palavra-passe redefinida"
        actionLabel="Ir para o login"
        actionHref="/signin"
      >
        <p>A sua palavra-passe foi actualizada com sucesso.</p>
        <p>Pode agora entrar na sua conta com a nova palavra-passe.</p>
      </AuthSuccess>
    )
  }

  function validate() {
    const e: Record<string, string> = {}
    if (password !== confirmPassword) {
      e.confirmPassword = "As palavras-passe não coincidem"
    }
    const parsed = resetPasswordSchema.safeParse({ token, password })
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => {
        const field = i.path[0] as string
        if (field === "password") e.password = i.message
      })
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    if (!validate()) return
    setLoading(true)
    try {
      const res = await csrfPost("/api/auth/reset-password", { token, password })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ general: data.error || "Erro ao redefinir palavra-passe" })
        return
      }
      setSuccess(true)
    } catch {
      setErrors({
        general: "Erro de conexão. Verifique a sua internet e tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          <AuthHeader
            icon={KeyRound}
            title="Nova palavra-passe"
            subtitle="Escolha uma nova palavra-passe para a sua conta."
          />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <AlertBanner variant="error">{errors.general}</AlertBanner>
            )}

            <div>
              <PasswordInput
                id="password"
                label="Nova palavra-passe"
                placeholder="Mín. 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={loading}
              />
              <PasswordRequirements password={password} />
            </div>

            <PasswordInput
              id="confirmPassword"
              label="Confirmar nova palavra-passe"
              placeholder="Repita a palavra-passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={loading}
            />

            <SubmitButton loading={loading} loadingText="A redefinir...">
              <KeyRound className="w-4 h-4" />
              Redefinir palavra-passe
            </SubmitButton>
          </form>
        </div>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto flex items-center justify-center min-h-[200px]" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
