"use client"

import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

/**
 * SessionGuard handles:
 * 1. Auto-logout when browser is reopened (session cookie behavior)
 *    Uses sessionStorage (cleared on browser close) to detect fresh browser opens.
 */
const SESSION_KEY = "cur10usx_session_alive"

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession()

  useEffect(() => {
    if (status !== "authenticated") return

    const isReturning = sessionStorage.getItem(SESSION_KEY)

    if (!isReturning) {
      // Browser was closed and reopened — sign out to clear stale session
      signOut({ callbackUrl: "/signin" })
      return
    }
  }, [status])

  // Mark session as alive on mount (sessionStorage is cleared when browser closes)
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, "1")
  }, [])

  return <>{children}</>
}

export default SessionGuard
