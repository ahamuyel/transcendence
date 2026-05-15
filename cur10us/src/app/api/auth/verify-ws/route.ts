import { createHmac } from "crypto"

export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token || typeof token !== "string") {
    return Response.json({ valid: false }, { status: 400 })
  }

  const parts = token.split(":")
  if (parts.length !== 5) {
    return Response.json({ valid: false }, { status: 400 })
  }

  const payload = parts.slice(0, 4).join(":")
  const signature = parts[4]

  const expectedSig = createHmac("sha256", process.env.AUTH_SECRET!)
    .update(payload)
    .digest("hex")

  if (signature !== expectedSig) {
    return Response.json({ valid: false }, { status: 401 })
  }

  const timestamp = parseInt(parts[2], 10)
  if (Date.now() - timestamp > 60000) {
    return Response.json({ valid: false, error: "Token expirado" }, { status: 401 })
  }

  return Response.json({ valid: true, userId: parts[0], role: parts[1] })
}
