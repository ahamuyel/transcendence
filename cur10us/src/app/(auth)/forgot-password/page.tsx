"use client"

import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { csrfPost } from "@/lib/csrf-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">E-mail enviado</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Se o e-mail informado estiver registado, receberá um link para
            redefinir a sua palavra-passe em alguns minutos.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      await csrfPost("/api/auth/forgot-password", { email })

      // Always show success to prevent email enumeration
      setSubmitted(true)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Recuperar palavra-passe</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Introduza o seu e-mail e enviaremos um link para redefinir a sua palavra-passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}
