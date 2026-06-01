import { z } from "zod"

const baseFields = {
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 dígitos").max(20, "Telefone muito longo").optional().or(z.literal("")),
  address: z.string().min(3, "Endereço deve ter pelo menos 3 caracteres").max(200, "Endereço muito longo").optional().or(z.literal("")),
  foto: z.string().url("URL da foto inválida").optional().or(z.literal("")),
}

export const createTeacherSchema = z.object({
  ...baseFields,
  subjectIds: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional(),
  createAccount: z.boolean().optional(),
})

export const updateTeacherSchema = createTeacherSchema.partial()

export const createStudentSchema = z.object({
  ...baseFields,
  classId: z.string().optional().nullable(),
  gender: z.enum(["masculino", "feminino"]).optional(),
  dateOfBirth: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  createAccount: z.boolean().optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

export const createParentSchema = z.object({
  ...baseFields,
  studentIds: z.array(z.string()).optional(),
  createAccount: z.boolean().optional(),
})

export const updateParentSchema = createParentSchema.partial()
