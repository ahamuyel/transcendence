"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Download, Loader2, CheckCircle2, XCircle, AlertTriangle, FileSpreadsheet, ArrowRight, ArrowLeft } from "lucide-react"

type ValidatedRow = {
  rowNumber: number
  data: Record<string, string>
  valid: boolean
  errors: string[]
}

type ValidationResult = {
  filename: string
  totalRows: number
  validCount: number
  invalidCount: number
  rows: ValidatedRow[]
}

type ImportResult = {
  jobId: string
  totalRows: number
  successCount: number
  failedCount: number
  successes: { email: string; password: string; name: string }[]
  failures: { rowNumber: number; email: string; errors: string[] }[]
}

const userTypeLabels: Record<string, string> = {
  student: "Alunos",
  teacher: "Professores",
  parent: "Encarregados de Educação",
}

export default function ImportPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1) // 1=config, 2=upload, 3=preview, 4=result
  const [userType, setUserType] = useState("student")
  const [file, setFile] = useState<File | null>(null)
  const [validating, setValidating] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState("")

  function handleDownloadTemplate() {
    window.open(`/api/import/template?type=${userType}`, "_blank")
  }

  async function handleValidate() {
    if (!file) return
    setValidating(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userType", userType)
      const res = await fetch("/api/import/validate", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao validar ficheiro")
        return
      }
      setValidation(data)
      setStep(3)
    } catch {
      setError("Erro de conexão")
    } finally {
      setValidating(false)
    }
  }

  async function handleExecute() {
    if (!file) return
    setExecuting(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userType", userType)
      const res = await fetch("/api/import/execute", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao importar")
        return
      }
      setResult(data)
      setStep(4)
    } catch {
      setError("Erro de conexão")
    } finally {
      setExecuting(false)
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Importar Utilizadores</h1>
          <p className="text-xs sm:text-sm text-zinc-500">Importe alunos, professores ou encarregados em massa</p>
        </div>
        <button
          onClick={() => router.push("/import/history")}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Ver histórico
        </button>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= s ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${step > s ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Config */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Tipo de utilizador</label>
            <select className={inputClass} value={userType} onChange={(e) => setUserType(e.target.value)}>
              <option value="student">Alunos</option>
              <option value="teacher">Professores</option>
              <option value="parent">Encarregados de Educação</option>
            </select>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            <Download size={14} />
            Descarregar template para {userTypeLabels[userType].toLowerCase()}
          </button>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
            >
              Seguinte <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Carregue o ficheiro Excel (.xlsx) ou CSV com os dados dos {userTypeLabels[userType].toLowerCase()}.
            Máximo 500 linhas.
          </p>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={32} className="text-emerald-500" />
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-zinc-400" />
                <p className="text-sm text-zinc-500">Clique para selecionar ou arraste o ficheiro aqui</p>
                <p className="text-xs text-zinc-400">.xlsx, .xls ou .csv</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setStep(1); setFile(null); setValidation(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              <ArrowLeft size={14} /> Voltar
            </button>
            <button
              onClick={handleValidate}
              disabled={!file || validating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {validating ? <Loader2 size={14} className="animate-spin" /> : null}
              {validating ? "Validando..." : "Validar ficheiro"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && validation && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
              <div className="text-xl font-bold">{validation.totalRows}</div>
              <div className="text-xs text-zinc-500">Total</div>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
              <div className="text-xl font-bold text-emerald-600">{validation.validCount}</div>
              <div className="text-xs text-zinc-500">Válidos</div>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-center">
              <div className="text-xl font-bold text-rose-600">{validation.invalidCount}</div>
              <div className="text-xs text-zinc-500">Com erros</div>
            </div>
          </div>

          {validation.invalidCount > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                <AlertTriangle size={12} /> Linhas com erros (não serão importadas):
              </p>
              {validation.rows.filter((r) => !r.valid).map((r) => (
                <div key={r.rowNumber} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-xs">
                  <span className="font-medium">Linha {r.rowNumber}:</span>{" "}
                  <span className="text-rose-600 dark:text-rose-400">{r.errors.join(", ")}</span>
                </div>
              ))}
            </div>
          )}

          {validation.validCount === 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-sm text-rose-600">
              Nenhum registo válido para importar. Corrija os erros e tente novamente.
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setStep(2); setValidation(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              <ArrowLeft size={14} /> Voltar
            </button>
            <button
              onClick={handleExecute}
              disabled={executing || validation.validCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {executing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {executing ? "Importando..." : `Importar ${validation.validCount} registos`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            {result.failedCount === 0 ? (
              <CheckCircle2 size={32} className="text-emerald-500" />
            ) : result.successCount === 0 ? (
              <XCircle size={32} className="text-rose-500" />
            ) : (
              <AlertTriangle size={32} className="text-amber-500" />
            )}
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {result.failedCount === 0 ? "Importação concluída!" :
                 result.successCount === 0 ? "Importação falhada" :
                 "Importação parcial"}
              </h2>
              <p className="text-sm text-zinc-500">
                {result.successCount} importados, {result.failedCount} falharam
              </p>
            </div>
          </div>

          {result.successes.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-zinc-500">Utilizadores criados (com palavras-passe temporárias):</p>
              {result.successes.map((s) => (
                <div key={s.email} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                  <span>{s.name} ({s.email})</span>
                  <code className="px-2 py-0.5 bg-white dark:bg-zinc-900 rounded text-[10px]">{s.password}</code>
                </div>
              ))}
            </div>
          )}

          {result.failures.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <p className="text-xs font-medium text-zinc-500">Falhas:</p>
              {result.failures.map((f, i) => (
                <div key={i} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-xs">
                  Linha {f.rowNumber} ({f.email}): {f.errors.join(", ")}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <a
              href={`/api/import/${result.jobId}/export`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
            >
              <Download size={14} />
              Exportar relatório
            </a>
            <button
              onClick={() => { setStep(1); setFile(null); setValidation(null); setResult(null); setError("") }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
            >
              Nova importação
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
