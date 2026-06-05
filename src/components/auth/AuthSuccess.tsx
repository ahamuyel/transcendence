import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthSuccessProps {
  icon: LucideIcon
  iconBg?: string
  title: string
  children: React.ReactNode
  actionLabel: string
  actionHref: string
  secondaryAction?: React.ReactNode
}

export function AuthSuccess({
  icon: Icon,
  iconBg,
  title,
  children,
  actionLabel,
  actionHref,
  secondaryAction,
}: AuthSuccessProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8 text-center">
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5",
            iconBg ?? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">{title}</h1>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed space-y-2">
          {children}
        </div>
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium transition"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
        {secondaryAction && (
          <div className="mt-4">{secondaryAction}</div>
        )}
      </div>
    </div>
  )
}
