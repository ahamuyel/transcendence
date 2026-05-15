"use client"
import { useState, useEffect } from "react"
import { Shield, ShieldOff, Loader2, Copy, CheckCircle, Smartphone } from "lucide-react"
import { useSession } from "next-auth/react"
import { csrfPost } from "@/lib/csrf-client"

export default function TwoFactorPage() {
  const { update } = useSession()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<"idle" | "setup" | "verify">("idle")
  const [secret, setSecret] = useState("")
  const [otpauthUrl, setOtpauthUrl] = useState("")
  const [token, setToken] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    fetch("/api/auth/2fa/status")
      .then((r) => r.json())
      .then((data) => setEnabled(data.enabled))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSetup = async () => {
    setError("")
    try {
      const res = await csrfPost("/api/auth/2fa/setup", {})
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSecret(data.secret)
      setOtpauthUrl(data.otpauth_url)
      setStep("setup")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao configurar")
    }
  }

  const handleVerify = async () => {
    if (!token.trim()) return
    setVerifying(true)
    setError("")
    try {
      const res = await csrfPost("/api/auth/2fa/verify", { token })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEnabled(true)
      setStep("idle")
      setSuccessMsg("2FA ativado com sucesso!")
      await update({ twoFactorVerifiedAt: new Date().toISOString() })
      setTimeout(() => setSuccessMsg(""), 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Token inválido")
    } finally {
      setVerifying(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm("Tem certeza que deseja desativar a autenticação de dois fatores?")) return
    setDisabling(true)
    setError("")
    try {
      const res = await csrfPost("/api/auth/2fa/disable", {})
      if (!res.ok) throw new Error("Erro ao desativar")
      setEnabled(false)
      setSuccessMsg("2FA desativado com sucesso!")
      setTimeout(() => setSuccessMsg(""), 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao desativar")
    } finally {
      setDisabling(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            {enabled ? <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <ShieldOff className="w-5 h-5 text-zinc-400" />}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Autenticação de Dois Fatores
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {enabled ? "2FA está ativo" : "Proteja sua conta com 2FA"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {enabled ? (
          <div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 mb-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                A autenticação de dois fatores está ativa na sua conta.
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-1">
                Ao fazer login, será solicitado um código do seu aplicativo autenticador.
              </p>
            </div>
            <button
              onClick={handleDisable}
              disabled={disabling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {disabling ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
              {disabling ? "A desativar..." : "Desativar 2FA"}
            </button>
          </div>
        ) : step === "idle" ? (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
              Após configurar, precisará de um código do seu aplicativo autenticador
              (Google Authenticator, Authy, etc.) para fazer login.
            </p>
            <button
              onClick={handleSetup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Smartphone size={16} />
              Configurar 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                1. Configure o seu aplicativo autenticador
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                Escaneie o QR code manualmente usando a chave secreta abaixo:
              </p>

              {/* QR Code */}
              {otpauthUrl && (
                <div className="flex justify-center mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
                    alt="QR Code for 2FA"
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700"
                    width={180}
                    height={180}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg px-3 py-2">
                <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all flex-1">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-indigo-600 transition"
                  title="Copiar chave"
                >
                  {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                2. Verifique o código
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                Introduza o código de 6 dígitos gerado pelo seu aplicativo autenticador.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="flex-1 max-w-[160px] px-3 py-2 rounded-xl text-lg text-center tracking-widest font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying || token.length !== 6}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {verifying ? <Loader2 size={16} className="animate-spin" /> : null}
                  {verifying ? "A verificar..." : "Verificar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
