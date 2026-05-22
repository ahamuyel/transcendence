import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow",
        secondary:
          "border-transparent bg-primary-light text-primary-dark dark:text-primary",
        destructive:
          "border-transparent bg-red-500 text-zinc-50 shadow dark:bg-red-900 dark:text-zinc-50",
        outline: "border-primary text-primary",
        success:
          "border-transparent bg-emerald-500 text-white shadow-sm",
        warning:
          "border-transparent bg-amber-500 text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
