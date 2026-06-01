import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher", "student", "parent"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const providedAcademicYearId = searchParams.get("academicYearId")

    if (!studentId) {
      return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 })
    }

    // Verify access for student/parent roles
    if (role === "student") {
      const ownStudent = await prisma.student.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!ownStudent || ownStudent.id !== studentId) {
        return NextResponse.json({ error: "Sem permissão para este aluno" }, { status: 403 })
      }
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      const childIds = parent?.students.map((s) => s.id) || []
      if (!childIds.includes(studentId)) {
        return NextResponse.json({ error: "Sem permissão para este aluno" }, { status: 403 })
      }
    }

    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)

    // Fetch student, school, academic year
    const [student, school] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          name: true,
          class: { select: { id: true, name: true } },
        },
      }),
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }),
    ])

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    // Fetch results grouped by subject and trimester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultWhere: any = { schoolId, studentId }
    if (academicYearId) resultWhere.academicYearId = academicYearId

    const results = await prisma.result.findMany({
      where: resultWhere,
      select: {
        score: true,
        trimester: true,
        subjectId: true,
        subject: { select: { id: true, name: true } },
      },
    })

    // Collect unique subjects
    const subjectMap = new Map<string, string>()
    for (const r of results) {
      subjectMap.set(r.subjectId, r.subject.name)
    }
    const subjectEntries = Array.from(subjectMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "pt")
    )

    // Build score averages: subjectId -> trimester -> avg
    const trimesterScores = new Map<string, Map<string, number[]>>()
    for (const r of results) {
      const key = r.subjectId
      if (!trimesterScores.has(key)) trimesterScores.set(key, new Map())
      const tm = r.trimester || "sem_trimestre"
      const subjMap = trimesterScores.get(key)!
      if (!subjMap.has(tm)) subjMap.set(tm, [])
      subjMap.get(tm)!.push(r.score)
    }

    const avg = (arr: number[] | undefined) => {
      if (!arr || arr.length === 0) return null
      return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
    }

    // Table data
    const trimesters = ["primeiro", "segundo", "terceiro"] as const
    const tableBody = subjectEntries.map(([subjectId, subjectName]) => {
      const subjScores = trimesterScores.get(subjectId)
      const t1 = avg(subjScores?.get("primeiro"))
      const t2 = avg(subjScores?.get("segundo"))
      const t3 = avg(subjScores?.get("terceiro"))

      const allTrimesterAvgs = [t1, t2, t3].filter((v) => v !== null) as number[]
      const finalAvg =
        allTrimesterAvgs.length > 0
          ? Math.round((allTrimesterAvgs.reduce((a, b) => a + b, 0) / allTrimesterAvgs.length) * 10) / 10
          : null

      return [
        subjectName,
        t1 !== null ? t1 : "—",
        t2 !== null ? t2 : "—",
        t3 !== null ? t3 : "—",
        finalAvg !== null ? finalAvg : "—",
      ]
    })

    // Attendance stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendanceWhere: any = { schoolId, studentId }
    if (academicYearId) attendanceWhere.academicYearId = academicYearId
    if (student.class?.id) attendanceWhere.classId = student.class.id

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      select: { status: true },
    })

    const attStats = { presente: 0, ausente: 0, atrasado: 0 }
    for (const a of attendances) {
      attStats[a.status]++
    }
    const totalAtt = attStats.presente + attStats.ausente + attStats.atrasado
    const attPercentage = totalAtt > 0
      ? Math.round(((attStats.presente + attStats.atrasado) / totalAtt) * 1000) / 10
      : 0

    // Build PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.text("Boletim Individual", 14, 22)
    doc.setFontSize(11)
    doc.text(school?.name || "", 14, 30)

    // Student info
    doc.setFontSize(10)
    doc.text(`Aluno: ${student.name}`, 14, 40)
    doc.text(`Turma: ${student.class?.name || "—"}`, 14, 46)
    if (academicYearName) {
      doc.text(`Ano Letivo: ${academicYearName}`, 14, 52)
    }

    // Grades table
    const startY = academicYearName ? 58 : 52

    autoTable(doc, {
      head: [["Disciplina", "1.º Trim.", "2.º Trim.", "3.º Trim.", "Média Final"]],
      body: tableBody,
      startY,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 65, 122], textColor: 255, fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center", fontStyle: "bold" },
      },
    })

    // Attendance summary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gradesEndY = (doc as any).lastAutoTable?.finalY ?? 150
    const attY = gradesEndY + 12

    doc.setFontSize(12)
    doc.text("Assiduidade", 14, attY)
    doc.setFontSize(10)
    doc.text(`Presenças: ${attStats.presente}`, 14, attY + 8)
    doc.text(`Faltas: ${attStats.ausente}`, 14, attY + 14)
    doc.text(`Atrasos: ${attStats.atrasado}`, 14, attY + 20)
    doc.text(`Percentagem de assiduidade: ${attPercentage}%`, 14, attY + 26)

    // Observation field
    const obsY = attY + 38
    doc.setFontSize(12)
    doc.text("Observações", 14, obsY)
    doc.setDrawColor(180)
    doc.line(14, obsY + 2, 196, obsY + 2)
    doc.line(14, obsY + 12, 196, obsY + 12)
    doc.line(14, obsY + 22, 196, obsY + 22)

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
    const filename = `boletim_${student.name.replace(/\s+/g, "_")}.pdf`

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
