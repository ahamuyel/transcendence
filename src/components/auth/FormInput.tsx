import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: LucideIcon
  rightElement?: React.ReactNode
}

export function FormInput({
  label,
  error,
  icon: Icon,
  rightElement,
  id,
  className,
  disabled,
  ...props
}: FormInputProps) {
  const inputId = id || props.name

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full h-10 rounded-lg border text-sm bg-transparent",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition disabled:opacity-50 disabled:cursor-not-allowed",
            Icon ? "pl-9 pr-3" : "px-3",
            rightElement ? "pr-10" : "",
            error
              ? "border-red-400 dark:border-red-600"
              : "border-zinc-300 dark:border-zinc-700",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          disabled={disabled}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-600 dark:text-red-400 mt-1.5"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
