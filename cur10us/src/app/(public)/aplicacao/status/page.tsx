"use client"
import { Suspense } from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Search, CheckCircle2, Clock, XCircle, UserPlus, FileSearch } from "lucide-react"
import Link from "next/link"
import StatusBadge from "@/components/ui/StatusBadge"

interface ApplicationStatus {
  name: string
  email: string
  role: string
  status: string
  rejectReason?: string | null
  createdAt: string
  updatedAt: string
  school: { name: string }
}

const roleLabels: Record<string, string> = {
  teacher: "Professor(a)",
  student: "Aluno(a)",
  parent: "Encarregado de educação",
}

const statusTimeline = [
  { key: "pendente", label: "Solicitação enviada", icon: Clock },
  { key: "em_analise", label: "Em análise", icon: FileSearch },
  { key: "aprovada", label: "Aprovada", icon: CheckCircle2 },
  { key: "matriculada", label: "Matrícula confirmada", icon: UserPlus },
]

const statusOrder: Record<string, number> = {
  pendente: 0,
  em_analise: 1,
  aprovada: 2,
  matriculada: 3,
  rejeitada: -1,
}

function StatusPageContent() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState(searchParams.get("token") || "")
  const [data, setData] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  async function fetchStatus(t: string) {
    if (!t.trim()) return
    setLoading(true)
    setError("")
    setData(null)
    setSearched(true)
    try {
      const res = await fetch(`/api/applications/status?token=${encodeURIComponent(t)}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Solicitação não encontrada")
        return
      }
      setData(json)
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = searchParams.get("token")
    if (t) { setToken(t); fetchStatus(t) }
  }, [searchParams])  

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchStatus(token)
  }

  const currentStep = data ? statusOrder[data.status] ?? -1 : -1
  const isRejected = data?.status === "rejeitada"

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Acompanhar solicitação</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Insira seu código de acompanhamento abaixo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Código de acompanhamento"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {error && searched && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {data && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{data.name}</h2>
              <p className="text-xs text-zinc-500">{data.email}</p>
            </div>
            <StatusBadge status={data.status} />
          </div>

          <div className="text-sm mb-6 space-y-1">
            <div><span className="text-zinc-500">Escola:</span> <span className="font-medium">{data.school.name}</span></div>
            <div><span className="text-zinc-500">Perfil:</span> <span className="font-medium">{roleLabels[data.role] || data.role}</span></div>
            <div><span className="text-zinc-500">Enviada em:</span> <span className="font-medium">{new Date(data.createdAt).toLocaleDateString("pt")}</span></div>
          </div>

          {isRejected ? (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-1">
                <XCircle className="w-4 h-4" /> Solicitação não aprovada
              </div>
              {data.rejectReason && <p className="text-red-600 dark:text-red-400">{data.rejectReason}</p>}
            </div>
          ) : (
            <div className="space-y-0">
              {statusTimeline.map((step, i) => {
                const stepIndex = statusOrder[step.key]
                const isCompleted = currentStep >= stepIndex
                const isCurrent = currentStep === stepIndex
                const Icon = step.icon

                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        } ${isCurrent ? "ring-2 ring-indigo-300 dark:ring-indigo-700" : ""}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {i < statusTimeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${isCompleted && currentStep > stepIndex ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                      )}
                    </div>
                    <div className="pt-1 pb-4">
                      <p className={`text-sm font-medium ${isCompleted ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {data.status === "matriculada" && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm">
              <p className="text-emerald-700 dark:text-emerald-400">
                Sua matrícula foi confirmada! Acesse a plataforma com o e-mail <strong>{data.email}</strong>.
              </p>
              <Link href="/signin" className="inline-block mt-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Acessar plataforma
              </Link>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
        Ainda não enviou sua solicitação?{" "}
        <Link href="/aplicacao" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Solicitar matrícula
        </Link>
      </p>
    </div>
  )
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
      <StatusPageContent />
    </Suspense>
  )
}
