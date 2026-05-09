import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") || ""
    const trimester = searchParams.get("trimester") || ""
    const academicYear = searchParams.get("academicYear") || ""
    const academicYearIdParam = searchParams.get("academicYearId") || ""

    if (!studentId) {
      return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 })
    }

    // Default to current academic year if no filter provided
    const academicYearId = academicYearIdParam || (!academicYear ? await getOrDefaultAcademicYearId(schoolId) : undefined)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      studentId,
      ...(trimester ? { trimester } : {}),
      ...(academicYear ? { academicYear } : {}),
      ...(academicYearId ? { academicYearId } : {}),
    }

    const results = await prisma.result.findMany({
      where,
      include: { subject: { select: { id: true, name: true } } },
    })

    // Group by subject
    const bySubject: Record<string, { subjectId: string; subjectName: string; scores: number[] }> = {}
    for (const r of results) {
      if (!bySubject[r.subjectId]) {
        bySubject[r.subjectId] = { subjectId: r.subjectId, subjectName: r.subject.name, scores: [] }
      }
      bySubject[r.subjectId].scores.push(r.score)
    }

    const subjectAverages = Object.values(bySubject).map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      average: Math.round((s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 100) / 100,
      count: s.scores.length,
    }))

    const generalAverage = subjectAverages.length
      ? Math.round((subjectAverages.reduce((a, b) => a + b.average, 0) / subjectAverages.length) * 100) / 100
      : 0

    return NextResponse.json({
      studentId,
      subjectAverages,
      generalAverage,
      totalResults: results.length,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
