import { cn } from "@/lib/utils"
import { Loader2, ArrowRight } from "lucide-react"

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
}

export function SubmitButton({
  children,
  loading,
  loadingText,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={cn(
        "w-full h-10 flex items-center justify-center gap-2 rounded-lg",
        "bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200",
        "text-white dark:text-zinc-900 text-sm font-medium",
        "transition disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  )
}
