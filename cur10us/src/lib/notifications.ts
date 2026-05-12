import { prisma } from "@/lib/prisma"

type NotificationData = {
  userId: string
  title: string
  message: string
  link?: string
  type: string
  schoolId: string
}

async function wsNotify(userId: string, title: string, message: string, link?: string) {
  try {
    const { broadcastToUser } = await import("@/lib/ws-broadcast")
    broadcastToUser(userId, "notification", { title, message, link })
  } catch {
    // WS not available
  }
}

export async function createNotification(data: NotificationData) {
  const notif = await prisma.notification.create({ data })
  wsNotify(data.userId, data.title, data.message, data.link)
  return notif
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
  users.forEach((u) => wsNotify(u.id, title, message, link))
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
