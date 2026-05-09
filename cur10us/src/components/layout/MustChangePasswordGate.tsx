"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function MustChangePasswordGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (session?.user?.mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password")
    }
  }, [session, router, pathname])

  if (session?.user?.mustChangePassword && pathname !== "/change-password") {
    return null
  }

  return <>{children}</>
}
