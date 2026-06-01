import { z } from "zod"

export const createSchoolSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(50, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hifens"),
  nif: z.string().optional().or(z.literal("")),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 dígitos").max(20, "Telefone muito longo"),
  address: z.string().min(3, "Endereço é obrigatório").max(200, "Endereço muito longo"),
  city: z.string().min(2, "Cidade é obrigatória").max(100, "Cidade muito longa"),
  provincia: z.string().min(2, "Província é obrigatória").max(50, "Província muito longa"),
  logo: z.string().url("URL do logo inválida").optional().or(z.literal("")),
})

export const updateSchoolSchema = createSchoolSchema.partial().extend({
  features: z.record(z.string(), z.boolean()).optional(),
  primaryColor: z.string().max(20).optional().or(z.literal("")),
})

export const rejectSchoolSchema = z.object({
  reason: z.string().min(5, "Motivo deve ter pelo menos 5 caracteres"),
})
