import { auth } from "@/lib/auth"
import { createHmac, randomBytes } from "crypto"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 })
  }

  const nonce = randomBytes(16).toString("hex")
  const timestamp = Date.now().toString()
  const payload = `${session.user.id}:${session.user.role || "unknown"}:${timestamp}:${nonce}`
  const signature = createHmac("sha256", process.env.AUTH_SECRET!)
    .update(payload)
    .digest("hex")

  return Response.json({ token: `${payload}:${signature}` })
}
