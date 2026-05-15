"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Send, ArrowLeft } from "lucide-react"
import { on } from "@/hooks/useWebSocket"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

type Sender = {
  id: string
  name: string
  image: string | null
}

type Message = {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
  readAt: string | null
  sender: Sender
}

type Conversation = {
  id: string
  other: { id: string; name: string; image: string | null }
}

export default function ChatConversationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const { isUserOnline } = useOnlineStatus()

  const fetchMessages = useCallback(async (cursor?: string) => {
    const url = cursor
      ? `/api/chat/conversations/${id}/messages?cursor=${cursor}`
      : `/api/chat/conversations/${id}/messages`
    const res = await fetch(url)
    const json = await res.json()
    return json
  }, [id])

  useEffect(() => {
    Promise.all([
      fetch("/api/chat/conversations").then((r) => r.json()),
      fetchMessages(),
    ]).then(([convJson, msgJson]) => {
      const conv = convJson.data?.find((c: Conversation) => c.id === id)
      setConversation(conv || null)
      setMessages(msgJson.data || [])
      setNextCursor(msgJson.nextCursor)
    }).finally(() => setLoading(false))
  }, [id, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" })
  }, [messages])

  useEffect(() => {
    const unsub = on("chat_message", (payload: unknown) => {
      const data = payload as { conversationId: string; message: Message }
      if (data.conversationId === id) {
        setMessages((prev) => [...prev, data.message])
      }
    })
    return () => { unsub() }
  }, [id])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    const json = await fetchMessages(nextCursor)
    setMessages((prev) => [...(json.data || []), ...prev])
    setNextCursor(json.nextCursor)
    setLoadingMore(false)
  }

  useEffect(() => {
    const el = topRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, nextCursor, loadingMore])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      })
      if (res.ok) {
        const json = await res.json()
        setMessages((prev) => [...prev, json.data])
        setInput("")
      }
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const timeLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
  }

  const dateLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return "Hoje"
    if (d.toDateString() === yesterday.toDateString()) return "Ontem"
    return d.toLocaleDateString("pt-PT")
  }

  const otherUserOnline = conversation ? isUserOnline(conversation.other.id) : false

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4 h-[calc(100vh-6rem)]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => router.push("/list/chat")}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
          >
            <ArrowLeft size={18} />
          </button>
          {conversation && (
            <>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                  {conversation.other.image ? (
                    <img src={conversation.other.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    conversation.other.name?.charAt(0).toUpperCase()
                  )}
                </div>
                {otherUserOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{conversation.other.name}</p>
                {otherUserOnline && (
                  <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {nextCursor && (
            <div ref={topRef} className="text-center">
              {loadingMore && <Loader2 size={16} className="animate-spin text-zinc-400 inline" />}
            </div>
          )}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-zinc-400">Sem mensagens ainda. Envie a primeira!</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderId === session?.user?.id
            const showDate = i === 0 || dateLabel(msg.createdAt) !== dateLabel(messages[i - 1].createdAt)
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-3">
                    <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                      {dateLabel(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-indigo-200" : "text-zinc-400"}`}>
                      {timeLabel(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva uma mensagem..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
