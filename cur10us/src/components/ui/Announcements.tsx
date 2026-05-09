"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Megaphone, Loader2 } from "lucide-react"

const colors = [
  "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800",
  "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
]

type Announcement = {
  id: string
  title: string
  description: string
  createdAt: string
}

const Announcements = () => {
  const [data, setData] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/announcements?limit=4")
      .then((r) => r.json())
      .then((d) => setData(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-zinc-200 dark:border-zinc-800">

      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Megaphone size={16} className="text-zinc-400" />
          Avisos
        </h2>
        <Link
          href="/list/announcements"
          className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Ver todos
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-center text-zinc-400 text-sm py-6">Nenhum aviso</p>
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {data.map((item, idx) => (
            <div
              key={item.id}
              className={`${colors[idx % colors.length]} rounded-xl p-3 sm:p-4 border transition-shadow hover:shadow-sm`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm leading-snug">
                  {item.title}
                </h3>
                <span className="text-[10px] sm:text-xs text-zinc-500 bg-white/80 dark:bg-zinc-800/80 rounded-md px-1.5 py-0.5 shrink-0">
                  {new Date(item.createdAt).toLocaleDateString("pt")}
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Announcements
