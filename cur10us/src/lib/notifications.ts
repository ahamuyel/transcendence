import { prisma } from "@/lib/prisma"

type NotificationData = {
  userId: string
  title: string
  message: string
  link?: string
  type: string
  schoolId: string
}

export async function createNotification(data: NotificationData) {
  return prisma.notification.create({ data })
}

export async function notifySchoolUsers(schoolId: string, title: string, message: string, type: string, link?: string) {
  const users = await prisma.user.findMany({
    where: { schoolId, isActive: true },
    select: { id: true },
  })
  if (!users.length) return
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, title, message, type, link, schoolId })),
  })
}

export async function notifyClassStudents(classId: string, schoolId: string, title: string, message: string, type: string, link?: string) {
  const students = await prisma.student.findMany({
    where: { classId, schoolId },
    select: { userId: true },
  })
  const userIds = students.map((s) => s.userId).filter(Boolean) as string[]
  if (!userIds.length) return
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, title, message, type, link, schoolId })),
  })
}

export async function notifyCourseStudents(courseId: string, schoolId: string, title: string, message: string, type: string, link?: string) {
  const classes = await prisma.class.findMany({
    where: { courseId, schoolId },
    select: { id: true },
  })
  const classIds = classes.map((c) => c.id)
  if (!classIds.length) return
  const students = await prisma.student.findMany({
    where: { classId: { in: classIds }, schoolId },
    select: { userId: true },
  })
  const userIds = students.map((s) => s.userId).filter(Boolean) as string[]
  if (!userIds.length) return
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, title, message, type, link, schoolId })),
  })
}
