import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { sendApplicationApproved } from "@/lib/email"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageApplications", { requireSchool: true })
    if (authError) return authError

    const { id } = await params
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { school: { select: { name: true } } },
    })
    if (!existing || existing.schoolId !== session!.user.schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    if (!["pendente", "em_analise"].includes(existing.status)) {
      return NextResponse.json({ error: "Solicitação não pode ser aprovada no estado atual" }, { status: 400 })
    }

    // Find or create user by email
    const user = await prisma.user.findUnique({ where: { email: existing.email } })

    await prisma.$transaction(async (tx) => {
      // Update application status
      await tx.application.update({
        where: { id },
        data: { status: "matriculada", rejectReason: null },
      })

      if (user) {
        // Update user: activate, link to school, set role
        await tx.user.update({
          where: { id: user.id },
          data: {
            isActive: true,
            emailVerified: true,
            schoolId: existing.schoolId,
            role: existing.role,
            profileComplete: true,
          },
        })

        // Create role-specific record (find by email first to avoid unique constraint)
        if (existing.role === "student") {
          let student = await tx.student.findUnique({ where: { email: existing.email } })
          if (!student) {
            student = await tx.student.create({
              data: {
                name: existing.name,
                email: existing.email,
                schoolId: existing.schoolId,
                userId: user.id,
                gender: existing.gender,
                documentType: existing.documentType,
                documentNumber: existing.documentNumber,
                dateOfBirth: existing.dateOfBirth,
              },
            })
          }
          // Link user to student if not already
          if (!student.userId) {
            await tx.student.update({ where: { id: student.id }, data: { userId: user.id } })
          }
        } else if (existing.role === "teacher") {
          let teacher = await tx.teacher.findUnique({ where: { email: existing.email } })
          if (!teacher) {
            teacher = await tx.teacher.create({
              data: {
                name: existing.name,
                email: existing.email,
                schoolId: existing.schoolId,
                userId: user.id,
              },
            })
          }
          if (!teacher.userId) {
            await tx.teacher.update({ where: { id: teacher.id }, data: { userId: user.id } })
          }
        } else if (existing.role === "parent") {
          let parent = await tx.parent.findUnique({ where: { email: existing.email } })
          if (!parent) {
            parent = await tx.parent.create({
              data: {
                name: existing.name,
                email: existing.email,
                schoolId: existing.schoolId,
                userId: user.id,
              },
            })
          }
          if (!parent.userId) {
            await tx.parent.update({ where: { id: parent.id }, data: { userId: user.id } })
          }
        } else if (existing.role === "school_admin") {
          await tx.adminPermission.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              level: "primary",
              schoolId: existing.schoolId,
            },
            update: { schoolId: existing.schoolId },
          })
        }
      }
    })

    try {
      await sendApplicationApproved(existing.email, existing.name, existing.school.name)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Approve error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
