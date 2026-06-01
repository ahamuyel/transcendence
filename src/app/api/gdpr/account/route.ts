import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const userId = session.user.id

    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { OR: [{ fromId: userId }, { toId: userId }] } })
      await tx.notification.deleteMany({ where: { userId } })
      await tx.supportTicketMessage.deleteMany({ where: { userId } })
      await tx.supportTicket.deleteMany({ where: { userId } })
      await tx.announcementRead.deleteMany({ where: { userId } })
      await tx.passwordResetToken.deleteMany({ where: { userId } })
      await tx.emailVerificationToken.deleteMany({ where: { userId } })
      await tx.dashboardPreference.deleteMany({ where: { userId } })
      await tx.userPreference.deleteMany({ where: { userId } })
      await tx.auditLog.deleteMany({ where: { userId } })
      await tx.friend.deleteMany({ where: { OR: [{ userId }, { friendId: userId }] } })

      if (session.user.role === "teacher") {
        const teacher = await tx.teacher.findUnique({ where: { userId } })
        if (teacher) {
          await tx.teacherSubject.deleteMany({ where: { teacherId: teacher.id } })
          await tx.teacherClass.deleteMany({ where: { teacherId: teacher.id } })
          await tx.teacher.delete({ where: { id: teacher.id } })
        }
      }

      if (session.user.role === "student") {
        const student = await tx.student.findUnique({ where: { userId } })
        if (student) {
          await tx.result.deleteMany({ where: { studentId: student.id } })
          await tx.attendance.deleteMany({ where: { studentId: student.id } })
          await tx.assignmentSubmission.deleteMany({ where: { studentId: student.id } })
          await tx.enrollment.deleteMany({ where: { studentId: student.id } })
          await tx.academicHistory.deleteMany({ where: { studentId: student.id } })
          await tx.cycleCertificate.deleteMany({ where: { studentId: student.id } })
          await tx.student.delete({ where: { id: student.id } })
        }
      }

      if (session.user.role === "parent") {
        const parent = await tx.parent.findUnique({ where: { userId } })
        if (parent) {
          await tx.parent.delete({ where: { id: parent.id } })
        }
      }

      if (session.user.role === "school_admin") {
        await tx.adminPermission.deleteMany({ where: { userId } })
      }

      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ success: true, message: "Conta eliminada com sucesso" })
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar conta" }, { status: 500 })
  }
}
