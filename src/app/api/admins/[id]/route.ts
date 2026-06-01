import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

// GET — get a single admin by id
export async function GET(
  _req: Request,
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

    const admin = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
        adminPermission: true,
      },
    })

    if (!admin || admin.role !== "school_admin" || admin.schoolId !== schoolId) {
      return NextResponse.json(
        { error: "Administrador não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT — update admin name, email, and/or permissions
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

    const body = await req.json()
    const { name, email, permissions } = body

    // Check email uniqueness if changing email
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        return NextResponse.json(
          { error: "Este e-mail já está registado" },
          { status: 409 }
        )
      }
    }

    const admin = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(permissions && existing.adminPermission
          ? {
              adminPermission: {
                update: {
                  canManageApplications: permissions.canManageApplications,
                  canManageTeachers: permissions.canManageTeachers,
                  canManageStudents: permissions.canManageStudents,
                  canManageParents: permissions.canManageParents,
                  canManageClasses: permissions.canManageClasses,
                  canManageCourses: permissions.canManageCourses,
                  canManageSubjects: permissions.canManageSubjects,
                  canManageLessons: permissions.canManageLessons,
                  canManageExams: permissions.canManageExams,
                  canManageAssignments: permissions.canManageAssignments,
                  canManageResults: permissions.canManageResults,
                  canManageAttendance: permissions.canManageAttendance,
                  canManageMessages: permissions.canManageMessages,
                  canManageAnnouncements: permissions.canManageAnnouncements,
                  canManageAdmins: permissions.canManageAdmins,
                },
              },
            }
          : {}),
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

    return NextResponse.json(admin)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE — soft-delete a secondary admin
export async function DELETE(
  _req: Request,
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

    // Cannot delete a primary admin
    if (existing.adminPermission?.level === "primary") {
      return NextResponse.json(
        { error: "Não é possível remover o administrador principal" },
        { status: 403 }
      )
    }

    // Delete the admin permission record and deactivate the user
    await prisma.$transaction([
      prisma.adminPermission.delete({ where: { userId: id } }),
      prisma.user.update({ where: { id }, data: { isActive: false } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
