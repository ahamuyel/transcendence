"use client"
import { useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"

type WSEvent = "notification" | "message" | "friend_request" | "friend_accepted" | "online_status" | "session-update" | "chat_message" | "messages-read" | "messages-delivered" | "auth_ok" | "auth_error" | "typing" | "message_read"


type WSCallback = (payload: unknown) => void

const listeners = new Map<WSEvent, Set<WSCallback>>()

export function on(event: WSEvent, cb: WSCallback) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(cb)
  return () => { listeners.get(event)?.delete(cb) }
}

export function off(event: WSEvent, cb: WSCallback) {
  listeners.get(event)?.delete(cb)
}

export function joinRoom(wsRef: React.RefObject<WebSocket | null>, conversationId: string) {
  wsRef.current?.send(JSON.stringify({ type: "join_room", roomId: conversationId }))
}
export function sendTyping(wsRef: React.RefObject<WebSocket | null>, conversationId: string, isTyping: boolean) {
  wsRef.current?.send(JSON.stringify({ type: "typing", roomId: conversationId, isTyping }))
}
export function markRead(wsRef: React.RefObject<WebSocket | null>, messageId: string, senderId: string) {
  wsRef.current?.send(JSON.stringify({ type: "message_read", messageId, senderId }))
}

let wsToken: string | null = null
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null

async function fetchToken(): Promise<string> {
  const res = await fetch("/api/auth/ws-token")
  if (!res.ok) throw new Error("Failed to get WS token")
  const data = await res.json()
  wsToken = data.token
  scheduleTokenRefresh()
  return wsToken!
}

function scheduleTokenRefresh() {
  if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer)
  tokenRefreshTimer = setTimeout(() => {
    wsToken = null
    fetchToken().catch(() => { })
  }, 240000)
}

function clearTokenRefresh() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer)
    tokenRefreshTimer = null
  }
}

async function getWsToken(): Promise<string> {
  if (wsToken) return wsToken
  return fetchToken()
}

export function useWebSocket() {
  const { data: session } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const connectRef = useRef<() => void>(() => { })

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const host = window.location.hostname
    const url = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${host}:3001`

    const ws = new WebSocket(url)

    ws.onopen = async () => {
      try {
        const token = await getWsToken()
        ws.send(JSON.stringify({ type: "auth", token }))
      } catch {
        console.error("[WS] Failed to obtain auth token")
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const cbs = listeners.get(data.event as WSEvent)
        if (cbs) {
          cbs.forEach((cb) => cb(data.payload))
        }
      } catch {
        // ignore
      }
    }

    ws.onclose = () => {
      wsRef.current = null
      wsToken = null
      reconnectRef.current = setTimeout(connectRef.current, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return
    connect()
    return () => {
      clearTokenRefresh()
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, connect])
}
