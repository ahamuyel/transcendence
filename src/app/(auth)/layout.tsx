import Link from "next/link"
import { getPlatformConfig } from "@/lib/platform-config"
import { GraduationCap } from "lucide-react"

async function PlatformName() {
  let name = "Cur10usX"
  try {
    const config = await getPlatformConfig()
    name = config.name
  } catch {
    /* fallback to default name when DB is unavailable */
  }
  if (name === "Cur10usX") {
    return (
      <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Cur10us
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          X
        </span>
      </span>
    )
  }
  return <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{name}</span>
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Subtle background pattern for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 sm:mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <PlatformName />
        </Link>

        {/* Content */}
        <div className="w-full flex flex-col items-center">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 space-y-2">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Cur10usX. Todos os direitos reservados.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 dark:text-zinc-600">
            <Link href="/termos" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
              Termos
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
            <Link href="/privacidade" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
              Privacidade
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
            <Link href="/aplicacao" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
              Sobre
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
