import WebSocket from "ws"

export function broadcastToUser(userId: string, event: string, payload: unknown) {
  try {
    const ws = new WebSocket("ws://localhost:3001")
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "broadcast",
        target: "user",
        userId,
        event,
        payload,
      }))
      ws.close()
    }
    ws.onerror = () => {
      // WS server not available
    }
  } catch {
    // WS server not available
  }
}

export function broadcastToAll(event: string, payload: unknown) {
  try {
    const ws = new WebSocket("ws://localhost:3001")
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "broadcast",
        target: "all",
        event,
        payload,
      }))
      ws.close()
    }
    ws.onerror = () => {
      // WS server not available
    }
  } catch {
    // WS server not available
  }
}
