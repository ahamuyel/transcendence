"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { Clock } from "lucide-react"
import { on } from "@/hooks/useWebSocket"

export default function PendingAccountGate({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const router = useRouter()

  const user = session?.user
  const isSuperAdmin = user?.role === "super_admin"
  const isSchoolAdmin = user?.role === "school_admin"

  // Redirect inactive non-school_admin users to /minha-area
  // Also redirect active users without schoolId (except super_admin and school_admin)
  const shouldRedirect =
    user &&
    !isSuperAdmin &&
    !isSchoolAdmin &&
    (!user.isActive || !user.schoolId)

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/minha-area")
    }
  }, [shouldRedirect, router])

  // Poll session every 15s while in pending state to detect approval immediately
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined)
  useEffect(() => {
    if (shouldRedirect) {
      pollingRef.current = setInterval(() => { update() }, 60000)
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [shouldRedirect, update])

  // Listen for WebSocket "session-update" events to refresh immediately
  useEffect(() => {
    const unsub = on("session-update", () => { update() })
    return unsub
  }, [update])

  if (shouldRedirect) {
    return null
  }

  // Inline pending screen for school_admin with inactive school
  if (user && isSchoolAdmin && user.schoolStatus !== "ativa") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Escola pendente de análise
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            A sua escola está pendente de análise pela equipa Cur10usX. Receberá um e-mail quando a escola for aprovada e activada.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
