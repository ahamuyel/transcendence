import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface AuthHeaderProps {
  icon?: LucideIcon
  iconBg?: string
  title: string
  subtitle?: string
}

export function AuthHeader({ icon: Icon, iconBg, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-6 text-center">
      {Icon && (
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
            iconBg ?? "bg-primary-50 dark:bg-primary-950/40 text-primary dark:text-primary-400",
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
