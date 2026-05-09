import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createClassSchema } from "@/lib/validations/academic"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { logAudit, auditUser } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageClasses", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const period = searchParams.get("period") || ""

    const where = {
      schoolId,
      ...(search
        ? {
            name: { contains: search, mode: "insensitive" as const },
          }
        : {}),
      ...(period && (period === "regular" || period === "pos_laboral")
        ? { period: period as "regular" | "pos_laboral" }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          course: { select: { id: true, name: true } },
          _count: { select: { students: true } },
        },
      }),
      prisma.class.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageClasses", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createClassSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Garantir academicYearId (do body ou do ano corrente)
    const academicYearId = parsed.data.academicYearId || await getOrDefaultAcademicYearId(schoolId)
    if (!academicYearId) {
      return NextResponse.json({ error: "Nenhum ano letivo activo. Crie ou active um ano letivo primeiro." }, { status: 400 })
    }

    const existing = await prisma.class.findFirst({
      where: { name: parsed.data.name, schoolId, academicYearId },
    })
    if (existing) {
      return NextResponse.json({ error: "Esta turma já existe nesta escola para este ano letivo" }, { status: 409 })
    }

    const { academicYearId: _, ...classData } = parsed.data
    const created = await prisma.class.create({
      data: { ...classData, academicYearId, schoolId },
    })

    logAudit({ ...auditUser(session!), action: "CREATE", entity: "Class", entityId: created.id, schoolId, description: `Turma ${classData.name} criada` })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
