import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { sendEnrollmentComplete } from "@/lib/email"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageApplications", { requireSchool: true })
    if (authError) return authError

    const { id } = await params
    const schoolId = session!.user.schoolId!

    // Accept optional classId from request body
    let classId: string | undefined
    try {
      const body = await _req.json()
      classId = body.classId || undefined
    } catch (error) {
    console.error(`[API Error] ${error}`)
      // No body or invalid JSON — classId remains undefined
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { school: { select: { name: true } } },
    })
    if (!application || application.schoolId !== schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }
    if (application.status !== "aprovada") {
      return NextResponse.json({ error: "Solicitação precisa estar aprovada para matricular" }, { status: 400 })
    }

    // Link to existing user if one exists with that email
    const user = await prisma.user.findUnique({ where: { email: application.email } })

    if (user) {
      // Security: only update activation, school, and role — never modify email or password
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true, schoolId, role: application.role },
      })

      await prisma.application.update({
        where: { id },
        data: { status: "matriculada", userId: user.id },
      })

      // Create role-specific record if it doesn't exist
      if (application.role === "student") {
        const existingStudent = await prisma.student.findUnique({ where: { userId: user.id } })
        if (!existingStudent) {
          await prisma.student.create({
            data: {
              name: application.name,
              email: application.email,
              phone: application.phone,
              address: "",
              userId: user.id,
              schoolId,
              ...(classId ? { classId } : {}),
              ...(application.gender ? { gender: application.gender } : {}),
              ...(application.dateOfBirth ? { dateOfBirth: application.dateOfBirth } : {}),
              ...(application.documentType ? { documentType: application.documentType } : {}),
              ...(application.documentNumber ? { documentNumber: application.documentNumber } : {}),
            },
          })
        } else if (classId) {
          await prisma.student.update({ where: { id: existingStudent.id }, data: { classId } })
        }
      } else if (application.role === "teacher") {
        const existingTeacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
        if (!existingTeacher) {
          await prisma.teacher.create({
            data: {
              name: application.name,
              email: application.email,
              phone: application.phone,
              address: "",
              userId: user.id,
              schoolId,
            },
          })
        }
      } else if (application.role === "parent") {
        const existingParent = await prisma.parent.findUnique({ where: { userId: user.id } })
        if (!existingParent) {
          await prisma.parent.create({
            data: {
              name: application.name,
              email: application.email,
              phone: application.phone,
              address: "",
              userId: user.id,
              schoolId,
            },
          })
        }
      }
    } else {
      await prisma.application.update({
        where: { id },
        data: { status: "matriculada" },
      })

      // Create role-specific record without user link
      if (application.role === "student") {
        await prisma.student.create({
          data: {
            name: application.name,
            email: application.email,
            phone: application.phone,
            address: "",
            schoolId,
            ...(classId ? { classId } : {}),
            ...(application.gender ? { gender: application.gender } : {}),
            ...(application.dateOfBirth ? { dateOfBirth: application.dateOfBirth } : {}),
            ...(application.documentType ? { documentType: application.documentType } : {}),
            ...(application.documentNumber ? { documentNumber: application.documentNumber } : {}),
          },
        })
      } else if (application.role === "teacher") {
        await prisma.teacher.create({
          data: {
            name: application.name,
            email: application.email,
            phone: application.phone,
            address: "",
            schoolId,
          },
        })
      } else if (application.role === "parent") {
        await prisma.parent.create({
          data: {
            name: application.name,
            email: application.email,
            phone: application.phone,
            address: "",
            schoolId,
          },
        })
      }
    }

    try {
      await sendEnrollmentComplete(application.email, application.name, application.school.name)
    } catch (e) {
      console.error("Email error:", e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
