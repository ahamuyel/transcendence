"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Loader2, MessageSquare, ArrowRight } from "lucide-react"
import { on } from "@/hooks/useWebSocket"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

type OtherUser = {
  id: string
  name: string
  image: string | null
}

type LastMessage = {
  text: string
  createdAt: string
  senderId: string
}

type Conversation = {
  id: string
  other: OtherUser
  lastMessage: LastMessage | null
  lastMessageAt: string | null
  createdAt: string
  unreadCount?: number
}

export default function ChatListPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { isUserOnline } = useOnlineStatus()

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/chat/conversations")
    if (res.ok) {
      const json = await res.json()
      setConversations(json.data)
    }
  }, [])

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false))
  }, [fetchConversations])

  useEffect(() => {
    const unsub = on("chat_message", () => fetchConversations())
    return () => { unsub() }
  }, [fetchConversations])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "agora"
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return d.toLocaleDateString("pt-PT")
  }

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Chat</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">As suas conversas</p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Nenhuma conversa ainda</p>
            <p className="text-xs text-zinc-400 mt-1">Adicione amigos para começar a conversar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((c) => {
              const online = isUserOnline(c.other.id)
              return (
                <Link
                  key={c.id}
                  href={`/list/chat/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                      {c.other.image ? (
                        <img src={c.other.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        c.other.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{c.other.name}</p>
                      {online && (
                        <span className="text-[10px] text-emerald-500 font-medium">Online</span>
                      )}
                    </div>
                    {c.lastMessage && (
                      <p className="text-xs text-zinc-400 truncate">
                        {c.lastMessage.senderId === session?.user?.id ? "Você: " : ""}
                        {c.lastMessage.text}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.unreadCount ? (
                      <span className="text-xs font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    ) : c.lastMessageAt ? (
                      <span className="text-xs text-zinc-400">{timeAgo(c.lastMessageAt)}</span>
                    ) : null}
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-indigo-500 transition" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
