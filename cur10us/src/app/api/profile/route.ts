import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateProfileSchema } from "@/lib/validations/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true, image: true, schoolId: true },
    })
    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 })
    }

    const role = user.role
    const schoolId = user.schoolId

    if (role === "school_admin" && schoolId) {
      const [school, classes, students, teachers] = await Promise.all([
        prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, city: true } }),
        prisma.class.count({ where: { schoolId } }),
        prisma.student.count({ where: { schoolId } }),
        prisma.teacher.count({ where: { schoolId } }),
      ])
      return NextResponse.json({ user, school, stats: { classes, students, teachers } })
    }

    if (role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: {
          id: true, phone: true, address: true, foto: true,
          teacherSubjects: { select: { subject: { select: { name: true } } } },
          teacherClasses: { select: { class: { select: { name: true } } } },
        },
      })
      return NextResponse.json({
        user,
        teacher: teacher ? {
          phone: teacher.phone,
          address: teacher.address,
          foto: teacher.foto,
          subjects: teacher.teacherSubjects.map((ts) => ts.subject.name),
          classes: teacher.teacherClasses.map((tc) => tc.class.name),
        } : null,
      })
    }

    if (role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        select: {
          id: true, phone: true, address: true, foto: true, gender: true, dateOfBirth: true,
          class: { select: { name: true } },
          _count: { select: { results: true } },
        },
      })
      return NextResponse.json({
        user,
        student: student ? {
          id: student.id,
          phone: student.phone,
          address: student.address,
          foto: student.foto,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
          className: student.class?.name ?? null,
          resultsCount: student._count.results,
        } : null,
      })
    }

    if (role === "parent") {
      const parent = await prisma.parent.findUnique({
        where: { userId: user.id },
        select: {
          id: true, phone: true, address: true, foto: true,
          students: { select: { id: true, name: true, class: { select: { name: true } } } },
        },
      })
      return NextResponse.json({
        user,
        parent: parent ? {
          phone: parent.phone,
          address: parent.address,
          foto: parent.foto,
          students: parent.students.map((s) => ({ id: s.id, name: s.name, className: s.class?.name })),
        } : null,
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, phone, address, gender, dateOfBirth } = parsed.data
    const role = session.user.role

    // Update user name if provided
    if (name) {
      await prisma.user.update({ where: { id: session.user.id }, data: { name } })
    }

    // Update role-specific entity
    if (role === "teacher") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } })
      if (teacher) {
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: {
            ...(name ? { name } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(address !== undefined ? { address } : {}),
          },
        })
      }
    } else if (role === "student") {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
      if (student) {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            ...(name ? { name } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(address !== undefined ? { address } : {}),
            ...(gender !== undefined ? { gender: gender as "masculino" | "feminino" | null } : {}),
            ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
          },
        })
      }
    } else if (role === "parent") {
      const parent = await prisma.parent.findUnique({ where: { userId: session.user.id } })
      if (parent) {
        await prisma.parent.update({
          where: { id: parent.id },
          data: {
            ...(name ? { name } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(address !== undefined ? { address } : {}),
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
