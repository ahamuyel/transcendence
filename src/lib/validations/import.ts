import { z } from "zod"

export const importRowSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(9, "Telefone deve ter pelo menos 9 dígitos").optional().or(z.literal("")),
  endereco: z.string().min(3, "Endereço deve ter pelo menos 3 caracteres").optional().or(z.literal("")),
  genero: z.enum(["masculino", "feminino"]).optional().or(z.literal("")),
  dataNascimento: z.string().optional().or(z.literal("")).refine(
    (val) => {
      if (!val) return true // optional
      // Must be a valid YYYY-MM-DD after parseDateValue processing
      const d = new Date(val)
      return !isNaN(d.getTime()) && d.getFullYear() >= 1900 && d.getFullYear() <= 2100
    },
    { message: "Data de nascimento inválida (use DD/MM/AAAA)" }
  ),
  tipoDocumento: z.string().optional().or(z.literal("")),
  numeroDocumento: z.string().optional().or(z.literal("")),
  turma: z.string().optional().or(z.literal("")),
})

export type ImportRow = z.infer<typeof importRowSchema>

export type ValidatedRow = {
  rowNumber: number
  data: ImportRow
  valid: boolean
  errors: string[]
}
