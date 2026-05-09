import { z } from "zod"

export const registerSchoolSchema = z.object({
  // Admin fields
  adminName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  adminEmail: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  adminPassword: z
    .string()
    .min(8, "Palavra-passe deve ter pelo menos 8 caracteres")
    .max(100, "Palavra-passe muito longa"),

  // School fields
  schoolName: z
    .string()
    .min(2, "Nome da escola deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(50, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hifens"),
  nif: z.string().optional().or(z.literal("")),
  schoolEmail: z
    .string()
    .min(1, "E-mail da escola é obrigatório")
    .email("E-mail inválido"),
  phone: z
    .string()
    .min(8, "Telefone deve ter pelo menos 8 dígitos")
    .max(20, "Telefone muito longo"),
  address: z
    .string()
    .min(3, "Endereço é obrigatório")
    .max(200, "Endereço muito longo"),
  city: z
    .string()
    .min(2, "Cidade é obrigatória")
    .max(100, "Cidade muito longa"),
  provincia: z
    .string()
    .min(2, "Província é obrigatória")
    .max(50, "Província muito longa"),
})
