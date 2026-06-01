import Link from "next/link"
import { getPlatformConfig } from "@/lib/platform-config"

async function PlatformName({ small }: { small?: boolean }) {
  let name = "Cur10usX"
  try {
    const config = await getPlatformConfig()
    name = config.name
  } catch {
    /* fallback to default name when DB is unavailable */
  }
  const cls = small ? "text-xs" : "text-2xl font-bold tracking-tight"
  if (name === "Cur10usX") {
    return (
      <span className={cls}>
        Cur10us
        <span className={small ? "" : "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"}>
          X
        </span>
      </span>
    )
  }
  return <span className={cls}>{name}</span>
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-6 lg:p-10">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="w-full flex flex-col items-center">
        {/* Logo - centered, fixed width */}
        <div className="w-full max-w-sm mb-6 sm:mb-8">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <PlatformName />
            </Link>
          </div>
        </div>

        {/* Content area - flexible width, pages control their own */}
        <div className="w-full flex flex-col items-center px-4  sm:px-0">
          {children}
        </div>

        {/* Footer */}
        <div className="w-full max-w-sm mt-6 sm:mt-8">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} <PlatformName small />. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
