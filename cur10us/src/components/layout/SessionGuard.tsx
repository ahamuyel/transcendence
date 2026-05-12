"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

/**
 * SessionGuard handles:
 * 1. Tracks active session in sessionStorage (cleared on browser close)
 * 2. No aggressive sign-out — JWT expiry handles session lifetime
 */
const SESSION_KEY = "cur10usx_session_alive"

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      sessionStorage.setItem(SESSION_KEY, "1")
    }
  }, [status])

  return <>{children}</>
}

export default SessionGuard
