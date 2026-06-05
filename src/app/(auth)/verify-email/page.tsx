"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { csrfPost } from "@/lib/csrf-client"
import { useTranslation } from "@/lib/i18n"
import {
  AuthCard,
  AlertBanner,
} from "@/components/auth"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tUI } = useTranslation()
  const token = searchParams.get("token")
  const justRegistered = searchParams.get("justRegistered")
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "resend">("resend")
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [emailError, setEmailError] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("resend")
      return
    }
    setStatus("verifying")

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "POST",
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || tUI("Falha na verificação"))
          setStatus("error")
          return
        }
        setStatus("success")
      } catch {
        setError(tUI("Erro de conexão. Verifique a sua internet e tente novamente."))
        setStatus("error")
      }
    }
    verify()
  }, [token, tUI])

  async function handleResend() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(tUI("Introduza um e-mail válido"))
      return
    }
    setEmailError("")
    setResending(true)
    try {
      const res = await csrfPost("/api/auth/verify-email", { email }, "PATCH")
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || tUI("Falha ao reenviar e-mail"))
        return
      }
      setResent(true)
    } catch {
      setError(tUI("Erro de conexão. Verifique a sua internet e tente novamente."))
    } finally {
      setResending(false)
    }
  }

  if (status === "verifying") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <AuthCard>
          <div className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {tUI("A verificar e-mail...")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {tUI("Aguarde um momento")}
            </p>
          </div>
        </AuthCard>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <AuthCard>
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              {tUI("E-mail verificado!")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {tUI("O seu e-mail foi verificado com sucesso. Já pode entrar na sua conta.")}
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition"
            >
              {tUI("Entrar agora")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AuthCard>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <AuthCard>
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              {tUI("Falha na verificação")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              {error}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {tUI("O link pode ter expirado. Solicite um novo e-mail de verificação.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                {tUI("Voltar ao login")}
              </Link>
              <Link
                href="/verify-email"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition"
              >
                {tUI("Reenviar verificação")}
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-primary dark:text-primary-400" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {justRegistered
              ? tUI("Conta criada com sucesso!")
              : tUI("Verifique o seu e-mail")}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            {justRegistered
              ? tUI("Enviamos um e-mail de verificação para a sua caixa de entrada. Verifique também a pasta de spam.")
              : tUI("Insira o seu e-mail para receber um link de verificação")}
          </p>

          {error && (
            <AlertBanner variant="error" className="mb-5 text-left">
              {error}
            </AlertBanner>
          )}

          {resent && (
            <AlertBanner variant="success" className="mb-5">
              {tUI("E-mail de verificação enviado com sucesso!")}
            </AlertBanner>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleResend()
            }}
            className="flex flex-col gap-3"
          >
            <div className="text-left">
              <label
                htmlFor="verify-email-input"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 text-left"
              >
                {tUI("E-mail")}
              </label>
              <input
                id="verify-email-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError("")
                }}
                disabled={resending}
                className={`w-full h-10 px-3 rounded-lg border text-sm bg-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50 ${
                  emailError
                    ? "border-red-400 dark:border-red-600"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              />
              {emailError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">
                  {emailError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={resending || !email}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {tUI("Enviando...")}
                </>
              ) : (
                tUI("Reenviar link de verificação")
              )}
            </button>
          </form>
        </div>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        <Link
          href="/signin"
          className="text-primary font-medium hover:underline"
        >
          {tUI("Voltar ao login")}
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
