"use client"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { on } from "@/hooks/useWebSocket"
import { Loader2, Swords, Users, Trophy, HandFist, Hand, Scissors } from "lucide-react"

type GameMatch = {
  id: string
  player1Id: string
  player2Id: string
  player1: { id: string; name: string; image: string | null }
  player2: { id: string; name: string; image: string | null }
  status: string
  winnerId: string | null
  player1Move: string | null
  player2Move: string | null
  createdAt: string
  completedAt: string | null
}

type Friend = {
  id: string
  name: string
  image: string | null
}

type Stats = {
  total: number
  wins: number
  losses: number
  draws: number
}

const MOVES = [
  { key: "pedra", icon: HandFist, label: "Pedra", beats: "tesoura" },
  { key: "papel", icon: Hand, label: "Papel", beats: "pedra" },
  { key: "tesoura", icon: Scissors, label: "Tesoura", beats: "papel" },
]

export default function GamePage() {
  const { data: session } = useSession()
  const [games, setGames] = useState<GameMatch[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState<GameMatch | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [message, setMessage] = useState("")

  const fetchGames = useCallback(async () => {
    const res = await fetch("/api/game/match?status=pending")
    if (res.ok) {
      const json = await res.json()
      setGames(json.data)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/game/stats")
    if (res.ok) {
      const json = await res.json()
      setStats(json.data)
    }
  }, [])

  const fetchFriends = useCallback(async () => {
    const res = await fetch("/api/friends")
    if (res.ok) {
      const json = await res.json()
      setFriends(json.data?.filter((f: Friend) => f.id !== session?.user?.id) || [])
    }
  }, [session?.user?.id])

  useEffect(() => {
    Promise.all([fetchGames(), fetchStats(), fetchFriends()]).finally(() => setLoading(false))
  }, [fetchGames, fetchStats, fetchFriends])

  useEffect(() => {
    const unsub1 = on("game_invite", () => { fetchGames(); setMessage("Novo convite de jogo!") })
    const unsub2 = on("game_move", () => fetchGames())
    const unsub3 = on("game_result", () => { fetchGames(); fetchStats() })
    return () => { unsub1(); unsub2(); unsub3() }
  }, [fetchGames, fetchStats])

  const handleInvite = async (opponentId: string) => {
    const res = await fetch("/api/game/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponentId }),
    })
    if (res.ok) {
      setMessage("Convite enviado!")
      setShowInvite(false)
    } else {
      const err = await res.json()
      setMessage(err.error || "Erro ao convidar")
    }
  }

  const handleMove = async (move: string) => {
    if (!activeGame) return
    const res = await fetch("/api/game/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: activeGame.id, move }),
    })
    if (res.ok) {
      setMessage("Jogada enviada!")
      fetchGames()
    } else {
      const err = await res.json()
      setMessage(err.error || "Erro ao jogar")
    }
  }

  const startGame = async (gameId: string) => {
    const res = await fetch(`/api/game/match/${gameId}`)
    if (res.ok) {
      const json = await res.json()
      setActiveGame(json.data)
    }
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
              <Swords className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Jogo</h1>
          </div>
          <button onClick={() => setShowInvite(!showInvite)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Convidar
          </button>
        </div>

        {message && (
          <div className="mb-3 p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm" onClick={() => setMessage("")}>
            {message}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-center">
              <div className="text-xs text-zinc-500">Total</div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</div>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
              <div className="text-xs text-green-600">Vitórias</div>
              <div className="font-bold text-green-700">{stats.wins}</div>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
              <div className="text-xs text-red-600">Derrotas</div>
              <div className="font-bold text-red-700">{stats.losses}</div>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-center">
              <div className="text-xs text-yellow-600">Empates</div>
              <div className="font-bold text-yellow-700">{stats.draws}</div>
            </div>
          </div>
        )}

        {showInvite && (
          <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Convidar amigo</h3>
            <div className="flex flex-wrap gap-2">
              {friends.map((f) => (
                <button key={f.id} onClick={() => handleInvite(f.id)} className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                  {f.name}
                </button>
              ))}
              {friends.length === 0 && <p className="text-xs text-zinc-400">Nenhum amigo disponível</p>}
            </div>
          </div>
        )}

        {activeGame ? (
          <div>
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Jogo contra {activeGame.player1Id === session?.user?.id ? activeGame.player2.name : activeGame.player1.name}
            </h2>
            {activeGame.status === "completed" ? (
              <div className="text-center p-4">
                <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                <p className="text-lg font-bold">
                  {activeGame.winnerId === null ? "Empate!" : activeGame.winnerId === session?.user?.id ? "Ganhaste!" : "Perdeste!"}
                </p>
                <button onClick={() => setActiveGame(null)} className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Voltar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-zinc-500 mb-3 text-center">Escolhe a tua jogada:</p>
                <div className="flex justify-center gap-4">
                  {MOVES.map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => handleMove(key)} className="flex flex-col items-center gap-1 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                      <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Convites Pendentes
            </h2>
            {games.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum convite pendente. Convida um amigo para jogar!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {games.map((g) => {
                  const isPlayer1 = g.player1Id === session?.user?.id
                  return (
                    <div key={g.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm">{isPlayer1 ? g.player2.name : g.player1.name}</span>
                      </div>
                      {isPlayer1 ? (
                        <span className="text-xs text-yellow-600">A aguardar resposta...</span>
                      ) : (
                        <button onClick={() => startGame(g.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Jogar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
