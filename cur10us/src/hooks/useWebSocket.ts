"use client"
import { useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"

type WSEvent = "notification" | "message" | "friend_request" | "friend_accepted" | "online_status" | "session-update" | "chat_message" | "messages-read" | "auth_ok" | "auth_error"

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

let wsToken: string | null = null
let tokenPromise: Promise<string> | null = null

async function getWsToken(): Promise<string> {
  if (wsToken) return wsToken
  if (tokenPromise) return tokenPromise

  tokenPromise = fetch("/api/auth/ws-token")
    .then((r) => {
      if (!r.ok) throw new Error("Failed to get WS token")
      return r.json()
    })
    .then((data) => {
      wsToken = data.token
      setTimeout(() => { wsToken = null }, 25000)
      return wsToken!
    })

  try {
    return await tokenPromise
  } finally {
    tokenPromise = null
  }
}

export function useWebSocket() {
  const { data: session } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const connectRef = useRef<() => void>(() => {})

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const host = window.location.hostname
    const url = `${protocol}//${host}:3001`

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
