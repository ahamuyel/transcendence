"use client"

import { useEffect, useRef } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { on } from "@/hooks/useWebSocket"

export default function MinhaAreaLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const user = session?.user
  const isActive = user?.isActive && !!user?.schoolId && (user?.role !== "school_admin" || user?.schoolStatus === "ativa")

  // Super admin: redirect to /admin
  // School admin with active school (status = "ativa"): redirect to dashboard
  // Any other active user with school association: redirect to dashboard
  // Exception: allow change-password page to render
  useEffect(() => {
    if (status !== "authenticated" || !user) return
    if (pathname === "/change-password") return

    if (user.role === "super_admin") {
      router.replace("/admin")
      return
    }

    if (isActive) {
      router.replace(`/dashboard/${user.id}`)
      return
    }
  }, [status, user, isActive, router, pathname])

  // Poll session every 15s while in pending state to detect approval immediately
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined)
  useEffect(() => {
    if (status === "authenticated" && user && !isActive) {
      pollingRef.current = setInterval(() => { update() }, 60000)
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [status, user, isActive, update])

  // Listen for WebSocket "session-update" events to refresh immediately
  useEffect(() => {
    const unsub = on("session-update", () => { update() })
    return unsub
  }, [update])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  // Hide content while redirecting to prevent flash
  // But allow change-password to render
  if (status === "authenticated" && pathname !== "/change-password" && (
    session?.user?.role === "super_admin" ||
    (session?.user?.isActive && session?.user?.schoolId && (session?.user?.role !== "school_admin" || session?.user?.schoolStatus === "ativa"))
  )) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
          </span>

          <div className="flex items-center gap-2">
            {session?.user?.name && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:block">
                {session.user.name}
              </span>
            )}
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="p-2 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
