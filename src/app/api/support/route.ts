import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createTicketSchema } from "@/lib/validations/support"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const priority = searchParams.get("priority") || ""

    const isSuperAdmin = session.user.role === "super_admin"

    const where = {
      ...(isSuperAdmin ? {} : { userId: session.user.id }),
      ...(status ? { status: status as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          school: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createTicketSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: parsed.data.subject,
        description: parsed.data.description,
        priority: parsed.data.priority || "media",
        attachment: parsed.data.attachment || null,
        userId: session.user.id,
        schoolId: session.user.schoolId || null,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
