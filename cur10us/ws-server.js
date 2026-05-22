const { WebSocketServer } = require("ws")
const http = require("http")
const Redis = require("ioredis")

const WS_PORT = parseInt(process.env.WS_PORT, 10) || 3001
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

const wss = new WebSocketServer({ port: WS_PORT })
const clients = new Map()

let pub = null
let sub = null
let redisEnabled = false

function onRedisMessage(channel, message) {
  if (channel !== "ws:messages") return
  try {
    const { target, userId, event, payload } = JSON.parse(message)
    if (target === "user") {
      const client = clients.get(userId)
      if (client && client.readyState === 1) {
        client.send(JSON.stringify({ event, payload }))
      }
    } else {
      broadcastToAll(event, payload)
    }
  } catch {
    // ignore malformed messages
  }
}

function disableRedis() {
  if (!redisEnabled) return
  console.warn("[WS] Redis not available, running in single-instance mode")
  redisEnabled = false
  try { pub?.disconnect() } catch {}
  try { sub?.disconnect() } catch {}
  pub = null
  sub = null
}

function initRedis() {
  try {
    const redisOpts = {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      connectTimeout: 3000,
    }
    pub = new Redis(REDIS_URL, redisOpts)
    sub = new Redis(REDIS_URL, redisOpts)

    pub.on("error", disableRedis)
    sub.on("error", disableRedis)
    sub.on("message", onRedisMessage)

    Promise.all([pub.connect(), sub.connect()])
      .then(() => {
        redisEnabled = true
        sub.subscribe("ws:messages")
        console.log("[WS] Redis pub/sub connected")
      })
      .catch(disableRedis)
  } catch {
    disableRedis()
  }
}

function publishToRedis(msg) {
  if (pub && redisEnabled) {
    try {
      pub.publish("ws:messages", JSON.stringify(msg))
    } catch {
      // Redis not available
    }
  }
}

function broadcast(userId, event, payload) {
  const client = clients.get(userId)
  if (client && client.readyState === 1) {
    client.send(JSON.stringify({ event, payload }))
  }
}

function broadcastToAll(event, payload) {
  const msg = JSON.stringify({ event, payload })
  for (const client of clients.values()) {
    if (client.readyState === 1) {
      client.send(msg)
    }
  }
}

function verifyToken(token) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ token })
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/verify-ws",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 5000,
    }
    const req = http.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          resolve({ valid: false })
        }
      })
    })
    req.on("error", () => resolve({ valid: false }))
    req.on("timeout", () => {
      req.destroy()
      resolve({ valid: false })
    })
    req.write(data)
    req.end()
  })
}

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress
  console.log(`[WS] Client connected from ${ip}`)
  let authTimer = setTimeout(() => {
    if (!ws.userId) {
      console.log(`[WS] Client ${ip} timed out without auth`)
      ws.close(4001, "Auth timeout")
    }
  }, 10000)

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString())

      if (msg.type === "auth") {
        if (msg.token) {
          const result = await verifyToken(msg.token)
          if (result.valid && result.userId) {
            ws.userId = result.userId
            ws.userRole = result.role
            clients.set(result.userId, ws)
            clearTimeout(authTimer)
            ws.send(JSON.stringify({ event: "auth_ok", payload: { userId: result.userId } }))
            publishToRedis({ target: "all", event: "online_status", payload: { userId: result.userId, online: true } })
            broadcastToAll("online_status", { userId: result.userId, online: true })
            console.log(`[WS] User ${result.userId} (${result.role}) authenticated`)
          } else {
            ws.send(JSON.stringify({ event: "auth_error", payload: { error: "Token inválido" } }))
            console.log(`[WS] Auth failed for ${ip}`)
          }
        } else {
          ws.send(JSON.stringify({ event: "auth_error", payload: { error: "Token required" } }))
        }
        return
      }

      if (msg.type === "broadcast") {
        publishToRedis(msg)
        if (msg.target === "user") {
          broadcast(msg.userId, msg.event, msg.payload)
        } else {
          broadcastToAll(msg.event, msg.payload)
        }
        return
      }
    } catch {
      // ignore
    }
  })

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId)
      publishToRedis({ target: "all", event: "online_status", payload: { userId: ws.userId, online: false } })
      broadcastToAll("online_status", { userId: ws.userId, online: false })
      console.log(`[WS] User ${ws.userId} disconnected`)
    }
    clearTimeout(authTimer)
  })

  ws.on("error", () => {
    if (ws.userId) {
      clients.delete(ws.userId)
      publishToRedis({ target: "all", event: "online_status", payload: { userId: ws.userId, online: false } })
      broadcastToAll("online_status", { userId: ws.userId, online: false })
    }
    clearTimeout(authTimer)
  })
})

initRedis()
console.log(`[WS] WebSocket server running on port ${WS_PORT}`)
