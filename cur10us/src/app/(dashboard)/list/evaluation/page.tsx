"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Table from "@/components/ui/Table"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"
import { Calculator, CheckCircle2, XCircle, AlertTriangle, Loader2, BarChart3 } from "lucide-react"

type SubjectResult = {
  subjectName: string
  t1: number | null
  t2: number | null
  t3: number | null
  finalAverage: number | null
}

type Evaluation = {
  studentId: string
  studentName: string
  enrollmentId: string
  grade: number
  generalAverage: number | null
  status: "aprovada" | "reprovada" | "em_recurso"
  failedSubjectCount: number
  observation: string | null
  subjectResults: SubjectResult[]
}

type AcademicYear = {
  id: string
  name: string
  status: string
}

type ClassItem = {
  id: string
  name: string
}

type Summary = {
  total: number
  aprovados: number
  reprovados: number
  emRecurso: number
  classAverage: number | null
}

const statusBadge = (status: string) => {
  switch (status) {
    case "aprovada":
      return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
    case "reprovada":
      return "bg-rose-100 dark:bg-rose-950/40 text-rose-600"
    case "em_recurso":
      return "bg-amber-100 dark:bg-amber-950/40 text-amber-600"
    default:
      return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case "aprovada": return "Aprovada"
    case "reprovada": return "Reprovada"
    case "em_recurso": return "Em Recurso"
    default: return status
  }
}

const columns = [
  { header: "Aluno", accessor: "studentName" },
  { header: "Media Geral", accessor: "generalAverage" },
  { header: "Disc. Reprovadas", accessor: "failedSubjectCount", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
  { header: "Observacao", accessor: "observation", className: "hidden lg:table-cell" },
]

const EvaluationPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  // Step state
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedClass, setSelectedClass] = useState("")

  // Data state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  // UI state
  const [loadingYears, setLoadingYears] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingEval, setLoadingEval] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [error, setError] = useState("")
  const [yearsLoaded, setYearsLoaded] = useState(false)

  // Fetch academic years on first interaction
  const loadAcademicYears = async () => {
    if (yearsLoaded) return
    setLoadingYears(true)
    setError("")
    try {
      const res = await fetch("/api/academic-years")
      if (!res.ok) throw new Error("Erro ao carregar anos letivos")
      const json = await res.json()
      const filtered = (json.data as AcademicYear[]).filter(
        (y) => y.status === "em_encerramento" || y.status === "encerrado"
      )
      setAcademicYears(filtered)
      setYearsLoaded(true)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar anos letivos")
    } finally {
      setLoadingYears(false)
    }
  }

  // Fetch classes for selected academic year
  const loadClasses = async (yearId: string) => {
    setLoadingClasses(true)
    setError("")
    setClasses([])
    setSelectedClass("")
    setEvaluations([])
    setSummary(null)
    setFinalized(false)
    try {
      const url = yearId
        ? `/api/classes?academicYearId=${yearId}&limit=200`
        : "/api/classes?limit=200"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Erro ao carregar turmas")
      const json = await res.json()
      setClasses(json.data as ClassItem[])
    } catch (e: any) {
      setError(e.message || "Erro ao carregar turmas")
    } finally {
      setLoadingClasses(false)
    }
  }

  // Calculate evaluations (preview)
  const handleCalculate = async () => {
    if (!selectedClass || !selectedYear) return
    setLoadingEval(true)
    setError("")
    setEvaluations([])
    setSummary(null)
    setFinalized(false)
    try {
      const res = await fetch(
        `/api/evaluation/class?classId=${selectedClass}&academicYearId=${selectedYear}`
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao calcular avaliacoes")
      }
      const json = await res.json()
      setEvaluations(json.evaluations ?? [])
      setSummary(json.summary ?? null)
    } catch (e: any) {
      setError(e.message || "Erro ao calcular avaliacoes")
    } finally {
      setLoadingEval(false)
    }
  }

  // Finalize evaluations
  const handleFinalize = async () => {
    const res = await fetch("/api/evaluation/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass, academicYearId: selectedYear }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Erro ao finalizar avaliacoes")
    }
    setFinalized(true)
    setConfirmOpen(false)
  }

  const handleYearChange = (yearId: string) => {
    setSelectedYear(yearId)
    setSelectedClass("")
    setEvaluations([])
    setSummary(null)
    setFinalized(false)
    if (yearId) loadClasses(yearId)
  }

  const renderRow = (item: Evaluation) => (
    <tr
      key={item.enrollmentId}
      className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
    >
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
        {item.studentName}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.generalAverage !== null ? item.generalAverage.toFixed(1) : "—"}
      </td>
      <td className="hidden md:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
        {item.failedSubjectCount}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <span
          className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${statusBadge(item.status)}`}
        >
          {statusLabel(item.status)}
        </span>
      </td>
      <td className="hidden lg:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2 text-zinc-500 dark:text-zinc-400 text-xs">
        {item.observation || "—"}
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Finalizacao de Avaliacoes
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            Calcular e finalizar resultados por turma
          </p>
        </div>
      </div>

      {/* Step 1 & 2: Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Academic Year */}
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            Ano Letivo
          </label>
          <select
            value={selectedYear}
            onFocus={loadAcademicYears}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">
              {loadingYears ? "Carregando..." : "Selecionar ano letivo"}
            </option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} ({y.status === "em_encerramento" ? "Em Encerramento" : "Encerrado"})
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            Turma
          </label>
          <select
            value={selectedClass}
            disabled={!selectedYear || loadingClasses}
            onChange={(e) => {
              setSelectedClass(e.target.value)
              setEvaluations([])
              setSummary(null)
              setFinalized(false)
            }}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
          >
            <option value="">
              {loadingClasses ? "Carregando..." : "Selecionar turma"}
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          disabled={!selectedYear || !selectedClass || loadingEval}
          className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingEval ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Calculator size={16} />
          )}
          Calcular Avaliacoes
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-600">
          <XCircle size={16} />
          {error}
        </div>
      )}

      {/* Success after finalization */}
      {finalized && summary && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Avaliacoes finalizadas com sucesso!</p>
            <p className="mt-1 text-xs">
              Total: {summary.total} | Aprovados: {summary.aprovados} | Reprovados: {summary.reprovados} | Em Recurso: {summary.emRecurso} | Media da Turma: {summary.classAverage !== null ? summary.classAverage.toFixed(1) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {summary && !loadingEval && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} /> Aprovados
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{summary.aprovados}</p>
          </div>
          <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-rose-600 font-semibold uppercase tracking-wider flex items-center gap-1">
              <XCircle size={12} /> Reprovados
            </p>
            <p className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">{summary.reprovados}</p>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-amber-600 font-semibold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle size={12} /> Em Recurso
            </p>
            <p className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{summary.emRecurso}</p>
          </div>
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-indigo-600 font-semibold uppercase tracking-wider flex items-center gap-1">
              <BarChart3 size={12} /> Media da Turma
            </p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">{summary.classAverage !== null ? summary.classAverage.toFixed(1) : "—"}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loadingEval ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : evaluations.length > 0 ? (
          <Table columns={columns} renderRow={renderRow} data={evaluations} />
        ) : summary === null && !error ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            Selecione um ano letivo e uma turma, depois clique em &quot;Calcular Avaliacoes&quot;
          </div>
        ) : null}
      </div>

      {/* Finalize button */}
      {evaluations.length > 0 && !finalized && isAdmin && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition"
          >
            <CheckCircle2 size={16} />
            Finalizar Avaliacoes
          </button>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmActionModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalize}
        title="Finalizar Avaliacoes"
        message={`Tem a certeza que deseja finalizar as avaliacoes desta turma? Esta accao ira gravar os resultados de ${summary?.total ?? 0} alunos. Esta accao nao pode ser desfeita.`}
        confirmLabel="Finalizar"
        confirmColor="red"
      />
    </div>
  )
}

export default EvaluationPage
