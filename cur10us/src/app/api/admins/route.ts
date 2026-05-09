import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { hashPassword } from "@/lib/password"

// GET — list secondary admins for the school
export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageAdmins",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = {
      role: "school_admin" as const,
      schoolId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          adminPermission: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST — create a secondary admin
export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageAdmins",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()

    const { name, email, password, permissions } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e palavra-passe são obrigatórios" },
        { status: 400 }
      )
    }

    // Check for existing user with the same email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está registado" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "school_admin",
        isActive: true,
        emailVerified: true,
        provider: "credentials",
        schoolId,
        adminPermission: {
          create: {
            level: "secondary",
            schoolId,
            canManageApplications: permissions?.canManageApplications ?? false,
            canManageTeachers: permissions?.canManageTeachers ?? false,
            canManageStudents: permissions?.canManageStudents ?? false,
            canManageParents: permissions?.canManageParents ?? false,
            canManageClasses: permissions?.canManageClasses ?? false,
            canManageCourses: permissions?.canManageCourses ?? false,
            canManageSubjects: permissions?.canManageSubjects ?? false,
            canManageLessons: permissions?.canManageLessons ?? false,
            canManageExams: permissions?.canManageExams ?? false,
            canManageAssignments: permissions?.canManageAssignments ?? false,
            canManageResults: permissions?.canManageResults ?? false,
            canManageAttendance: permissions?.canManageAttendance ?? false,
            canManageMessages: permissions?.canManageMessages ?? false,
            canManageAnnouncements: permissions?.canManageAnnouncements ?? false,
            canManageAdmins: permissions?.canManageAdmins ?? false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        adminPermission: true,
      },
    })

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
