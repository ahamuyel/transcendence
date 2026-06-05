"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  labelExtra?: React.ReactNode
}

export function PasswordInput({
  label,
  error,
  labelExtra,
  id,
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const inputId = id || props.name

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        {labelExtra}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          className={cn(
            "w-full h-10 rounded-lg border text-sm bg-transparent",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition disabled:opacity-50 disabled:cursor-not-allowed",
            "px-3 pr-10",
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
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition p-1"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
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
