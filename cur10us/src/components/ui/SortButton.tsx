"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type SortConfig = { field: string; dir: "asc" | "desc" }

interface SortOption {
  field: string
  label: string
}

interface SortButtonProps {
  options: SortOption[]
  sort: SortConfig | null
  onChange: (sort: SortConfig | null) => void
}

const SortButton = ({ options, sort, onChange }: SortButtonProps) => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleSelect = (field: string) => {
    if (sort?.field === field) {
      if (sort.dir === "asc") {
        onChange({ field, dir: "desc" })
      } else {
        onChange(null) // clear sort
      }
    } else {
      onChange({ field, dir: "asc" })
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 sm:p-2.5 rounded-xl transition active:scale-95 ${
          sort
            ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        <ArrowUpDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1">
          <div className="px-3 py-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Ordenar por</div>
          {options.map((opt) => {
            const isActive = sort?.field === opt.field
            return (
              <button
                key={opt.field}
                onClick={() => handleSelect(opt.field)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{opt.label}</span>
                {isActive && (
                  sort.dir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </button>
            )
          })}
          {sort && (
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full px-3 py-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800 mt-1"
            >
              Limpar ordenação
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SortButton
