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
    const role = session!.user.role

    if (role === "student") {
      const student = await prisma.student.findFirst({
        where: { userId: session!.user.id, schoolId },
        select: { id: true },
      })
      if (!student || student.id !== studentId) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    const certificates = await prisma.cycleCertificate.findMany({
      where: { studentId },
      include: {
        academicYear: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
      },
      orderBy: { completionGrade: "asc" },
    })

    return NextResponse.json({ data: certificates })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
