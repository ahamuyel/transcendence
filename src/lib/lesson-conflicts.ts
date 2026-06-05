import { prisma } from "@/lib/prisma"

type ConflictCheckParams = {
  teacherId: string
  day: string
  startTime: string
  endTime: string
  schoolId: string
  academicYearId?: string | null
  excludeLessonId?: string
}

/**
 * Check if a teacher already has a lesson scheduled that overlaps
 * with the given day/time range.
 *
 * Overlap condition: A.start < B.end AND A.end > B.start
 *  → existing.startTime < newEndTime AND existing.endTime > newStartTime
 *
 * Returns an error message string if conflict found, or null if clear.
 */
export async function checkTeacherScheduleConflict(
  params: ConflictCheckParams,
): Promise<string | null> {
  const { teacherId, day, startTime, endTime, schoolId, academicYearId, excludeLessonId } = params

  const where: Record<string, unknown> = {
    teacherId,
    day,
    schoolId,
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  }

  if (academicYearId) {
    where.academicYearId = academicYearId
  }

  if (excludeLessonId) {
    where.id = { not: excludeLessonId }
  }

  const conflicting = await prisma.lesson.findFirst({
    where: where as any,
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
  })

  if (!conflicting) return null

  return [
    `Professor já tem aula neste horário.`,
    `Conflito: ${conflicting.day} ${conflicting.startTime}-${conflicting.endTime}`,
    `Turma: ${conflicting.class.name}, Disciplina: ${conflicting.subject.name}`,
  ].join(" ")
}
