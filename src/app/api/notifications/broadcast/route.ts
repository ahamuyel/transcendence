import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { broadcastToUser, broadcastToAll } from "@/lib/ws-broadcast"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { userId, event, payload } = await req.json()
    if (!event || !payload) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })

    broadcastToUser(userId, event, payload)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { event, payload } = await req.json()
    if (!event) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })

    broadcastToAll(event, payload)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
