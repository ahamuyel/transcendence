import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher", "student", "parent"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id: studentId } = await params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "annual" // annual | cycle
    const yearId = searchParams.get("yearId")
    const cycleLevel = searchParams.get("cycle") // primario | primeiro_ciclo | segundo_ciclo

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: { class: true },
    })
    if (!student) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, city: true, logo: true },
    })

    if (type === "cycle" && cycleLevel) {
      // Cycle completion certificate
      const certificate = await prisma.cycleCertificate.findFirst({
        where: {
          studentId,
          cycleLevel: cycleLevel as "primario" | "primeiro_ciclo" | "segundo_ciclo",
        },
        include: { academicYear: { select: { name: true } } },
      })

      if (!certificate) {
        return NextResponse.json({ error: "Certificado de ciclo não encontrado" }, { status: 404 })
      }

      return NextResponse.json({
        type: "cycle",
        student: { name: student.name, gender: student.gender, dateOfBirth: student.dateOfBirth },
        school,
        certificate,
      })
    }

    // Annual certificate — get academic history for the specified year
    if (!yearId) {
      return NextResponse.json({ error: "yearId é obrigatório para certificado anual" }, { status: 400 })
    }

    const history = await prisma.academicHistory.findFirst({
      where: { studentId, academicYearId: yearId },
      include: { academicYear: { select: { name: true } } },
    })

    if (!history) {
      return NextResponse.json({ error: "Histórico não encontrado para este ano" }, { status: 404 })
    }

    return NextResponse.json({
      type: "annual",
      student: { name: student.name, gender: student.gender, dateOfBirth: student.dateOfBirth },
      school,
      history,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
