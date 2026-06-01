"use client"

import { useState, useEffect } from "react"
import { on } from "@/hooks/useWebSocket"

const onlineUsers = new Set<string>()
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((cb) => cb())
}

export function onOnlineStatusChange(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId)
}

// Listen for online_status events globally
if (typeof window !== "undefined") {
  const unsub = on("online_status", (payload: unknown) => {
    const data = payload as { userId: string; online: boolean }
    if (data.online) {
      onlineUsers.add(data.userId)
    } else {
      onlineUsers.delete(data.userId)
    }
    notifyListeners()
  })
  // Can't clean up easily at module level, but this runs once
}

export function useOnlineStatus() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const unsub = onOnlineStatusChange(() => setTick((t) => t + 1))
    return unsub
  }, [])

  return { isUserOnline }
}
