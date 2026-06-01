"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Super admins bypass maintenance mode
    if (session?.user?.role === "super_admin") return

    const checkMaintenance = async () => {
      try {
        const res = await fetch("/api/platform/status")
        const data = await res.json()
        if (data.maintenanceMode) {
          router.replace("/maintenance")
        }
      } catch { /* ignore */ }
    }

    checkMaintenance()
    const interval = setInterval(checkMaintenance, 30000) // re-check every 30s
    return () => clearInterval(interval)
  }, [session, router])

  return <>{children}</>
}
