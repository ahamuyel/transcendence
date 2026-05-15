"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function TwoFactorGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (
      session?.user?.twoFactorEnabled &&
      !session?.user?.twoFactorVerifiedAt
    ) {
      const email = session.user.email
      router.replace(`/signin/verify-2fa?email=${encodeURIComponent(email)}`)
    }
  }, [session, router])

  return <>{children}</>
}
