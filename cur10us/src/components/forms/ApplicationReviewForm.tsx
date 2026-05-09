"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, XCircle, UserPlus } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"

interface Application {
  id: string
  name: string
  email: string
  phone: string
  role: string
  message?: string | null
  status: string
  rejectReason?: string | null
  documentType?: string | null
  documentNumber?: string | null
  dateOfBirth?: string | null
  desiredGrade?: number | null
  desiredCourseId?: string | null
  createdAt: string
}

interface ClassOption {
  id: string
  name: string
  grade: number
  course?: { id: string; name: string } | null
}

const roleLabels: Record<string, string> = {
  teacher: "Professor(a)",
  student: "Aluno(a)",
  parent: "Encarregado de educação",
}

interface Props {
  application: Application
  onClose: () => void
  onRefresh: () => void
}

export default function ApplicationReviewForm({ application, onClose, onRefresh }: Props) {
  const [loading, setLoading] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [showReject, setShowReject] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState("")

  const isApproved = application.status === "aprovada"

  // Fetch classes when the application is approved (for enrollment)
  useEffect(() => {
    if (isApproved) {
      setLoadingClasses(true)
      fetch("/api/classes?limit=100")
        .then((r) => r.json())
        .then((res) => setClasses(res.data || []))
        .catch(() => setClasses([]))
        .finally(() => setLoadingClasses(false))
    }
  }, [isApproved])

  async function handleAction(action: "approve" | "reject" | "enroll") {
    setLoading(action)
    try {
      const url = `/api/applications/${application.id}/${action}`
      let body: Record<string, unknown> | undefined
      if (action === "reject") {
        body = { reason: rejectReason }
      } else if (action === "enroll" && selectedClassId) {
        body = { classId: selectedClassId }
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Erro ao processar ação")
        return
      }
      onRefresh()
      onClose()
    } catch {
      alert("Erro de conexão")
    } finally {
      setLoading("")
    }
  }

  const isPending = application.status === "pendente" || application.status === "em_analise"
  const isStudent = application.role === "student"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Revisão da solicitação</h2>
          <StatusBadge status={application.status} />
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-zinc-500">Nome:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{application.name}</span>
          </div>
          <div>
            <span className="text-zinc-500">E-mail:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{application.email}</span>
          </div>
          <div>
            <span className="text-zinc-500">Telefone:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{application.phone}</span>
          </div>
          <div>
            <span className="text-zinc-500">Perfil:</span>{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{roleLabels[application.role] || application.role}</span>
          </div>
          {isStudent && (application.documentType || application.documentNumber || application.dateOfBirth || application.desiredGrade || application.desiredCourseId) && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs uppercase tracking-wide">Dados do aluno</span>
              {(application.documentType || application.documentNumber) && (
                <div>
                  <span className="text-zinc-500">Documento:</span>{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {application.documentType}{application.documentNumber ? ` - ${application.documentNumber}` : ""}
                  </span>
                </div>
              )}
              {application.dateOfBirth && (
                <div>
                  <span className="text-zinc-500">Data de nascimento:</span>{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {new Date(application.dateOfBirth).toLocaleDateString("pt")}
                  </span>
                </div>
              )}
              {application.desiredGrade && (
                <div>
                  <span className="text-zinc-500">Classe pretendida:</span>{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{application.desiredGrade}.a classe</span>
                </div>
              )}
              {application.desiredCourseId && (
                <div>
                  <span className="text-zinc-500">Curso pretendido:</span>{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 font-mono text-xs">{application.desiredCourseId}</span>
                </div>
              )}
            </div>
          )}
          {application.message && (
            <div>
              <span className="text-zinc-500">Mensagem:</span>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{application.message}</p>
            </div>
          )}
          {application.rejectReason && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <span className="text-red-600 dark:text-red-400 font-medium">Motivo da rejeição:</span>
              <p className="text-red-600 dark:text-red-400 mt-1">{application.rejectReason}</p>
            </div>
          )}
          <div className="text-zinc-400 text-xs">
            Enviada em {new Date(application.createdAt).toLocaleDateString("pt")}
          </div>
        </div>

        {isApproved && (
          <div className="mt-4">
            <label htmlFor="classSelect" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Turma para matrícula
            </label>
            {loadingClasses ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando turmas...
              </div>
            ) : classes.length > 0 ? (
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
              >
                <option value="">Selecione a turma (opcional)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade}.a classe){c.course ? ` - ${c.course.name}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-zinc-400 py-2">Nenhuma turma disponível</p>
            )}
          </div>
        )}

        {showReject && isPending && (
          <div className="mt-4">
            <textarea
              placeholder="Motivo da rejeição (mín. 5 caracteres)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          {isPending && !showReject && (
            <>
              <button
                onClick={() => handleAction("approve")}
                disabled={!!loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Aprovar
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={!!loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
            </>
          )}

          {isPending && showReject && (
            <>
              <button
                onClick={() => handleAction("reject")}
                disabled={!!loading || rejectReason.length < 5}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirmar rejeição
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Voltar
              </button>
            </>
          )}

          {isApproved && (
            <button
              onClick={() => handleAction("enroll")}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading === "enroll" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Matricular
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
