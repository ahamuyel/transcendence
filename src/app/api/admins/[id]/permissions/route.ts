import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

// PUT — update permissions for a secondary admin
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageAdmins",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { adminPermission: true },
    })

    if (!existing || existing.role !== "school_admin" || existing.schoolId !== schoolId) {
      return NextResponse.json(
        { error: "Administrador não encontrado" },
        { status: 404 }
      )
    }

    // Cannot modify a primary admin's permissions
    if (existing.adminPermission?.level === "primary") {
      return NextResponse.json(
        { error: "Não é possível alterar as permissões de um administrador principal" },
        { status: 403 }
      )
    }

    if (!existing.adminPermission) {
      return NextResponse.json(
        { error: "Registo de permissões não encontrado" },
        { status: 404 }
      )
    }

    const body = await req.json()

    // Only allow known permission keys
    const allowedKeys = [
      "canManageApplications",
      "canManageTeachers",
      "canManageStudents",
      "canManageParents",
      "canManageClasses",
      "canManageCourses",
      "canManageSubjects",
      "canManageLessons",
      "canManageExams",
      "canManageAssignments",
      "canManageResults",
      "canManageAttendance",
      "canManageMessages",
      "canManageAnnouncements",
      "canManageAdmins",
    ]

    const updateData: Record<string, boolean> = {}
    for (const key of allowedKeys) {
      if (typeof body[key] === "boolean") {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhuma permissão válida fornecida" },
        { status: 400 }
      )
    }

    const updatedPermission = await prisma.adminPermission.update({
      where: { userId: id },
      data: updateData,
    })

    return NextResponse.json(updatedPermission)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
