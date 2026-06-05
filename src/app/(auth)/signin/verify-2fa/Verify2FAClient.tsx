"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShieldCheck, ArrowLeft, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import {
  AuthCard,
  AlertBanner,
} from "@/components/auth"

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

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      e.preventDefault()
      const newCode = pasted.split("")
      setCode(newCode)
      inputRefs.current[5]?.focus()
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
        setError(err.error || "Código inválido. Tente novamente.")
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        return
      }
      setSuccess(true)
      await update({ twoFactorVerifiedAt: new Date().toISOString() })
      router.replace("/minha-area")
      router.refresh()
    } catch {
      setError("Erro de conexão. Verifique a sua internet e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : ""

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Verificação em dois passos
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
              Introduza o código de 6 dígitos da sua aplicação de autenticação
            </p>
            {maskedEmail && (
              <p className="text-xs text-zinc-400 mt-2 font-mono">{maskedEmail}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <AlertBanner variant="error" className="text-center">
                {error}
              </AlertBanner>
            )}

            {success && (
              <AlertBanner variant="success" className="text-center">
                Código verificado com sucesso!
              </AlertBanner>
            )}

            <div
              className="flex justify-center gap-1.5 sm:gap-2"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || success}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-lg border-2 outline-none transition ${
                    digit
                      ? "border-primary dark:border-primary-400 bg-primary-50 dark:bg-primary-950/20"
                      : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:border-primary"
                  } ${loading || success ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={`Digito ${index + 1} do código de verificação`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || success || code.some((c) => !c)}
              className="w-full h-10 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> A verificar...
                </>
              ) : success ? (
                "Verificado ✓"
              ) : (
                "Verificar"
              )}
            </button>
          </form>

          {/* Recovery hint */}
          <details className="mt-6 group">
            <summary className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition cursor-pointer list-none">
              <HelpCircle size={14} />
              <span>Perdeu o acesso à aplicação de autenticação?</span>
            </summary>
            <p className="text-xs text-zinc-400 mt-3 text-center leading-relaxed">
              Contacte o administrador da sua escola para redefinir a verificação
              em dois passos. Se for administrador, contacte o suporte Cur10usX.
            </p>
          </details>

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
      </AuthCard>
    </div>
  )
}
