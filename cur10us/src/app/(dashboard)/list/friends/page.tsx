"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2, UserPlus, UserCheck, Trash2, Clock, UserX } from "lucide-react"

type Friend = {
  id: string
  friend: { id: string; name: string; image: string | null; role: string }
  status: string
  createdAt: string
}

type FriendRequest = {
  id: string
  requester: { id: string; name: string; image: string | null }
  createdAt: string
}

export default function FriendsPage() {
  const { data: session } = useSession()
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [addEmail, setAddEmail] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [tab, setTab] = useState<"friends" | "requests" | "add">("friends")

  const fetchFriends = async () => {
    const res = await fetch("/api/friends?status=accepted")
    if (res.ok) {
      const json = await res.json()
      setFriends(json.data)
    }
  }

  const fetchRequests = async () => {
    const res = await fetch("/api/friends/requests")
    if (res.ok) {
      const json = await res.json()
      setRequests(json.data)
    }
  }

  useEffect(() => {
    Promise.all([fetchFriends(), fetchRequests()]).finally(() => setLoading(false))
  }, [])

  const handleAddFriend = async () => {
    if (!addEmail.trim()) return
    setAddLoading(true)
    try {
      const userRes = await fetch(`/api/user?email=${encodeURIComponent(addEmail)}`)
      if (!userRes.ok) {
        alert("Utilizador não encontrado")
        return
      }
      const userData = await userRes.json()
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: userData.id, schoolId: session?.user?.schoolId || "" }),
      })
      if (res.ok) {
        setAddEmail("")
        alert("Pedido de amizade enviado!")
      } else {
        const err = await res.json()
        alert(err.error || "Erro ao adicionar")
      }
    } catch {
      alert("Erro de conexão")
    } finally {
      setAddLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    const res = await fetch("/api/friends", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    })
    if (res.ok) {
      setFriends((prev) => prev.filter((f) => f.friend.id !== friendId))
    }
  }

  const handleRequestAction = async (id: string, action: "accept" | "reject") => {
    const res = await fetch("/api/friends/requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id))
      if (action === "accept") fetchFriends()
    }
  }

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "Super Admin",
      school_admin: "Admin",
      teacher: "Professor",
      student: "Aluno",
      parent: "Encarregado",
    }
    return map[role] || role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Amigos</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Gerencie a sua rede de contactos</p>

        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 w-fit mb-4">
          {(["friends", "requests", "add"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                tab === t
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {t === "friends" && "Amigos"}
              {t === "requests" && `Pedidos (${requests.length})`}
              {t === "add" && "Adicionar"}
            </button>
          ))}
        </div>

        {tab === "friends" && (
          <div className="space-y-2">
            {friends.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">Nenhum amigo adicionado</p>
            ) : (
              friends.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                      {f.friend.image ? (
                        <img src={f.friend.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        f.friend.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{f.friend.name}</p>
                      <p className="text-xs text-zinc-400">{roleLabel(f.friend.role)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(f.friend.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition"
                    title="Remover amigo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "requests" && (
          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">Nenhum pedido pendente</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400 overflow-hidden">
                      {r.requester.image ? (
                        <img src={r.requester.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        r.requester.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.requester.name}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Clock size={12} />
                        <span>Pedido pendente</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestAction(r.id, "accept")}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      <UserCheck size={14} className="inline mr-1" />
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleRequestAction(r.id, "reject")}
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 transition"
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "add" && (
          <div className="max-w-md">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              E-mail do utilizador
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddFriend}
                disabled={addLoading || !addEmail.trim()}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {addLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
