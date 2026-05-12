const { WebSocketServer } = require("ws")

const wss = new WebSocketServer({ port: 3001 })

const clients = new Map()

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

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress
  console.log(`[WS] Client connected from ${ip}`)

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString())

      if (msg.type === "auth" && msg.userId) {
        ws.userId = msg.userId
        clients.set(msg.userId, ws)
        console.log(`[WS] User ${msg.userId} authenticated`)
        return
      }

      if (msg.type === "broadcast" && msg.target === "user") {
        broadcast(msg.userId, msg.event, msg.payload)
        return
      }

      if (msg.type === "broadcast" && msg.target === "all") {
        broadcastToAll(msg.event, msg.payload)
        return
      }
    } catch {
      // ignore
    }
  })

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId)
      console.log(`[WS] User ${ws.userId} disconnected`)
    }
  })

  ws.on("error", () => {
    if (ws.userId) {
      clients.delete(ws.userId)
    }
  })
})

console.log(`[WS] WebSocket server running on port 3001`)
