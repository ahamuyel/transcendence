"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LobbyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((d) => setTournaments(d.tournaments || []))
      .catch(() => {})
  }, [])

  function challengePlayer(userId: string, name: string) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
    const ws = new WebSocket(wsUrl)
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "auth",
          userId: session?.user?.id,
        })
      )
      ws.send(
        JSON.stringify({
          type: "game_invite",
          targetUserId: userId,
          fromUserId: session?.user?.id,
          fromName: session?.user?.name,
          matchId: crypto.randomUUID(),
        })
      )
      ws.close()
    }
    router.push(`/wordstack?invite=${userId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <div>
            <Link href="/wordstack" className="text-purple-300 hover:text-white text-sm">
              ← Game
            </Link>
            <h1 className="text-2xl font-bold">WordStack Lobby</h1>
          </div>
          <Link
            href="/wordstack"
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Quick Play
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Online Players</h2>
            {loading ? (
              <p className="opacity-60">Loading...</p>
            ) : users.length === 0 ? (
              <p className="opacity-60">No other players online</p>
            ) : (
              <div className="space-y-2">
                {users
                  .filter((u) => u.id !== session?.user?.id)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span>{user.name}</span>
                      </div>
                      <button
                        onClick={() => challengePlayer(user.id, user.name)}
                        className="px-3 py-1 bg-purple-600 rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Challenge
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Tournaments</h2>
            {tournaments.length === 0 ? (
              <div>
                <p className="opacity-60 mb-4">No active tournaments</p>
                <button
                  onClick={async () => {
                    await fetch("/api/tournaments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: `Tournament #${Date.now()}`,
                        maxPlayers: 8,
                      }),
                    })
                    router.refresh()
                  }}
                  className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Create Tournament
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tournaments.map((t: any) => (
                  <div
                    key={t.id}
                    className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm opacity-60">
                        {t._count?.players || 0}/{t.maxPlayers} players
                      </p>
                    </div>
                    <button
                      disabled={
                        t.status !== "registration" ||
                        (t._count?.players || 0) >= t.maxPlayers
                      }
                      onClick={async () => {
                        await fetch(`/api/tournaments/${t.id}/join`, {
                          method: "POST",
                        })
                        router.refresh()
                      }}
                      className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-30 text-sm"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
