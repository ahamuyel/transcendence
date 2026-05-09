import { prisma } from "@/lib/prisma"
import type { GradingConfig, GlobalGradingConfig, Result, Trimester } from "@prisma/client"

// ─── Types ───────────────────────────────────────────────────────

export interface SubjectFinalResult {
  subjectId: string
  subjectName: string
  t1: number | null
  t2: number | null
  t3: number | null
  finalAverage: number | null
  passed: boolean
  inRecurso: boolean
}

export interface StudentEvaluation {
  studentId: string
  studentName: string
  enrollmentId: string
  classId: string
  grade: number
  subjectResults: SubjectFinalResult[]
  generalAverage: number | null
  failedSubjectCount: number
  recursoSubjectCount: number
  status: "aprovada" | "reprovada" | "em_recurso"
  observation: string
}

interface ResolvedConfig {
  trimesterWeights: number[]
  passingGrade: number
  resourceMinGrade: number | null
  maxFailedSubjects: number
  trimesterFormula: Record<string, number> | null
  finalFormula: Record<string, number> | null
  directFailGrade: number | null
  roundingMode: "truncar" | "arredondar" | "teto"
  roundingScale: number
  recursoAllowed: boolean
}

// ─── Defaults Angola ─────────────────────────────────────────────

const ANGOLA_DEFAULTS: ResolvedConfig = {
  trimesterWeights: [0.33, 0.33, 0.34],
  passingGrade: 10,
  resourceMinGrade: 8,
  maxFailedSubjects: 2,
  trimesterFormula: null,
  finalFormula: null,
  directFailGrade: null,
  roundingMode: "arredondar",
  roundingScale: 1,
  recursoAllowed: true,
}

// ─── Rounding ────────────────────────────────────────────────────

export function applyRounding(
  value: number,
  mode: "truncar" | "arredondar" | "teto",
  scale: number
): number {
  const factor = Math.pow(10, scale)
  switch (mode) {
    case "truncar":
      return Math.floor(value * factor) / factor
    case "teto":
      return Math.ceil(value * factor) / factor
    case "arredondar":
    default:
      return Math.round(value * factor) / factor
  }
}

// ─── Config Resolution (cascade com herança global→local) ───────

/**
 * Cascata de resolução:
 * 1. Escola + ano + classe + curso (mais específico)
 * 2. Escola + ano + classe
 * 3. Escola + ano (default do ano)
 * 4. Escola (default permanente)
 * 5. Global + classe + curso ← herança do Super Admin
 * 6. Global + classe
 * 7. Global default (classGrade=null, courseId=null)
 * 8. Hardcoded Angola (último recurso, nunca silencioso)
 *
 * Se a config escola tem globalGradingConfigId: merge global base + overrides locais
 */
export async function resolveGradingConfig(
  schoolId: string,
  academicYearId: string,
  grade?: number,
  courseId?: string | null
): Promise<ResolvedConfig> {
  // Fetch school-level configs
  const schoolConfigs = await prisma.gradingConfig.findMany({
    where: { schoolId },
    include: { globalGradingConfig: true },
    orderBy: { createdAt: "desc" },
  })

  // Try school-level cascade (most specific → least specific)
  const schoolMatch = findSchoolConfig(schoolConfigs, academicYearId, grade, courseId)
  if (schoolMatch) {
    return schoolConfigToResolved(schoolMatch)
  }

  // Fetch global configs (Super Admin)
  const globalConfigs = await prisma.globalGradingConfig.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  })

  // Try global-level cascade
  const globalMatch = findGlobalConfig(globalConfigs, grade, courseId)
  if (globalMatch) {
    return globalConfigToResolved(globalMatch)
  }

  // Last resort: Angola defaults
  return ANGOLA_DEFAULTS
}

type SchoolConfigWithGlobal = GradingConfig & { globalGradingConfig: GlobalGradingConfig | null }

function findSchoolConfig(
  configs: SchoolConfigWithGlobal[],
  academicYearId: string,
  grade?: number,
  courseId?: string | null
): SchoolConfigWithGlobal | undefined {
  // 1. escola + ano + classe + curso
  if (grade && courseId) {
    const match = configs.find(
      (c) => c.academicYearId === academicYearId && c.classGrade === grade && c.courseId === courseId
    )
    if (match) return match
  }

  // 2. escola + ano + classe
  if (grade) {
    const match = configs.find(
      (c) => c.academicYearId === academicYearId && c.classGrade === grade && !c.courseId
    )
    if (match) return match
  }

  // 3. escola + ano
  {
    const match = configs.find(
      (c) => c.academicYearId === academicYearId && !c.classGrade && !c.courseId
    )
    if (match) return match
  }

  // 4. escola default (no year)
  {
    const match = configs.find(
      (c) => !c.academicYearId && !c.classGrade && !c.courseId
    )
    if (match) return match
  }

  return undefined
}

function findGlobalConfig(
  configs: GlobalGradingConfig[],
  grade?: number,
  courseId?: string | null
): GlobalGradingConfig | undefined {
  // 5. global + classe + curso
  if (grade && courseId) {
    const match = configs.find((c) => c.classGrade === grade && c.courseId === courseId)
    if (match) return match
  }

  // 6. global + classe
  if (grade) {
    const match = configs.find((c) => c.classGrade === grade && !c.courseId)
    if (match) return match
  }

  // 7. global default
  {
    const match = configs.find((c) => !c.classGrade && !c.courseId)
    if (match) return match
  }

  return undefined
}

/**
 * Converte uma config escola para ResolvedConfig.
 * Se a config referencia uma GlobalGradingConfig, faz merge: global base + overrides locais.
 */
function schoolConfigToResolved(config: SchoolConfigWithGlobal): ResolvedConfig {
  if (config.globalGradingConfigId && config.globalGradingConfig) {
    // Herança: começa com valores globais, aplica overrides da escola
    const base = globalConfigToResolved(config.globalGradingConfig)
    const overrides = (config.overrides as Record<string, unknown> | null) || {}
    return mergeConfigWithOverrides(base, overrides)
  }

  // Config escola standalone (sem herança)
  return {
    trimesterWeights: (config.trimesterWeights as number[] | null) || ANGOLA_DEFAULTS.trimesterWeights,
    passingGrade: config.passingGrade,
    resourceMinGrade: config.resourceMinGrade,
    maxFailedSubjects: config.maxFailedSubjects,
    trimesterFormula: (config.trimesterFormula as Record<string, number> | null) || null,
    finalFormula: (config.finalFormula as Record<string, number> | null) || null,
    directFailGrade: config.directFailGrade,
    roundingMode: (config.roundingMode as "truncar" | "arredondar" | "teto") || "arredondar",
    roundingScale: config.roundingScale ?? 1,
    recursoAllowed: config.recursoAllowed ?? true,
  }
}

function globalConfigToResolved(config: GlobalGradingConfig): ResolvedConfig {
  return {
    trimesterWeights: (config.trimesterWeights as number[] | null) || ANGOLA_DEFAULTS.trimesterWeights,
    passingGrade: config.passingGrade,
    resourceMinGrade: config.resourceMinGrade,
    maxFailedSubjects: config.maxFailedSubjects,
    trimesterFormula: (config.trimesterFormula as Record<string, number> | null) || null,
    finalFormula: (config.finalFormula as Record<string, number> | null) || null,
    directFailGrade: config.directFailGrade,
    roundingMode: (config.roundingMode as "truncar" | "arredondar" | "teto") || "arredondar",
    roundingScale: config.roundingScale ?? 1,
    recursoAllowed: config.recursoAllowed ?? true,
  }
}

/**
 * Merge: aplica overrides (JSON parcial da escola) sobre a config base (global).
 * Apenas os campos presentes no overrides substituem os valores base.
 */
function mergeConfigWithOverrides(
  base: ResolvedConfig,
  overrides: Record<string, unknown>
): ResolvedConfig {
  return {
    trimesterWeights: (overrides.trimesterWeights as number[] | undefined) || base.trimesterWeights,
    passingGrade: (overrides.passingGrade as number | undefined) ?? base.passingGrade,
    resourceMinGrade: overrides.resourceMinGrade !== undefined
      ? (overrides.resourceMinGrade as number | null)
      : base.resourceMinGrade,
    maxFailedSubjects: (overrides.maxFailedSubjects as number | undefined) ?? base.maxFailedSubjects,
    trimesterFormula: overrides.trimesterFormula !== undefined
      ? (overrides.trimesterFormula as Record<string, number> | null)
      : base.trimesterFormula,
    finalFormula: overrides.finalFormula !== undefined
      ? (overrides.finalFormula as Record<string, number> | null)
      : base.finalFormula,
    directFailGrade: overrides.directFailGrade !== undefined
      ? (overrides.directFailGrade as number | null)
      : base.directFailGrade,
    roundingMode: (overrides.roundingMode as "truncar" | "arredondar" | "teto" | undefined) || base.roundingMode,
    roundingScale: (overrides.roundingScale as number | undefined) ?? base.roundingScale,
    recursoAllowed: (overrides.recursoAllowed as boolean | undefined) ?? base.recursoAllowed,
  }
}

// ─── Trimester Average ──────────────────────────────────────────

export function calculateTrimesterAverage(
  results: Pick<Result, "score" | "type">[],
  formula: Record<string, number> | null,
  roundingMode: "truncar" | "arredondar" | "teto",
  roundingScale: number
): number | null {
  if (results.length === 0) return null

  if (!formula || Object.keys(formula).length === 0) {
    // Simple arithmetic average
    const sum = results.reduce((acc, r) => acc + r.score, 0)
    return applyRounding(sum / results.length, roundingMode, roundingScale)
  }

  // Weighted average by type
  const byType: Record<string, number[]> = {}
  for (const r of results) {
    const type = r.type.toLowerCase()
    if (!byType[type]) byType[type] = []
    byType[type].push(r.score)
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const [type, weight] of Object.entries(formula)) {
    const scores = byType[type.toLowerCase()]
    if (scores && scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      weightedSum += avg * weight
      totalWeight += weight
    }
  }

  if (totalWeight === 0) {
    // Fallback to simple average if no matching types
    const sum = results.reduce((acc, r) => acc + r.score, 0)
    return applyRounding(sum / results.length, roundingMode, roundingScale)
  }

  return applyRounding(weightedSum / totalWeight, roundingMode, roundingScale)
}

// ─── Final Average ──────────────────────────────────────────────

export function calculateFinalAverage(
  trimesterAverages: [number | null, number | null, number | null],
  weights: number[],
  roundingMode: "truncar" | "arredondar" | "teto",
  roundingScale: number
): number | null {
  const validAverages = trimesterAverages.filter((a): a is number => a !== null)
  if (validAverages.length === 0) return null

  // If all 3 trimesters have data, use weights
  if (validAverages.length === 3 && weights.length === 3) {
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    const weighted = trimesterAverages.reduce<number>((sum, avg, i) => sum + (avg || 0) * weights[i], 0)
    return applyRounding(totalWeight > 0 ? weighted / totalWeight : 0, roundingMode, roundingScale)
  }

  // Otherwise, simple average of available trimesters
  const sum = validAverages.reduce((a: number, b: number) => a + b, 0)
  return applyRounding(sum / validAverages.length, roundingMode, roundingScale)
}

// ─── Status Determination ───────────────────────────────────────

export function determineStatus(
  subjectResults: SubjectFinalResult[],
  config: ResolvedConfig
): { status: "aprovada" | "reprovada" | "em_recurso"; observation: string } {
  const subjectsWithGrades = subjectResults.filter((s) => s.finalAverage !== null)

  if (subjectsWithGrades.length === 0) {
    return { status: "reprovada", observation: "Sem notas registadas." }
  }

  // Check for direct fail (below directFailGrade)
  if (config.directFailGrade !== null) {
    const directFails = subjectsWithGrades.filter(
      (s) => s.finalAverage !== null && s.finalAverage < config.directFailGrade!
    )
    if (directFails.length > 0) {
      return {
        status: "reprovada",
        observation: `Reprovação directa: ${directFails.map((s) => s.subjectName).join(", ")} abaixo de ${config.directFailGrade}.`,
      }
    }
  }

  // Count failed and recurso-eligible subjects
  const failedSubjects = subjectsWithGrades.filter((s) => !s.passed)
  const recursoEligible = failedSubjects.filter((s) => s.inRecurso)

  if (failedSubjects.length === 0) {
    return { status: "aprovada", observation: "Aprovado(a) em todas as disciplinas." }
  }

  // Check for recurso eligibility
  if (
    config.recursoAllowed &&
    failedSubjects.length <= config.maxFailedSubjects &&
    recursoEligible.length === failedSubjects.length // all failed subjects are recurso-eligible
  ) {
    return {
      status: "em_recurso",
      observation: `Em recurso: ${recursoEligible.map((s) => s.subjectName).join(", ")}.`,
    }
  }

  return {
    status: "reprovada",
    observation: `Reprovado(a): ${failedSubjects.length} disciplina(s) com nota insuficiente (${failedSubjects.map((s) => s.subjectName).join(", ")}).`,
  }
}

// ─── Evaluate a Single Student ──────────────────────────────────

export async function evaluateStudent(
  studentId: string,
  academicYearId: string,
  schoolId: string
): Promise<StudentEvaluation | null> {
  // Get enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, academicYearId, schoolId },
    include: {
      student: { select: { id: true, name: true } },
      class: { select: { id: true, grade: true, courseId: true } },
    },
  })

  if (!enrollment) return null

  const { grade, courseId } = enrollment.class
  const config = await resolveGradingConfig(schoolId, academicYearId, grade, courseId)

  // Get all results for this student in this academic year
  const results = await prisma.result.findMany({
    where: { studentId, academicYearId, schoolId },
    include: { subject: { select: { id: true, name: true } } },
  })

  // Group results by subject
  const bySubject: Record<string, { name: string; results: typeof results }> = {}
  for (const r of results) {
    if (!bySubject[r.subjectId]) {
      bySubject[r.subjectId] = { name: r.subject.name, results: [] }
    }
    bySubject[r.subjectId].results.push(r)
  }

  // Get subjects assigned to the course/class
  const courseSubjects = courseId
    ? await prisma.courseSubject.findMany({
        where: { courseId },
        include: { subject: true },
      })
    : []

  // Add subjects with no results if they belong to the course
  for (const cs of courseSubjects) {
    if (!bySubject[cs.subjectId]) {
      bySubject[cs.subjectId] = { name: cs.subject.name, results: [] }
    }
  }

  const trimesters: Trimester[] = ["primeiro", "segundo", "terceiro"]

  // Calculate per-subject results
  const subjectResults: SubjectFinalResult[] = Object.entries(bySubject).map(
    ([subjectId, { name, results: subjectResults }]) => {
      const trimesterAvgs = trimesters.map((t) => {
        const tResults = subjectResults.filter((r) => r.trimester === t)
        return calculateTrimesterAverage(tResults, config.trimesterFormula, config.roundingMode, config.roundingScale)
      }) as [number | null, number | null, number | null]

      const finalAverage = calculateFinalAverage(
        trimesterAvgs,
        config.trimesterWeights,
        config.roundingMode,
        config.roundingScale
      )

      const passed = finalAverage !== null && finalAverage >= config.passingGrade
      const inRecurso =
        !passed &&
        finalAverage !== null &&
        config.resourceMinGrade !== null &&
        finalAverage >= config.resourceMinGrade &&
        finalAverage < config.passingGrade

      return {
        subjectId,
        subjectName: name,
        t1: trimesterAvgs[0],
        t2: trimesterAvgs[1],
        t3: trimesterAvgs[2],
        finalAverage,
        passed,
        inRecurso,
      }
    }
  )

  // General average
  const validFinals = subjectResults
    .filter((s) => s.finalAverage !== null)
    .map((s) => s.finalAverage!)

  const generalAverage =
    validFinals.length > 0
      ? applyRounding(
          validFinals.reduce((a, b) => a + b, 0) / validFinals.length,
          config.roundingMode,
          config.roundingScale
        )
      : null

  const failedSubjectCount = subjectResults.filter((s) => !s.passed && s.finalAverage !== null).length
  const recursoSubjectCount = subjectResults.filter((s) => s.inRecurso).length

  const { status, observation } = determineStatus(subjectResults, config)

  return {
    studentId,
    studentName: enrollment.student.name,
    enrollmentId: enrollment.id,
    classId: enrollment.classId,
    grade,
    subjectResults,
    generalAverage,
    failedSubjectCount,
    recursoSubjectCount,
    status,
    observation,
  }
}

// ─── Evaluate Entire Class ──────────────────────────────────────

export async function evaluateClass(
  classId: string,
  academicYearId: string,
  schoolId: string
): Promise<StudentEvaluation[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { classId, academicYearId, schoolId, status: "ativa" },
    select: { studentId: true },
  })

  const evaluations: StudentEvaluation[] = []
  for (const enrollment of enrollments) {
    const result = await evaluateStudent(enrollment.studentId, academicYearId, schoolId)
    if (result) evaluations.push(result)
  }

  return evaluations
}
