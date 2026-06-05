"use client"

import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { csrfPost } from "@/lib/csrf-client"
import {
  AuthCard,
  AuthHeader,
  FormInput,
  SubmitButton,
  AlertBanner,
} from "@/components/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => {
        e[i.path[0] as string] = i.message
      })
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setLoading(true)
    try {
      const res = await csrfPost("/api/auth/forgot-password", { email })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao enviar link de recuperação")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Erro de conexão. Verifique a sua internet e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <AuthCard>
          <div className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              E-mail enviado
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Se o e-mail{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {email}
              </span>{" "}
              estiver registado, receberá um link para redefinir a sua
              palavra-passe em alguns minutos.
            </p>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 mb-6 text-left">
              <strong>Dica:</strong> Verifique também a pasta de spam ou lixo
              eletrónico.
            </div>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition"
            >
              Voltar para o login
            </Link>
          </div>
        </AuthCard>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          <AuthHeader
            icon={Mail}
            title="Recuperar palavra-passe"
            subtitle="Introduza o seu e-mail e enviaremos um link para redefinir a sua palavra-passe."
          />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && <AlertBanner variant="error">{error}</AlertBanner>}

            <FormInput
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
            />

            <SubmitButton loading={loading} loadingText="A enviar...">
              Enviar link de recuperação
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
