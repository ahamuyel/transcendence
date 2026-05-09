"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardHub() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      if (session.user.role === "super_admin") {
        router.replace("/admin")
      } else {
        router.replace(`/dashboard/${session.user.id}`)
      }
    } 
    if (status === "unauthenticated") {
      router.replace("/signin")
    }
  }, [status, session, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  )
}
