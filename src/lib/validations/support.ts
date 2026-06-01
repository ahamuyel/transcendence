import { z } from "zod"

export const createTicketSchema = z.object({
  subject: z.string().min(3, "Assunto deve ter pelo menos 3 caracteres").max(200, "Assunto muito longo"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(5000, "Descrição muito longa"),
  priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
  attachment: z.string().max(2_000_000, "Anexo muito grande (máx. 1.5MB)").optional().nullable(),
})

export const createMessageSchema = z.object({
  content: z.string().min(1, "Mensagem é obrigatória").max(5000, "Mensagem muito longa"),
})

export const updateTicketStatusSchema = z.object({
  status: z.enum(["aberto", "em_andamento", "resolvido", "arquivado"]),
})
