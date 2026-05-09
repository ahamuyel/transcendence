"use client"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Table from "@/components/ui/Table"
import FormModal from "@/components/ui/FormModal"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"
import { Scale, CheckCircle2, XCircle, Loader2, Plus, Trash2 } from "lucide-react"

type AcademicYear = {
  id: string
  name: string
  status: string
}

type RecursoEnrollment = {
  id: string
  studentId: string
  classId: string
  academicYearId: string
  status: "em_recurso"
  finalAverage: number | null
  failedSubjects: number | null
  observation: string | null
  student: { id: string; name: string }
  class: { id: string; name: string; grade: number }
}

type Subject = {
  id: string
  name: string
}

type SubjectScore = {
  subjectId: string
  score: number | ""
}

const columns = [
  { header: "Aluno", accessor: "student" },
  { header: "Turma", accessor: "class" },
  { header: "Classe", accessor: "grade" },
  { header: "Média Final", accessor: "finalAverage" },
  { header: "Disc. Reprovadas", accessor: "failedSubjects", className: "hidden md:table-cell" },
  { header: "Observação", accessor: "observation", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const RecursoListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState("")
  const [enrollments, setEnrollments] = useState<RecursoEnrollment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingYears, setLoadingYears] = useState(true)
  const [successMsg, setSuccessMsg] = useState("")

  // Modal states
  const [resolveItem, setResolveItem] = useState<RecursoEnrollment | null>(null)
  const [quickApprove, setQuickApprove] = useState<RecursoEnrollment | null>(null)
  const [quickReject, setQuickReject] = useState<RecursoEnrollment | null>(null)

  // Form states
  const [decision, setDecision] = useState<"aprovada" | "reprovada">("aprovada")
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Fetch academic years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch("/api/academic-years")
        if (res.ok) {
          const json = await res.json()
          setAcademicYears(json.data || [])
        }
      } finally {
        setLoadingYears(false)
      }
    }
    fetchYears()
  }, [])

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/subjects?limit=200")
        if (res.ok) {
          const json = await res.json()
          setSubjects(json.data || [])
        }
      } catch {
        /* ignore */
      }
    }
    fetchSubjects()
  }, [])

  // Fetch recurso enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!selectedYearId) {
      setEnrollments([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/academic-years/${selectedYearId}/recurso`)
      if (res.ok) {
        const json = await res.json()
        setEnrollments(json.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [selectedYearId])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  // Clear success message after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 4000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  const handleResolve = async () => {
    if (!resolveItem || !selectedYearId) return
    setSubmitting(true)
    try {
      const scores = subjectScores
        .filter((s) => s.subjectId && s.score !== "")
        .map((s) => ({ subjectId: s.subjectId, score: Number(s.score) }))

      const res = await fetch(`/api/academic-years/${selectedYearId}/recurso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: resolveItem.id,
          decision,
          ...(scores.length > 0 ? { subjectScores: scores } : {}),
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setSuccessMsg(json.message || "Recurso resolvido com sucesso.")
        setResolveItem(null)
        setDecision("aprovada")
        setSubjectScores([])
        fetchEnrollments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAction = async (enrollment: RecursoEnrollment, actionDecision: "aprovada" | "reprovada") => {
    const res = await fetch(`/api/academic-years/${selectedYearId}/recurso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollmentId: enrollment.id,
        decision: actionDecision,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      setSuccessMsg(json.message || "Recurso resolvido com sucesso.")
      setQuickApprove(null)
      setQuickReject(null)
      fetchEnrollments()
    }
  }

  const addScoreRow = () => {
    setSubjectScores((prev) => [...prev, { subjectId: "", score: "" }])
  }

  const removeScoreRow = (index: number) => {
    setSubjectScores((prev) => prev.filter((_, i) => i !== index))
  }

  const updateScoreRow = (index: number, field: "subjectId" | "score", value: string) => {
    setSubjectScores((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: field === "score" ? (value === "" ? "" : Number(value)) : value }
          : row
      )
    )
  }

  const renderRow = (item: RecursoEnrollment) => (
    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">{item.student?.name}</span>
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.class?.name}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.class?.grade}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
          {item.finalAverage != null ? item.finalAverage.toFixed(1) : "—"}
        </span>
      </td>
      <td className="hidden md:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-500 text-xs">
        {item.failedSubjects != null ? item.failedSubjects : "—"}
      </td>
      <td className="hidden lg:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-500 text-xs max-w-[200px] truncate">
        {item.observation || "—"}
      </td>
      <td className="px-1.5 sm:px-2">
        {isAdmin && (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => {
                setResolveItem(item)
                setDecision("aprovada")
                setSubjectScores([])
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
              title="Resolver Recurso"
            >
              <Scale size={13} />
            </button>
            <button
              onClick={() => setQuickApprove(item)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
              title="Aprovar"
            >
              <CheckCircle2 size={13} />
            </button>
            <button
              onClick={() => setQuickReject(item)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all active:scale-90"
              title="Reprovar"
            >
              <XCircle size={13} />
            </button>
          </div>
        )}
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale size={22} className="text-amber-500" />
            Recursos
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            Gestão de recursos e decisões de alunos em recurso
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {loadingYears ? (
            <Loader2 size={18} className="animate-spin text-zinc-400" />
          ) : (
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
            >
              <option value="">Selecionar Ano Letivo</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} {ay.status === "encerrado" ? "(Encerrado)" : ay.status === "em_encerramento" ? "(Em Encerramento)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Status badge */}
      {selectedYearId && !loading && (
        <div className="mb-4 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
            {enrollments.length} aluno{enrollments.length !== 1 ? "s" : ""} em recurso
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {!selectedYearId ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            Selecione um ano letivo para ver os alunos em recurso
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            Nenhum aluno em recurso neste ano letivo
          </div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={enrollments} />
        )}
      </div>

      {/* Resolve Recurso Modal */}
      <FormModal
        open={!!resolveItem}
        onClose={() => {
          setResolveItem(null)
          setSubjectScores([])
        }}
        title="Resolver Recurso"
      >
        {resolveItem && (
          <div className="space-y-5">
            {/* Student info */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{resolveItem.student?.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {resolveItem.class?.name} - Classe {resolveItem.class?.grade}
                {resolveItem.finalAverage != null && ` - Média: ${resolveItem.finalAverage.toFixed(1)}`}
              </p>
            </div>

            {/* Decision */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Decisão
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="aprovada"
                    checked={decision === "aprovada"}
                    onChange={() => setDecision("aprovada")}
                    className="w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Aprovar
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="reprovada"
                    checked={decision === "reprovada"}
                    onChange={() => setDecision("reprovada")}
                    className="w-4 h-4 text-rose-600 border-zinc-300 focus:ring-rose-500"
                  />
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <XCircle size={14} />
                    Reprovar
                  </span>
                </label>
              </div>
            </div>

            {/* Recurso exam scores (optional) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Notas de Exame de Recurso <span className="font-normal text-zinc-400">(opcional)</span>
                </label>
                <button
                  type="button"
                  onClick={addScoreRow}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                >
                  <Plus size={12} />
                  Adicionar
                </button>
              </div>
              {subjectScores.length === 0 && (
                <p className="text-xs text-zinc-400">Nenhuma nota de recurso adicionada.</p>
              )}
              <div className="space-y-2">
                {subjectScores.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={row.subjectId}
                      onChange={(e) => updateScoreRow(index, "subjectId", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="">Disciplina</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={row.score}
                      onChange={(e) => updateScoreRow(index, "score", e.target.value)}
                      placeholder="Nota"
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeScoreRow(index)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setResolveItem(null)
                  setSubjectScores([])
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolve}
                disabled={submitting}
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 shadow-lg flex items-center gap-1.5 ${
                  decision === "aprovada"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                }`}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : decision === "aprovada" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                {submitting ? "Processando..." : decision === "aprovada" ? "Aprovar Recurso" : "Reprovar Recurso"}
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Quick Approve Modal */}
      <ConfirmActionModal
        open={!!quickApprove}
        onClose={() => setQuickApprove(null)}
        onConfirm={() => handleQuickAction(quickApprove!, "aprovada")}
        title="Aprovar Recurso"
        message={`Tem a certeza que deseja aprovar o recurso de ${quickApprove?.student?.name}? O aluno será marcado como aprovado.`}
        confirmLabel="Aprovar"
        confirmColor="emerald"
      />

      {/* Quick Reject Modal */}
      <ConfirmActionModal
        open={!!quickReject}
        onClose={() => setQuickReject(null)}
        onConfirm={() => handleQuickAction(quickReject!, "reprovada")}
        title="Reprovar Recurso"
        message={`Tem a certeza que deseja reprovar o recurso de ${quickReject?.student?.name}? O aluno será marcado como reprovado.`}
        confirmLabel="Reprovar"
        confirmColor="red"
      />
    </div>
  )
}

export default RecursoListPage
