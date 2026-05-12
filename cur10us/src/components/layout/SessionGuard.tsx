"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useWebSocket } from "@/hooks/useWebSocket"

const SESSION_KEY = "cur10usx_session_alive"

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession()

  useWebSocket()

  useEffect(() => {
    if (status === "authenticated") {
      sessionStorage.setItem(SESSION_KEY, "1")
    }
  }, [status])

  return <>{children}</>
}

export default SessionGuard
