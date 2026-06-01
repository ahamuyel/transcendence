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

let client: WebSocket | null = null
let connectPromise: Promise<WebSocket> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let closed = false

const queue: object[] = []

function getWsUrl(): string {
  return process.env.WS_SERVER_URL || "ws://localhost:3001"
}

async function connect(): Promise<WebSocket> {
  if (client?.readyState === WebSocket.OPEN) return client

  if (connectPromise) return connectPromise

  connectPromise = new Promise((resolve, reject) => {
    const ws = new WebSocket(getWsUrl())
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error("WS broadcast connection timeout"))
    }, 5000)

    ws.onopen = () => {
      clearTimeout(timeout)
      ws.send(JSON.stringify({ type: "auth", token: generateServiceToken() }))
      client = ws
      connectPromise = null
      flushQueue(ws)
      resolve(ws)
    }

    ws.onerror = () => {
      clearTimeout(timeout)
      client = null
      connectPromise = null
      scheduleReconnect()
      reject(new Error("WS broadcast connection failed"))
    }

    ws.onclose = () => {
      clearTimeout(timeout)
      client = null
      connectPromise = null
      if (!closed) scheduleReconnect()
    }
  })

  return connectPromise
}

function scheduleReconnect() {
  if (closed || reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connect().catch(() => {})
  }, 2000)
}

function flushQueue(ws: WebSocket) {
  while (queue.length > 0) {
    const msg = queue.shift()
    if (msg) ws.send(JSON.stringify(msg))
  }
}

async function send(msg: object) {
  if (closed) return

  try {
    const ws = await connect()
    ws.send(JSON.stringify(msg))
  } catch {
    queue.push(msg)
  }
}

export function broadcastToUser(userId: string, event: string, payload: unknown) {
  send({ type: "broadcast", target: "user", userId, event, payload })
}

export function broadcastToAll(event: string, payload: unknown) {
  send({ type: "broadcast", target: "all", event, payload })
}

export function closeBroadcastClient() {
  closed = true
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (client) {
    client.close()
    client = null
  }
  connectPromise = null
}
