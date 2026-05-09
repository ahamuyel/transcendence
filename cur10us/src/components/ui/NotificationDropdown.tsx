"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react"
import Link from "next/link"

type Notification = {
  id: string
  title: string
  message: string
  link?: string | null
  type: string
  read: boolean
  createdAt: string
}

const typeColors: Record<string, string> = {
  anuncio: "bg-indigo-500",
  tarefa: "bg-amber-500",
  nota: "bg-emerald-500",
  assiduidade: "bg-cyan-500",
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications?limit=10")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.data || [])
        setUnreadCount(d.unreadCount || 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PUT" })
    fetchNotifications()
  }

  const markAllRead = async () => {
    await fetch("/api/notifications/mark-all-read", { method: "POST" })
    fetchNotifications()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "agora"
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notificações</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium">
                <CheckCheck size={12} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-zinc-400 text-center">Sem notificações</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition ${
                    !n.read ? "bg-indigo-50/50 dark:bg-indigo-950/10" : ""
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColors[n.type] || "bg-zinc-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{n.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-400">{timeAgo(n.createdAt)}</span>
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                          <Check size={10} /> Lida
                        </button>
                      )}
                      {n.link && (
                        <Link href={n.link} onClick={() => { markAsRead(n.id); setOpen(false) }} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                          <ExternalLink size={10} /> Ver
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
