import { z } from "zod"

// Global Subject
export const createGlobalSubjectSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  code: z.string().min(1, "Código é obrigatório").max(20, "Código muito longo"),
})
export const updateGlobalSubjectSchema = createGlobalSubjectSchema.partial()

// Global Course
export const createGlobalCourseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  code: z.string().min(1, "Código é obrigatório").max(20, "Código muito longo"),
})
export const updateGlobalCourseSchema = createGlobalCourseSchema.partial()

// Global Class
export const createGlobalClassSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo"),
  grade: z.number().int().min(1, "Classe deve ser entre 1 e 13").max(13, "Classe deve ser entre 1 e 13"),
  cycleId: z.string().optional().nullable(),
})
export const updateGlobalClassSchema = createGlobalClassSchema.partial()

// Education Cycle
export const createEducationCycleSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  level: z.enum(["primario", "primeiro_ciclo", "segundo_ciclo"]),
  startGrade: z.number().int().min(1).max(13),
  endGrade: z.number().int().min(1).max(13),
})
export const updateEducationCycleSchema = createEducationCycleSchema.partial()

// Academic Year
export const createAcademicYearSchema = z.object({
  name: z.string().regex(/^\d{4}\/\d{4}$/, "Formato deve ser YYYY/YYYY (ex: 2025/2026)"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
})
export const updateAcademicYearSchema = createAcademicYearSchema.partial()

// Grading Config
export const createGradingConfigSchema = z.object({
  academicYearId: z.string().optional().nullable(),
  classGrade: z.number().int().min(1).max(13).optional().nullable(),
  courseId: z.string().optional().nullable(),
  trimesterWeights: z.array(z.number()).check(z.minLength(3), z.maxLength(3)).optional().nullable(),
  passingGrade: z.number().min(0).max(20).optional(),
  resourceMinGrade: z.number().min(0).max(20).optional().nullable(),
  maxFailedSubjects: z.number().int().min(0).optional(),
  trimesterFormula: z.record(z.string(), z.number()).optional().nullable(),
  finalFormula: z.record(z.string(), z.number()).optional().nullable(),
  directFailGrade: z.number().min(0).max(20).optional().nullable(),
  roundingMode: z.enum(["truncar", "arredondar", "teto"]).optional(),
  roundingScale: z.number().int().min(0).max(2).optional(),
  recursoAllowed: z.boolean().optional(),
})
export const updateGradingConfigSchema = createGradingConfigSchema.partial()
