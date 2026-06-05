import Link from "next/link"
import { getPlatformConfig } from "@/lib/platform-config"
import { GraduationCap } from "lucide-react"

async function PublicBrand() {
  let name = "Cur10usX"
  try {
    const config = await getPlatformConfig()
    name = config.name
  } catch {
    /* fallback to default name when DB is unavailable */
  }
  if (name === "Cur10usX") {
    return (
      <span className="text-lg font-bold tracking-tight">
        Cur10us<span className="text-primary">X</span>
      </span>
    )
  }
  return <span className="text-lg font-bold tracking-tight">{name}</span>
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-50/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center transition-transform group-hover:scale-105">
              <GraduationCap className="w-4 h-4" />
            </div>
            <PublicBrand />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden sm:inline-flex text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary-700 transition shadow-sm"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
