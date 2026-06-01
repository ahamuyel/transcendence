import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const trimester = searchParams.get("trimester") as "primeiro" | "segundo" | "terceiro" | null
    const providedAcademicYearId = searchParams.get("academicYearId")

    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 })
    }

    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)

    // Fetch school, class, academic year
    const [school, classInfo] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }),
      prisma.class.findUnique({
        where: { id: classId },
        select: { name: true, grade: true, courseId: true },
      }),
    ])

    if (!classInfo) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    // Fetch students in this class, ordered by name
    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    // Get subjects: from course if available, otherwise from results
    let subjects: { id: string; name: string }[] = []

    if (classInfo.courseId) {
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { courseId: classInfo.courseId },
        include: { subject: { select: { id: true, name: true } } },
      })
      subjects = courseSubjects.map((cs) => cs.subject)
    }

    if (subjects.length === 0) {
      // Fallback: get all subjects that have results for students in this class
      const resultsWithSubjects = await prisma.result.findMany({
        where: {
          schoolId,
          studentId: { in: students.map((s) => s.id) },
          ...(trimester ? { trimester } : {}),
          ...(academicYearId ? { academicYearId } : {}),
        },
        select: { subjectId: true, subject: { select: { id: true, name: true } } },
        distinct: ["subjectId"],
      })
      subjects = resultsWithSubjects.map((r) => r.subject)
    }

    subjects.sort((a, b) => a.name.localeCompare(b.name, "pt"))

    // Fetch all results for these students
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultWhere: any = {
      schoolId,
      studentId: { in: students.map((s) => s.id) },
      subjectId: { in: subjects.map((s) => s.id) },
    }
    if (trimester) resultWhere.trimester = trimester
    if (academicYearId) resultWhere.academicYearId = academicYearId

    const results = await prisma.result.findMany({
      where: resultWhere,
      select: { studentId: true, subjectId: true, score: true },
    })

    // Build a map: studentId -> subjectId -> average score
    const scoreMap = new Map<string, Map<string, number[]>>()
    for (const r of results) {
      if (!scoreMap.has(r.studentId)) scoreMap.set(r.studentId, new Map())
      const studentMap = scoreMap.get(r.studentId)!
      if (!studentMap.has(r.subjectId)) studentMap.set(r.subjectId, [])
      studentMap.get(r.subjectId)!.push(r.score)
    }

    // Build PDF
    const doc = new jsPDF({ orientation: subjects.length > 6 ? "landscape" : "portrait" })

    // Header
    doc.setFontSize(18)
    doc.text("Pauta de Notas", 14, 22)
    doc.setFontSize(11)
    doc.text(school?.name || "", 14, 30)

    // Subtitle
    const trimesterLabel = trimester
      ? `${trimester.charAt(0).toUpperCase() + trimester.slice(1)} Trimestre`
      : "Todos os Trimestres"
    const subtitle = `${classInfo.name} — ${trimesterLabel}${academicYearName ? ` — ${academicYearName}` : ""}`
    doc.setFontSize(10)
    doc.text(subtitle, 14, 36)

    // Table
    const head = ["N.º", "Aluno", ...subjects.map((s) => s.name), "Média"]
    const body = students.map((student, idx) => {
      const studentScores = scoreMap.get(student.id)
      const subjectAverages: (string | number)[] = subjects.map((subj) => {
        const scores = studentScores?.get(subj.id)
        if (!scores || scores.length === 0) return "—"
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        return Math.round(avg * 10) / 10
      })

      const numericAverages = subjectAverages.filter((v) => typeof v === "number") as number[]
      const overallAvg =
        numericAverages.length > 0
          ? Math.round((numericAverages.reduce((a, b) => a + b, 0) / numericAverages.length) * 10) / 10
          : "—"

      return [idx + 1, student.name, ...subjectAverages, overallAvg]
    })

    autoTable(doc, {
      head: [head],
      body,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 65, 122], textColor: 255, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 35 },
      },
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(120)
      doc.text(
        `Gerado por cur10usx — ${new Date().toLocaleDateString("pt-PT")}`,
        14,
        pageHeight - 10
      )
      doc.text(`Página ${i}/${pageCount}`, doc.internal.pageSize.getWidth() - 40, pageHeight - 10)
    }

    const buffer = Buffer.from(doc.output("arraybuffer"))
    const filename = `pauta_notas_${classInfo.name.replace(/\s+/g, "_")}${trimester ? `_${trimester}` : ""}.pdf`

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
