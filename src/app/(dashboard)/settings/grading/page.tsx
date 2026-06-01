"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import { Settings2, Plus, Pencil, Trash2, Loader2, Info } from "lucide-react"

/* ───── types ───── */

type GradingConfig = {
  id: string
  classGrade: number | null
  courseId: string | null
  course: { id: string; name: string } | null
  academicYearId: string | null
  academicYear: { id: string; name: string } | null
  trimesterWeights: number[] | null
  passingGrade: number
  resourceMinGrade: number | null
  maxFailedSubjects: number
  trimesterFormula: Record<string, number> | null
  finalFormula: Record<string, number> | null
  directFailGrade: number | null
  roundingMode: "truncar" | "arredondar" | "teto"
  roundingScale: number
  recursoAllowed: boolean
  globalGradingConfig: object | null
}

type GlobalGradingConfig = {
  id: string
  passingGrade: number
  maxFailedSubjects: number
  roundingMode: string
  recursoAllowed: boolean
  [key: string]: unknown
}

type AcademicYear = { id: string; name: string }
type Course = { id: string; name: string }

type FormData = {
  academicYearId: string
  classGrade: string
  courseId: string
  passingGrade: string
  resourceMinGrade: string
  maxFailedSubjects: string
  roundingMode: string
  recursoAllowed: boolean
  tw1: string
  tw2: string
  tw3: string
}

const emptyForm: FormData = {
  academicYearId: "",
  classGrade: "",
  courseId: "",
  passingGrade: "10",
  resourceMinGrade: "",
  maxFailedSubjects: "2",
  roundingMode: "arredondar",
  recursoAllowed: false,
  tw1: "0.33",
  tw2: "0.33",
  tw3: "0.34",
}

const roundingLabels: Record<string, string> = {
  truncar: "Truncar",
  arredondar: "Arredondar",
  teto: "Teto",
}

const inputClass =
  "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"

const selectClass =
  "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"

/* ───── page ───── */

export default function GradingConfigPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  const [configs, setConfigs] = useState<GradingConfig[]>([])
  const [globalConfigs, setGlobalConfigs] = useState<GlobalGradingConfig[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<GradingConfig | null>(null)
  const [deleteItem, setDeleteItem] = useState<GradingConfig | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [error, setError] = useState("")

  /* ── fetch ── */

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/grading-config")
      const json = await res.json()
      setConfigs(json.data ?? [])
      setGlobalConfigs(json.globalConfigs ?? [])
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([
        fetchConfigs(),
        fetch("/api/academic-years")
          .then((r) => r.json())
          .then((d) => setAcademicYears(d.data ?? []))
          .catch(() => {}),
        fetch("/api/courses")
          .then((r) => r.json())
          .then((d) => setCourses(d.data ?? []))
          .catch(() => {}),
      ])
      setLoading(false)
    }
    load()
  }, [])

  /* ── helpers ── */

  const configToForm = (c: GradingConfig): FormData => ({
    academicYearId: c.academicYearId ?? "",
    classGrade: c.classGrade != null ? String(c.classGrade) : "",
    courseId: c.courseId ?? "",
    passingGrade: String(c.passingGrade),
    resourceMinGrade: c.resourceMinGrade != null ? String(c.resourceMinGrade) : "",
    maxFailedSubjects: String(c.maxFailedSubjects),
    roundingMode: c.roundingMode,
    recursoAllowed: c.recursoAllowed,
    tw1: c.trimesterWeights?.[0] != null ? String(c.trimesterWeights[0]) : "0.33",
    tw2: c.trimesterWeights?.[1] != null ? String(c.trimesterWeights[1]) : "0.33",
    tw3: c.trimesterWeights?.[2] != null ? String(c.trimesterWeights[2]) : "0.34",
  })

  const formToBody = (f: FormData) => ({
    academicYearId: f.academicYearId || null,
    classGrade: f.classGrade ? Number(f.classGrade) : null,
    courseId: f.courseId || null,
    passingGrade: Number(f.passingGrade),
    resourceMinGrade: f.resourceMinGrade ? Number(f.resourceMinGrade) : null,
    maxFailedSubjects: Number(f.maxFailedSubjects),
    roundingMode: f.roundingMode,
    recursoAllowed: f.recursoAllowed,
    trimesterWeights: [Number(f.tw1), Number(f.tw2), Number(f.tw3)],
  })

  const openCreate = () => {
    setForm(emptyForm)
    setError("")
    setCreateOpen(true)
  }

  const openEdit = (c: GradingConfig) => {
    setForm(configToForm(c))
    setError("")
    setEditItem(c)
  }

  const handleSave = async () => {
    setError("")
    setSaving(true)
    try {
      const body = formToBody(form)
      const isEdit = !!editItem
      const url = isEdit ? `/api/grading-config/${editItem.id}` : "/api/grading-config"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || "Erro ao guardar configuracao")
        setSaving(false)
        return
      }

      setCreateOpen(false)
      setEditItem(null)
      await fetchConfigs()
    } catch {
      setError("Erro de rede")
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/grading-config/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      await fetchConfigs()
    }
  }

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const twSum = Number(form.tw1) + Number(form.tw2) + Number(form.tw3)

  /* ── loading state ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  /* ── render ── */

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4 max-w-5xl">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Configuracao de Avaliacao
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Regras de aprovacao, arredondamento e pesos por trimestre
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Configuracao</span>
          </button>
        )}
      </div>

      {/* Global configs (read-only) */}
      {globalConfigs.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Configuracao Global (referencia)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalConfigs.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40"
              >
                <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  <Row label="Nota de Aprovacao" value={String(g.passingGrade)} />
                  <Row label="Max. Reprovacoes" value={String(g.maxFailedSubjects)} />
                  <Row label="Arredondamento" value={roundingLabels[g.roundingMode] ?? g.roundingMode} />
                  <Row label="Recurso" value={g.recursoAllowed ? "Sim" : "Nao"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config cards */}
      {configs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-8 shadow-sm text-center">
          <Settings2 className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma configuracao especifica encontrada.
          </p>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Criar primeira configuracao
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {configs.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 shadow-sm flex flex-col gap-2"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {c.classGrade != null ? `Classe ${c.classGrade}` : "Todas as classes"}
                  </span>
                  {c.course && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {c.course.name}
                    </p>
                  )}
                  {c.academicYear && (
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {c.academicYear.name}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteItem(c)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="mt-1 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                <Row label="Nota de Aprovacao" value={String(c.passingGrade)} />
                <Row label="Max. Reprovacoes" value={String(c.maxFailedSubjects)} />
                <Row label="Arredondamento" value={roundingLabels[c.roundingMode] ?? c.roundingMode} />
                <Row label="Recurso" value={c.recursoAllowed ? "Sim" : "Nao"} />
                {c.resourceMinGrade != null && (
                  <Row label="Nota Min. Recurso" value={String(c.resourceMinGrade)} />
                )}
                {c.trimesterWeights && c.trimesterWeights.length === 3 && (
                  <Row
                    label="Pesos Trim."
                    value={c.trimesterWeights.map((w) => w.toFixed(2)).join(" / ")}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Configuracao de Avaliacao">
        <ConfigForm
          form={form}
          updateField={updateField}
          academicYears={academicYears}
          courses={courses}
          twSum={twSum}
          error={error}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setCreateOpen(false)}
        />
      </FormModal>

      {/* ── Edit Modal ── */}
      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Configuracao de Avaliacao">
        <ConfigForm
          form={form}
          updateField={updateField}
          academicYears={academicYears}
          courses={courses}
          twSum={twSum}
          error={error}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setEditItem(null)}
        />
      </FormModal>

      {/* ── Delete Modal ── */}
      <DeleteConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={
          deleteItem
            ? `Configuracao ${deleteItem.classGrade != null ? `Classe ${deleteItem.classGrade}` : "geral"}${deleteItem.course ? ` - ${deleteItem.course.name}` : ""}`
            : ""
        }
      />
    </div>
  )
}

/* ───── shared row component ───── */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  )
}

/* ───── config form ───── */

type ConfigFormProps = {
  form: FormData
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  academicYears: AcademicYear[]
  courses: Course[]
  twSum: number
  error: string
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

function ConfigForm({
  form,
  updateField,
  academicYears,
  courses,
  twSum,
  error,
  saving,
  onSave,
  onCancel,
}: ConfigFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Ano Letivo */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Ano Letivo
        </label>
        <select
          className={selectClass}
          value={form.academicYearId}
          onChange={(e) => updateField("academicYearId", e.target.value)}
        >
          <option value="">-- Selecionar --</option>
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.id}>
              {ay.name}
            </option>
          ))}
        </select>
      </div>

      {/* Classe */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Classe (1-13)
        </label>
        <input
          type="number"
          min={1}
          max={13}
          className={inputClass}
          value={form.classGrade}
          onChange={(e) => updateField("classGrade", e.target.value)}
          placeholder="Ex: 10"
        />
      </div>

      {/* Curso */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Curso <span className="text-zinc-400">(opcional)</span>
        </label>
        <select
          className={selectClass}
          value={form.courseId}
          onChange={(e) => updateField("courseId", e.target.value)}
        >
          <option value="">-- Todos os cursos --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nota de Aprovacao */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Nota de Aprovacao
        </label>
        <input
          type="number"
          min={0}
          max={20}
          className={inputClass}
          value={form.passingGrade}
          onChange={(e) => updateField("passingGrade", e.target.value)}
        />
      </div>

      {/* Nota Min. Recurso */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Nota Minima Recurso <span className="text-zinc-400">(opcional)</span>
        </label>
        <input
          type="number"
          min={0}
          max={20}
          className={inputClass}
          value={form.resourceMinGrade}
          onChange={(e) => updateField("resourceMinGrade", e.target.value)}
          placeholder="Ex: 7"
        />
      </div>

      {/* Max Reprovacoes */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Max. Disciplinas Reprovadas
        </label>
        <input
          type="number"
          min={0}
          max={20}
          className={inputClass}
          value={form.maxFailedSubjects}
          onChange={(e) => updateField("maxFailedSubjects", e.target.value)}
        />
      </div>

      {/* Arredondamento */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Modo de Arredondamento
        </label>
        <select
          className={selectClass}
          value={form.roundingMode}
          onChange={(e) => updateField("roundingMode", e.target.value)}
        >
          <option value="truncar">Truncar</option>
          <option value="arredondar">Arredondar</option>
          <option value="teto">Teto</option>
        </select>
      </div>

      {/* Recurso */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.recursoAllowed}
          onChange={(e) => updateField("recursoAllowed", e.target.checked)}
          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">Recurso permitido</span>
      </label>

      {/* Trimester Weights */}
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
          Pesos dos Trimestres
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-zinc-400 block mb-0.5">1o Trim.</span>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              className={inputClass}
              value={form.tw1}
              onChange={(e) => updateField("tw1", e.target.value)}
            />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block mb-0.5">2o Trim.</span>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              className={inputClass}
              value={form.tw2}
              onChange={(e) => updateField("tw2", e.target.value)}
            />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block mb-0.5">3o Trim.</span>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              className={inputClass}
              value={form.tw3}
              onChange={(e) => updateField("tw3", e.target.value)}
            />
          </div>
        </div>
        <p
          className={`text-[10px] mt-1 ${
            Math.abs(twSum - 1) < 0.02
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          Soma: {twSum.toFixed(2)} {Math.abs(twSum - 1) < 0.02 ? "" : "(deve ser proximo de 1.0)"}
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Guardar
        </button>
      </div>
    </div>
  )
}
