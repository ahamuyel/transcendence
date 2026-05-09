import * as XLSX from "xlsx"
import crypto from "crypto"
import { importRowSchema, type ImportRow, type ValidatedRow } from "@/lib/validations/import"

/**
 * Parse a date value from Excel/CSV. Handles:
 * - Excel serial numbers (e.g. 39209 = 2007-05-15)
 * - DD/MM/YYYY (common in Angola/Portugal)
 * - YYYY-MM-DD (ISO)
 * - JS Date objects (from cellDates)
 * Returns ISO date string (YYYY-MM-DD) or empty string if invalid.
 */
export function parseDateValue(value: unknown): string {
  if (!value && value !== 0) return ""

  // JS Date object (from XLSX cellDates)
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return ""
    return value.toISOString().split("T")[0]
  }

  const str = String(value).trim()
  if (!str) return ""

  // Excel serial number (pure number, typically 1-60000 range for reasonable dates)
  const num = Number(str)
  if (!isNaN(num) && num > 0 && num < 100000 && !str.includes("/") && !str.includes("-")) {
    // Excel epoch: 1900-01-01, but Excel incorrectly treats 1900 as a leap year
    // so we subtract 1 for dates after Feb 28 1900 (serial > 59)
    const excelEpoch = new Date(1899, 11, 30) // Dec 30, 1899
    const date = new Date(excelEpoch.getTime() + num * 86400000)
    if (date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
      return date.toISOString().split("T")[0]
    }
    return ""
  }

  // DD/MM/YYYY or D/M/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(d.getTime()) && d.getFullYear() >= 1900 && d.getFullYear() <= 2100) {
      return d.toISOString().split("T")[0]
    }
    return ""
  }

  // YYYY-MM-DD (ISO)
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    const d = new Date(str)
    if (!isNaN(d.getTime()) && d.getFullYear() >= 1900 && d.getFullYear() <= 2100) {
      return d.toISOString().split("T")[0]
    }
    return ""
  }

  return ""
}

// Header normalization map
const HEADER_MAP: Record<string, string> = {
  "nome": "nome",
  "nome completo": "nome",
  "name": "nome",
  "email": "email",
  "e-mail": "email",
  "telefone": "telefone",
  "phone": "telefone",
  "telemóvel": "telefone",
  "telemovel": "telefone",
  "endereço": "endereco",
  "endereco": "endereco",
  "morada": "endereco",
  "address": "endereco",
  "género": "genero",
  "genero": "genero",
  "sexo": "genero",
  "gender": "genero",
  "data de nascimento": "dataNascimento",
  "data nascimento": "dataNascimento",
  "datanascimento": "dataNascimento",
  "nascimento": "dataNascimento",
  "tipo documento": "tipoDocumento",
  "tipodocumento": "tipoDocumento",
  "tipo de documento": "tipoDocumento",
  "número documento": "numeroDocumento",
  "numerodocumento": "numeroDocumento",
  "numero documento": "numeroDocumento",
  "número de documento": "numeroDocumento",
  "bilhete": "numeroDocumento",
  "bi": "numeroDocumento",
  "turma": "turma",
  "classe": "turma",
  "class": "turma",
}

export function normalizeHeaders(headers: string[]): Record<number, string> {
  const map: Record<number, string> = {}
  headers.forEach((h, i) => {
    const normalized = HEADER_MAP[h.toLowerCase().trim()]
    if (normalized) map[i] = normalized
  })
  return map
}

export function parseFile(buffer: Buffer, filename: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const ext = filename.split(".").pop()?.toLowerCase()
  const opts = ext === "csv"
    ? { type: "buffer" as const, codepage: 65001, cellDates: true }
    : { type: "buffer" as const, cellDates: true }

  const workbook = XLSX.read(buffer, opts)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  // raw: true preserves Date objects and numbers for proper parsing
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true })
  const headers = data.length > 0 ? Object.keys(data[0]) : []
  return { headers, rows: data }
}

export function validateRows(rows: Record<string, unknown>[], headerMap: Record<number, string>, originalHeaders: string[]): ValidatedRow[] {
  return rows.map((row, index) => {
    // Map row keys to normalized names
    const mappedData: Record<string, string> = {}
    originalHeaders.forEach((h, i) => {
      const normalizedKey = headerMap[i]
      if (normalizedKey) {
        const rawValue = row[h]

        // Special handling for date fields
        if (normalizedKey === "dataNascimento") {
          mappedData[normalizedKey] = parseDateValue(rawValue)
        } else {
          mappedData[normalizedKey] = String(rawValue ?? "").trim()
        }
      }
    })

    // Normalize gender values
    if (mappedData.genero) {
      const g = mappedData.genero.toLowerCase()
      if (g === "m" || g === "masc" || g === "masculino") mappedData.genero = "masculino"
      else if (g === "f" || g === "fem" || g === "feminino") mappedData.genero = "feminino"
    }

    const parsed = importRowSchema.safeParse(mappedData)

    if (parsed.success) {
      return {
        rowNumber: index + 2, // +2 for 1-indexed + header row
        data: parsed.data,
        valid: true,
        errors: [],
      }
    }

    return {
      rowNumber: index + 2,
      data: mappedData as ImportRow,
      valid: false,
      errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
    }
  })
}

export function generateTempPassword(): string {
  return crypto.randomBytes(6).toString("base64url")
}

export function generateTemplate(userType: string): Buffer {
  const headers: Record<string, string[]> = {
    student: ["Nome", "Email", "Telefone", "Endereço", "Género", "Data de Nascimento", "Tipo Documento", "Número Documento", "Turma"],
    teacher: ["Nome", "Email", "Telefone", "Endereço"],
    parent: ["Nome", "Email", "Telefone", "Endereço"],
  }

  const cols = headers[userType] || headers.student
  const ws = XLSX.utils.aoa_to_sheet([cols])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Template")

  // Set column widths
  ws["!cols"] = cols.map(() => ({ wch: 20 }))

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }))
}