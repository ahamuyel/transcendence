"use client"
import { useState, useEffect, useCallback } from "react"

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(() => {
    fetch("/api/notifications?unread=true&limit=1")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount || 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  return { unreadCount, refresh }
}
