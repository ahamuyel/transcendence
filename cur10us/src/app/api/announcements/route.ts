import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createAnnouncementSchema } from "@/lib/validations/academic"
import { createNotification, notifySchoolUsers, notifyClassStudents, notifyCourseStudents } from "@/lib/notifications"
import { buildOrderBy } from "@/lib/query-helpers"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageAnnouncements", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const role = session!.user.role
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const priority = searchParams.get("priority") || ""
    const classId = searchParams.get("classId") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { schoolId }

    // Admins and teachers see all announcements (including scheduled/unpublished)
    // Students and parents only see published or past-scheduled announcements
    if (role === "student" || role === "parent") {
      where.OR = [
        { publishedAt: { not: null, lte: new Date() } },
        { publishedAt: null, scheduledAt: null },
        { publishedAt: null, scheduledAt: { lte: new Date() } },
      ]
    }

    if (priority) where.priority = priority
    if (classId) where.classId = classId

    // For students: also filter by visibility scope
    if (role === "student") {
      const student = await prisma.student.findFirst({ where: { userId, schoolId }, select: { classId: true, class: { select: { courseId: true } } } })
      where.AND = [
        {
          OR: [
            { classId: null, courseId: null, targetUserId: null },
            ...(student?.classId ? [{ classId: student.classId }] : []),
            ...(student?.class?.courseId ? [{ courseId: student.class.courseId }] : []),
            { targetUserId: userId },
          ],
        },
      ]
    }

    const orderBy = buildOrderBy(searchParams, ["createdAt", "priority", "scheduledAt", "title"], { createdAt: "desc" })

    const [data, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          class: { select: { id: true, name: true } },
          course: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
          _count: { select: { reads: true } },
          reads: { where: { userId }, select: { id: true } },
        },
      }),
      prisma.announcement.count({ where }),
    ])

    const enriched = data.map((a) => ({
      ...a,
      readCount: a._count.reads,
      isRead: a.reads.length > 0,
      _count: undefined,
      reads: undefined,
    }))

    return NextResponse.json({ data: enriched, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageAnnouncements", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const authorId = session!.user.id
    const body = await req.json()
    const parsed = createAnnouncementSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { scheduledAt, ...rest } = parsed.data

    const created = await prisma.announcement.create({
      data: {
        ...rest,
        authorId,
        schoolId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: scheduledAt ? null : new Date(),
      },
    })

    // Create notifications for recipients if published now (non-blocking)
    if (!scheduledAt) {
      try {
        const link = `/list/announcements`
        const notifTitle = `Novo aviso: ${created.title}`
        const notifMsg = created.description.slice(0, 100)

        if (created.targetUserId) {
          await createNotification({ userId: created.targetUserId, title: notifTitle, message: notifMsg, type: "anuncio", link, schoolId })
        } else if (created.classId) {
          await notifyClassStudents(created.classId, schoolId, notifTitle, notifMsg, "anuncio", link)
        } else if (created.courseId) {
          await notifyCourseStudents(created.courseId, schoolId, notifTitle, notifMsg, "anuncio", link)
        } else {
          await notifySchoolUsers(schoolId, notifTitle, notifMsg, "anuncio", link)
        }
      } catch (e) {
        console.error("Falha ao enviar notificações do anúncio:", e)
      }
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
