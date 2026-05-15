"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Verify2FAClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const email = searchParams.get("email") || session?.user?.email || ""
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email && !session?.user?.email) {
      router.replace("/signin")
    }
  }, [email, session, router])

  useEffect(() => {
    if (session && !session.user?.twoFactorEnabled) {
      router.replace("/minha-area")
    }
  }, [session, router])

  useEffect(() => {
    if (session?.user?.twoFactorVerifiedAt) {
      router.replace("/minha-area")
    }
  }, [session, router])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6)
      const newCode = [...code]
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || ""
      }
      setCode(newCode)
      const nextEmpty = newCode.findIndex((c) => !c)
      const focusIdx = nextEmpty === -1 ? 5 : nextEmpty
      inputRefs.current[focusIdx]?.focus()
      return
    }

    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = code.join("")
    if (token.length !== 6) {
      setError("Introduza o código de 6 dígitos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/2fa/verify-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Código inválido")
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        return
      }

      setSuccess(true)
      await update({ twoFactorVerifiedAt: new Date().toISOString() })
      router.replace("/minha-area")
      router.refresh()
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : ""

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="mb-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Verificação em dois passos</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Introduza o código de 6 dígitos da sua aplicação de autenticação
              </p>
              {maskedEmail && (
                <p className="text-xs text-zinc-400 mt-1">{maskedEmail}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400 text-center">
                  Código verificado com sucesso!
                </div>
              )}

              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading || success}
                    className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl border-2 outline-none transition ${
                      digit
                        ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:border-indigo-500"
                    } ${loading || success ? "opacity-50" : ""}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || success || code.some((c) => !c)}
                className="w-full h-10 rounded-xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    A verificar...
                  </>
                ) : success ? (
                  "Verificado"
                ) : (
                  "Verificar"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
              >
                <ArrowLeft size={14} />
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
