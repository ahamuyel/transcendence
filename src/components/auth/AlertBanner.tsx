import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type AlertVariant = "error" | "success" | "warning" | "info"

interface AlertBannerProps {
  variant?: AlertVariant
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  error:
    "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  success:
    "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
  warning:
    "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  info:
    "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
}

export function AlertBanner({
  variant = "info",
  icon: Icon,
  children,
  className,
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "p-3 rounded-lg border text-sm",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {Icon && <Icon className="w-4 h-4 mt-0.5 shrink-0" />}
        <span>{children}</span>
      </div>
    </div>
  )
}
