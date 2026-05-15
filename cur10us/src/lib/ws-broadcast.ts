import { createHmac, randomBytes } from "crypto"
import WebSocket from "ws"

function generateServiceToken(): string {
  const nonce = randomBytes(16).toString("hex")
  const timestamp = Date.now().toString()
  const payload = `service:service:${timestamp}:${nonce}`
  const signature = createHmac("sha256", process.env.AUTH_SECRET!)
    .update(payload)
    .digest("hex")
  return `${payload}:${signature}`
}

function connectAndSend(msg: object) {
  try {
    const ws = new WebSocket("ws://localhost:3001")
    ws.onopen = () => {
      const token = generateServiceToken()
      ws.send(JSON.stringify({ type: "auth", token }))
      ws.send(JSON.stringify(msg))
      setTimeout(() => ws.close(), 100)
    }
    ws.onerror = () => {
      // WS server not available
    }
  } catch {
    // WS server not available
  }
}

export function broadcastToUser(userId: string, event: string, payload: unknown) {
  connectAndSend({
    type: "broadcast",
    target: "user",
    userId,
    event,
    payload,
  })
}

export function broadcastToAll(event: string, payload: unknown) {
  connectAndSend({
    type: "broadcast",
    target: "all",
    event,
    payload,
  })
}
