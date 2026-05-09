"use client"

import { useEffect, useState, useCallback } from "react"
import { Settings2, Plus, Pencil, Trash2, Loader2, Info, Shield } from "lucide-react"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"

type GlobalGradingConfig = {
  id: string
  classGrade: number | null
  courseId: string | null
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
  active: boolean
  _count?: { schoolConfigs: number }
}

type FormState = {
  classGrade: string
  passingGrade: string
  resourceMinGrade: string
  maxFailedSubjects: string
  directFailGrade: string
  roundingMode: "truncar" | "arredondar" | "teto"
  roundingScale: string
  recursoAllowed: boolean
  trimesterWeight1: string
  trimesterWeight2: string
  trimesterWeight3: string
  active: boolean
}

const emptyForm: FormState = {
  classGrade: "",
  passingGrade: "10",
  resourceMinGrade: "",
  maxFailedSubjects: "2",
  directFailGrade: "",
  roundingMode: "arredondar",
  roundingScale: "1",
  recursoAllowed: true,
  trimesterWeight1: "",
  trimesterWeight2: "",
  trimesterWeight3: "",
  active: true,
}

const roundingLabels: Record<string, string> = {
  truncar: "Truncar",
  arredondar: "Arredondar",
  teto: "Arredondar p/ cima",
}

function configToForm(c: GlobalGradingConfig): FormState {
  return {
    classGrade: c.classGrade != null ? String(c.classGrade) : "",
    passingGrade: String(c.passingGrade),
    resourceMinGrade: c.resourceMinGrade != null ? String(c.resourceMinGrade) : "",
    maxFailedSubjects: String(c.maxFailedSubjects),
    directFailGrade: c.directFailGrade != null ? String(c.directFailGrade) : "",
    roundingMode: c.roundingMode,
    roundingScale: String(c.roundingScale),
    recursoAllowed: c.recursoAllowed,
    trimesterWeight1: c.trimesterWeights?.[0] != null ? String(c.trimesterWeights[0]) : "",
    trimesterWeight2: c.trimesterWeights?.[1] != null ? String(c.trimesterWeights[1]) : "",
    trimesterWeight3: c.trimesterWeights?.[2] != null ? String(c.trimesterWeights[2]) : "",
    active: c.active,
  }
}

function formToPayload(f: FormState) {
  const tw1 = f.trimesterWeight1 ? Number(f.trimesterWeight1) : null
  const tw2 = f.trimesterWeight2 ? Number(f.trimesterWeight2) : null
  const tw3 = f.trimesterWeight3 ? Number(f.trimesterWeight3) : null
  const hasTw = tw1 != null && tw2 != null && tw3 != null

  return {
    classGrade: f.classGrade ? Number(f.classGrade) : null,
    passingGrade: Number(f.passingGrade),
    resourceMinGrade: f.resourceMinGrade ? Number(f.resourceMinGrade) : null,
    maxFailedSubjects: Number(f.maxFailedSubjects),
    directFailGrade: f.directFailGrade ? Number(f.directFailGrade) : null,
    roundingMode: f.roundingMode,
    roundingScale: Number(f.roundingScale),
    recursoAllowed: f.recursoAllowed,
    trimesterWeights: hasTw ? [tw1, tw2, tw3] : null,
    active: f.active,
  }
}

export default function GradingConfigPage() {
  const [configs, setConfigs] = useState<GlobalGradingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<GlobalGradingConfig | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GlobalGradingConfig | null>(null)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-zinc-900 dark:text-zinc-100"

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/grading-config")
      const data = await res.json()
      setConfigs(data.data || [])
    } catch {
      setError("Erro ao carregar configuracoes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const openCreate = () => {
    setForm(emptyForm)
    setFormError("")
    setShowCreate(true)
  }

  const openEdit = (c: GlobalGradingConfig) => {
    setForm(configToForm(c))
    setFormError("")
    setEditTarget(c)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    const payload = formToPayload(form)
    const isEdit = !!editTarget

    try {
      const res = await fetch(
        isEdit ? `/api/admin/grading-config/${editTarget.id}` : "/api/admin/grading-config",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Erro ao guardar")
        return
      }
      setShowCreate(false)
      setEditTarget(null)
      fetchConfigs()
    } catch {
      setFormError("Erro de conexao")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/grading-config/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      if (data.count != null) {
        alert(`Nao e possivel excluir. ${data.count} escola(s) utilizam esta configuracao.`)
      } else {
        alert(data.error || "Erro ao excluir")
      }
      return
    }
    setDeleteTarget(null)
    fetchConfigs()
  }

  const configLabel = (c: GlobalGradingConfig) =>
    c.classGrade != null ? `Classe ${c.classGrade}` : "Geral"

  /* ---------- Form fields (shared between create & edit) ---------- */
  const formFields = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-600 dark:text-rose-400">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* classGrade */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Classe <span className="text-xs text-zinc-400">(vazio = geral)</span>
          </label>
          <input
            className={inputClass}
            type="number"
            min={1}
            max={13}
            placeholder="Ex: 7"
            value={form.classGrade}
            onChange={(e) => setForm((f) => ({ ...f, classGrade: e.target.value }))}
          />
        </div>

        {/* passingGrade */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Nota de Aprovacao *
          </label>
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            value={form.passingGrade}
            onChange={(e) => setForm((f) => ({ ...f, passingGrade: e.target.value }))}
            required
          />
        </div>

        {/* resourceMinGrade */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Nota Min. Recurso
          </label>
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="Opcional"
            value={form.resourceMinGrade}
            onChange={(e) => setForm((f) => ({ ...f, resourceMinGrade: e.target.value }))}
          />
        </div>

        {/* maxFailedSubjects */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Max. Reprovacoes *
          </label>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.maxFailedSubjects}
            onChange={(e) => setForm((f) => ({ ...f, maxFailedSubjects: e.target.value }))}
            required
          />
        </div>

        {/* directFailGrade */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Nota Reprovacao Directa
          </label>
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="Opcional"
            value={form.directFailGrade}
            onChange={(e) => setForm((f) => ({ ...f, directFailGrade: e.target.value }))}
          />
        </div>

        {/* roundingMode */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Modo de Arredondamento *
          </label>
          <select
            className={inputClass}
            value={form.roundingMode}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                roundingMode: e.target.value as FormState["roundingMode"],
              }))
            }
          >
            <option value="truncar">Truncar</option>
            <option value="arredondar">Arredondar</option>
            <option value="teto">Arredondar p/ cima</option>
          </select>
        </div>

        {/* roundingScale */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Escala de Arredondamento *
          </label>
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            value={form.roundingScale}
            onChange={(e) => setForm((f) => ({ ...f, roundingScale: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Trimester weights */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
          Pesos dos Trimestres <span className="text-xs text-zinc-400">(deixe vazio se nao aplicavel)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="1o Trim."
            value={form.trimesterWeight1}
            onChange={(e) => setForm((f) => ({ ...f, trimesterWeight1: e.target.value }))}
          />
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="2o Trim."
            value={form.trimesterWeight2}
            onChange={(e) => setForm((f) => ({ ...f, trimesterWeight2: e.target.value }))}
          />
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="3o Trim."
            value={form.trimesterWeight3}
            onChange={(e) => setForm((f) => ({ ...f, trimesterWeight3: e.target.value }))}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.recursoAllowed}
            onChange={(e) => setForm((f) => ({ ...f, recursoAllowed: e.target.checked }))}
            className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Recurso permitido</span>
            <p className="text-xs text-zinc-500">Permite que alunos facam exame de recurso</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Activa</span>
            <p className="text-xs text-zinc-500">Configuracao disponivel para uso pelas escolas</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={() => {
            setShowCreate(false)
            setEditTarget(null)
          }}
          className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
        >
          {formLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Settings2 className="w-4 h-4" />
          )}
          {formLoading ? "A guardar..." : editTarget ? "Actualizar" : "Criar"}
        </button>
      </div>
    </form>
  )

  /* ---------- Render ---------- */
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-indigo-500" />
            Configuracoes de Avaliacao
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gerir configuracoes globais de avaliacao e aprovacao
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} />
          Nova Configuracao
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          Nenhuma configuracao encontrada. Crie a primeira configuracao global.
        </div>
      ) : (
        /* Cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {configs.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 flex flex-col gap-4"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                    <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {configLabel(c)}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.active
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {c.active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Excluir"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">Nota de Aprovacao</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.passingGrade}</p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">Max. Reprovacoes</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.maxFailedSubjects}</p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">Nota Min. Recurso</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {c.resourceMinGrade != null ? c.resourceMinGrade : "---"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">Arredondamento</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {roundingLabels[c.roundingMode] || c.roundingMode}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">Recurso</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {c.recursoAllowed ? "Sim" : "Nao"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">Pesos Trimestres</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {c.trimesterWeights ? c.trimesterWeights.join(" / ") : "---"}
                  </p>
                </div>
              </div>

              {/* School usage count */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Info size={13} className="text-zinc-400" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {c._count?.schoolConfigs ?? 0} escola(s) utilizam esta configuracao
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <FormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nova Configuracao de Avaliacao"
      >
        {formFields}
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Editar Configuracao de Avaliacao"
      >
        {formFields}
      </FormModal>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? configLabel(deleteTarget) : ""}
        message={
          deleteTarget && (deleteTarget._count?.schoolConfigs ?? 0) > 0
            ? `Atencao: ${deleteTarget._count?.schoolConfigs} escola(s) utilizam esta configuracao. A exclusao pode ser bloqueada.`
            : undefined
        }
      />
    </div>
  )
}
