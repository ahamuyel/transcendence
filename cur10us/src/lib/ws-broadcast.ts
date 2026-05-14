import WebSocket from "ws"

const WS_URL = process.env.WS_SERVER_URL || "ws://localhost:3001"

function send(payload: Record<string, unknown>) {
  try {
    const ws = new WebSocket(WS_URL)
    ws.onopen = () => {
      ws.send(JSON.stringify(payload))
      ws.close()
    }
    ws.onerror = () => {
      // WS server not available
    }
  } catch {
    // WS server not available
  }
}

export function broadcastToUser(userId: string, event: string, payload: unknown) {
  send({ type: "broadcast", target: "user", userId, event, payload })
}

export function broadcastToAll(event: string, payload: unknown) {
  send({ type: "broadcast", target: "all", event, payload })
}
