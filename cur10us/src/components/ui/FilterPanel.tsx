"use client"

import { useState, useEffect, useRef } from "react"
import { SlidersHorizontal, X } from "lucide-react"

export type FilterConfig = {
  key: string
  label: string
  type: "select" | "date" | "dateRange"
  options?: { value: string; label: string }[]
  optionsEndpoint?: string
}

interface FilterPanelProps {
  config: FilterConfig[]
  filters: Record<string, string>
  onChange: (filters: Record<string, string>) => void
  onClear: () => void
  activeCount: number
}

const FilterPanel = ({ config, filters, onChange, onClear, activeCount }: FilterPanelProps) => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({})

  // Fetch dynamic options from endpoints
  useEffect(() => {
    config.forEach((c) => {
      if (c.optionsEndpoint && !dynamicOptions[c.key]) {
        fetch(c.optionsEndpoint)
          .then((r) => r.json())
          .then((json) => {
            const items = json.data || json
            const opts = items.map((i: { id: string; name: string }) => ({ value: i.id, label: i.name }))
            setDynamicOptions((prev) => ({ ...prev, [c.key]: opts }))
          })
          .catch(() => {})
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 sm:p-2.5 rounded-xl transition active:scale-95 relative ${
          activeCount > 0
            ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        <SlidersHorizontal size={16} />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Filtros</span>
            {activeCount > 0 && (
              <button
                onClick={() => { onClear(); setOpen(false) }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {config.map((c) => {
              const opts = c.options || dynamicOptions[c.key] || []
              if (c.type === "select") {
                return (
                  <div key={c.key}>
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">{c.label}</label>
                    <select
                      value={filters[c.key] || ""}
                      onChange={(e) => handleChange(c.key, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Todos</option>
                      {opts.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )
              }
              if (c.type === "date") {
                return (
                  <div key={c.key}>
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">{c.label}</label>
                    <input
                      type="date"
                      value={filters[c.key] || ""}
                      onChange={(e) => handleChange(c.key, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )
              }
              if (c.type === "dateRange") {
                return (
                  <div key={c.key} className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">De</label>
                      <input
                        type="date"
                        value={filters[`${c.key}Start`] || ""}
                        onChange={(e) => handleChange(`${c.key}Start`, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Até</label>
                      <input
                        type="date"
                        value={filters[`${c.key}End`] || ""}
                        onChange={(e) => handleChange(`${c.key}End`, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
