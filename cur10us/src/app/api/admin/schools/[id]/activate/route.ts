import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { hashPassword } from "@/lib/password"
import crypto from "crypto"
import { sendSchoolActivated, sendSchoolActivatedExistingAdmin } from "@/lib/email"
import { getDefaultFeatures } from "@/lib/features"
import { revalidateSchoolData } from "@/lib/revalidate"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { id } = await params
    // Set default features if not already configured
    const existingSchool = await prisma.school.findUnique({ where: { id }, select: { features: true } })
    const school = await prisma.school.update({
      where: { id },
      data: {
        status: "ativa",
        ...(!existingSchool?.features && { features: getDefaultFeatures() }),
      },
    })

    // Find existing school_admin (active or inactive from self-registration)
    let admin = await prisma.user.findFirst({
      where: { schoolId: id, role: "school_admin" },
      orderBy: { createdAt: "asc" },
    })

    let tempPassword: string | null = null
    let existingAdmin = false

    if (admin && !admin.isActive) {
      // Self-registered admin — activate their account
      await prisma.user.update({
        where: { id: admin.id },
        data: { isActive: true },
      })
      existingAdmin = true
    } else if (!admin) {
      // No school_admin exists — create one using the school's email (fallback for schools created by super admin)
      tempPassword = crypto.randomBytes(6).toString("base64url") // e.g. "aB3dEf1g"
      const hashedPassword = await hashPassword(tempPassword)

      admin = await prisma.user.create({
        data: {
          name: `Admin ${school.name}`,
          email: school.email,
          hashedPassword,
          provider: "credentials",
          role: "school_admin",
          isActive: true,
          emailVerified: true,
          mustChangePassword: true,
          profileComplete: true,
          schoolId: id,
        },
      })
    }

    // Grant primary admin permissions
    await prisma.adminPermission.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        schoolId: id,
        level: "primary",
        canManageApplications: true,
        canManageTeachers: true,
        canManageStudents: true,
        canManageParents: true,
        canManageClasses: true,
        canManageCourses: true,
        canManageSubjects: true,
        canManageLessons: true,
        canManageExams: true,
        canManageAssignments: true,
        canManageResults: true,
        canManageAttendance: true,
        canManageMessages: true,
        canManageAnnouncements: true,
        canManageAdmins: true,
      },
    })

    // Send activation email
    try {
      if (tempPassword) {
        await sendSchoolActivated(school.email, school.name, tempPassword)
      } else if (existingAdmin) {
        await sendSchoolActivatedExistingAdmin(admin.email, school.name)
      }
    } catch (error) {
    console.error(`[API Error] ${error}`)
      // Email delivery failure shouldn't block activation
    }

    // Revalidate school data
    revalidateSchoolData(id)

    return NextResponse.json({
      ...school,
      adminCreated: !!tempPassword,
      existingAdmin,
      adminEmail: admin.email,
      ...(tempPassword && { tempPassword }),
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
