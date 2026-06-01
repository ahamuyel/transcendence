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
      "canManageAttendance",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const month = searchParams.get("month") // YYYY-MM
    const providedAcademicYearId = searchParams.get("academicYearId")

    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 })
    }

    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)

    // Fetch school and class info
    const [school, classInfo] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }),
      prisma.class.findUnique({ where: { id: classId }, select: { name: true } }),
    ])

    if (!classInfo) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    // Fetch students
    const students = await prisma.student.findMany({
      where: { classId, schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    // Build date filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendanceWhere: any = {
      schoolId,
      classId,
      studentId: { in: students.map((s) => s.id) },
    }

    if (academicYearId) attendanceWhere.academicYearId = academicYearId

    if (month) {
      const [year, mon] = month.split("-").map(Number)
      const startDate = new Date(year, mon - 1, 1)
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999)
      attendanceWhere.date = { gte: startDate, lte: endDate }
    }

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      select: { studentId: true, status: true },
    })

    // Aggregate per student
    const statsMap = new Map<string, { presente: number; ausente: number; atrasado: number }>()
    for (const student of students) {
      statsMap.set(student.id, { presente: 0, ausente: 0, atrasado: 0 })
    }
    for (const a of attendances) {
      const stats = statsMap.get(a.studentId)
      if (stats) stats[a.status]++
    }

    // Build PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.text("Relatório de Assiduidade", 14, 22)
    doc.setFontSize(11)
    doc.text(school?.name || "", 14, 30)

    // Subtitle
    const monthLabel = month
      ? new Date(`${month}-15`).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })
      : "Período completo"
    const subtitle = `${classInfo.name}${academicYearName ? ` — ${academicYearName}` : ""} — ${monthLabel}`
    doc.setFontSize(10)
    doc.text(subtitle, 14, 36)

    // Table
    const head = ["N.º", "Aluno", "Presenças", "Faltas", "Atrasos", "% Assiduidade"]
    const body = students.map((student, idx) => {
      const stats = statsMap.get(student.id)!
      const total = stats.presente + stats.ausente + stats.atrasado
      const percentage = total > 0 ? Math.round(((stats.presente + stats.atrasado) / total) * 1000) / 10 : 0

      return [
        idx + 1,
        student.name,
        stats.presente,
        stats.ausente,
        stats.atrasado,
        total > 0 ? `${percentage}%` : "—",
      ]
    })

    autoTable(doc, {
      head: [head],
      body,
      startY: 42,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 65, 122], textColor: 255, fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 50 },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
    })

    // Summary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY ?? 200
    const totalStudents = students.length
    const allPercentages = students.map((s) => {
      const stats = statsMap.get(s.id)!
      const total = stats.presente + stats.ausente + stats.atrasado
      return total > 0 ? ((stats.presente + stats.atrasado) / total) * 100 : 0
    })
    const avgAttendance =
      allPercentages.length > 0
        ? Math.round((allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length) * 10) / 10
        : 0

    doc.setFontSize(10)
    doc.text(`Total de alunos: ${totalStudents}`, 14, finalY + 10)
    doc.text(`Média de assiduidade: ${avgAttendance}%`, 14, finalY + 17)

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
    const filename = `relatorio_assiduidade_${classInfo.name.replace(/\s+/g, "_")}${month ? `_${month}` : ""}.pdf`

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
