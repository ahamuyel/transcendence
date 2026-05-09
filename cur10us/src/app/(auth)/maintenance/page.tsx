"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wrench } from "lucide-react"

export default function MaintenancePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true)
      try {
        const res = await fetch("/api/platform/status")
        const data = await res.json()
        if (!data.maintenanceMode) {
          router.replace("/")
        }
      } catch { /* ignore */ }
      setChecking(false)
    }, 15000) // check every 15s

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
          <Wrench className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Em manutenção
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          A plataforma está em manutenção programada. Voltaremos em breve com melhorias.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
          {checking ? (
            <span>A verificar...</span>
          ) : (
            <span>Verificação automática a cada 15 segundos</span>
          )}
        </div>
      </div>
    </div>
  )
}
