import Link from "next/link"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-50/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              Cur10us<span className="text-indigo-600 dark:text-indigo-400">X</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              Entrar
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
              Criar conta
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  )
}
