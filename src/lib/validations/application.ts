import { z } from "zod"

export const createApplicationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 dígitos").max(20, "Telefone muito longo"),
  role: z.enum(["teacher", "student", "parent"], {
    error: () => "Selecione um perfil válido",
  }),
  schoolId: z.string().min(1, "Escola é obrigatória"),
  message: z.string().max(500, "Mensagem muito longa").optional().or(z.literal("")),
  gender: z.enum(["masculino", "feminino"]).optional(),
  documentType: z.string().optional().or(z.literal("")),
  documentNumber: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  desiredGrade: z.coerce.number().int().min(1, "Classe mínima: 1").max(13, "Classe máxima: 13").optional(),
  desiredCourseId: z.string().optional().or(z.literal("")),
})

export const rejectApplicationSchema = z.object({
  reason: z.string().min(5, "Motivo deve ter pelo menos 5 caracteres"),
})
