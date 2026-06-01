import { NextResponse } from "next/server"
import { put, del } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Ficheiro é obrigatório" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato inválido. Use JPEG, PNG ou WebP" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ficheiro demasiado grande. Máximo 2MB" }, { status: 400 })
    }

    // Get current user to find old photo URL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true, role: true },
    })

    // Upload to Vercel Blob
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `profiles/${session.user.id}-${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: "public", addRandomSuffix: true })
    const photoUrl = blob.url

    // Delete old blob if it was a Vercel Blob URL
    if (user?.image?.includes("vercel-storage.com")) {
      del(user.image).catch(() => {})
    }

    // Update User.image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: photoUrl },
    })

    // Update role-specific entity foto
    const role = user?.role || session.user.role
    if (role === "teacher") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } })
      if (teacher) {
        await prisma.teacher.update({ where: { id: teacher.id }, data: { foto: photoUrl } })
      }
    } else if (role === "student") {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
      if (student) {
        await prisma.student.update({ where: { id: student.id }, data: { foto: photoUrl } })
      }
    } else if (role === "parent") {
      const parent = await prisma.parent.findUnique({ where: { userId: session.user.id } })
      if (parent) {
        await prisma.parent.update({ where: { id: parent.id }, data: { foto: photoUrl } })
      }
    }

    return NextResponse.json({ url: photoUrl })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro ao enviar foto" }, { status: 500 })
  }
}
