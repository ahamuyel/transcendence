import { prisma } from "@/lib/prisma"
import type { AcademicYear } from "@prisma/client"

export async function getCurrentAcademicYear(schoolId: string): Promise<AcademicYear | null> {
  return prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  })
}

export async function requireCurrentAcademicYear(schoolId: string): Promise<AcademicYear> {
  const year = await getCurrentAcademicYear(schoolId)
  if (!year) {
    throw new Error("Nenhum ano letivo ativo para esta escola")
  }
  return year
}

export async function getOrDefaultAcademicYearId(
  schoolId: string,
  providedId?: string | null
): Promise<string | undefined> {
  if (providedId) return providedId
  const current = await getCurrentAcademicYear(schoolId)
  return current?.id ?? undefined
}
