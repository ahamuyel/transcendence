import { prisma } from "@/lib/prisma"

// ─── Types ───────────────────────────────────────────────────────

export interface TransitionStudent {
  studentId: string
  studentName: string
  enrollmentId: string
  fromGrade: number
  fromClassId: string
  status: "aprovada" | "reprovada" | "em_recurso"
  finalAverage: number | null
}

export interface TransitionPreview {
  promoted: { studentId: string; studentName: string; fromGrade: number; toGrade: number }[]
  retained: { studentId: string; studentName: string; grade: number }[]
  pendingRecurso: { studentId: string; studentName: string; grade: number }[]
  cycleComplete: { studentId: string; studentName: string; grade: number; cycleName: string }[]
  totalStudents: number
}

// Cycle end grades
const CYCLE_END_GRADES: Record<number, { level: "primario" | "primeiro_ciclo" | "segundo_ciclo"; name: string }> = {
  6: { level: "primario", name: "Ensino Primário" },
  9: { level: "primeiro_ciclo", name: "1.º Ciclo do Ensino Secundário" },
  13: { level: "segundo_ciclo", name: "2.º Ciclo / Ensino Médio" },
}

// ─── Preview ─────────────────────────────────────────────────────

export async function previewTransition(
  closedYearId: string,
  schoolId: string
): Promise<TransitionPreview> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      academicYearId: closedYearId,
      schoolId,
      status: { in: ["aprovada", "reprovada", "em_recurso"] },
    },
    include: {
      student: { select: { id: true, name: true } },
      class: { select: { id: true, grade: true } },
    },
  })

  const promoted: TransitionPreview["promoted"] = []
  const retained: TransitionPreview["retained"] = []
  const pendingRecurso: TransitionPreview["pendingRecurso"] = []
  const cycleComplete: TransitionPreview["cycleComplete"] = []

  for (const enrollment of enrollments) {
    const grade = enrollment.class.grade
    const student = { studentId: enrollment.studentId, studentName: enrollment.student.name }

    if (enrollment.status === "em_recurso") {
      pendingRecurso.push({ ...student, grade })
      continue
    }

    if (enrollment.status === "reprovada") {
      retained.push({ ...student, grade })
      continue
    }

    // Aprovada
    if (CYCLE_END_GRADES[grade]) {
      cycleComplete.push({
        ...student,
        grade,
        cycleName: CYCLE_END_GRADES[grade].name,
      })
    } else {
      promoted.push({ ...student, fromGrade: grade, toGrade: grade + 1 })
    }
  }

  return {
    promoted,
    retained,
    pendingRecurso,
    cycleComplete,
    totalStudents: enrollments.length,
  }
}

// ─── Execute Transition ─────────────────────────────────────────

export async function executeTransition(
  closedYearId: string,
  newYearId: string,
  schoolId: string
): Promise<{ promoted: number; retained: number; cycleComplete: number; certificatesGenerated: number }> {
  // Verify no recurso pending
  const pendingCount = await prisma.enrollment.count({
    where: { academicYearId: closedYearId, schoolId, status: "em_recurso" },
  })
  if (pendingCount > 0) {
    throw new Error(`Existem ${pendingCount} aluno(s) em recurso. Resolva antes de executar a transição.`)
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      academicYearId: closedYearId,
      schoolId,
      status: { in: ["aprovada", "reprovada"] },
    },
    include: {
      student: true,
      class: { select: { id: true, grade: true, courseId: true, period: true, name: true, capacity: true } },
    },
  })

  let promotedCount = 0
  let retainedCount = 0
  let cycleCompleteCount = 0
  let certificatesGenerated = 0

  for (const enrollment of enrollments) {
    const grade = enrollment.class.grade
    const courseId = enrollment.class.courseId

    if (enrollment.status === "aprovada" && CYCLE_END_GRADES[grade]) {
      // Cycle complete — generate certificate
      cycleCompleteCount++
      const cycleInfo = CYCLE_END_GRADES[grade]

      await prisma.cycleCertificate.upsert({
        where: {
          studentId_cycleLevel_schoolId: {
            studentId: enrollment.studentId,
            cycleLevel: cycleInfo.level,
            schoolId,
          },
        },
        update: {
          finalAverage: enrollment.finalAverage || 0,
          completionDate: new Date(),
          academicYearId: closedYearId,
          certificateData: { grade, courseName: enrollment.class.name },
        },
        create: {
          studentId: enrollment.studentId,
          schoolId,
          cycleLevel: cycleInfo.level,
          cycleName: cycleInfo.name,
          completionGrade: grade,
          finalAverage: enrollment.finalAverage || 0,
          completionDate: new Date(),
          academicYearId: closedYearId,
          certificateData: { grade, courseName: enrollment.class.name },
        },
      })
      certificatesGenerated++

      // Update enrollment to concluida
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "concluida" },
      })
      continue
    }

    // Determine target grade
    const targetGrade = enrollment.status === "aprovada" ? grade + 1 : grade

    if (enrollment.status === "aprovada") promotedCount++
    else retainedCount++

    // Find or create class in new year
    let targetClass = await prisma.class.findFirst({
      where: {
        schoolId,
        academicYearId: newYearId,
        grade: targetGrade,
        ...(courseId ? { courseId } : {}),
      },
    })

    if (!targetClass) {
      targetClass = await prisma.class.create({
        data: {
          name: `${targetGrade}ª Classe`,
          grade: targetGrade,
          capacity: enrollment.class.capacity || 40,
          period: enrollment.class.period,
          courseId,
          academicYearId: newYearId,
          schoolId,
        },
      })
    }

    // Create new enrollment
    await prisma.enrollment.upsert({
      where: {
        studentId_academicYearId: {
          studentId: enrollment.studentId,
          academicYearId: newYearId,
        },
      },
      update: {
        classId: targetClass.id,
        status: "ativa",
      },
      create: {
        studentId: enrollment.studentId,
        classId: targetClass.id,
        academicYearId: newYearId,
        schoolId,
        status: "ativa",
      },
    })

    // Update student's current class
    await prisma.student.update({
      where: { id: enrollment.studentId },
      data: { classId: targetClass.id },
    })
  }

  return { promoted: promotedCount, retained: retainedCount, cycleComplete: cycleCompleteCount, certificatesGenerated }
}
