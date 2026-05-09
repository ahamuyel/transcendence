"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import { useState, Suspense } from "react"
import { csrfPost } from "@/lib/csrf-client"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Link inválido</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Este link de redefinição é inválido ou expirou.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Palavra-passe redefinida</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            A sua palavra-passe foi actualizada com sucesso.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Palavra-passe deve ter pelo menos 8 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await csrfPost("/api/auth/reset-password", { token, password })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao redefinir palavra-passe")
        return
      }

      setSuccess(true)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Nova palavra-passe</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Introduza a sua nova palavra-passe abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300"
            >
              Nova palavra-passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            {loading ? "A redefinir..." : "Redefinir palavra-passe"}
          </button>
        </form>
      </div>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
