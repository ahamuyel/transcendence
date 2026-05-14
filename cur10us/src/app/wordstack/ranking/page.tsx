"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function RankingPage() {
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/game/ranking")
      .then((r) => r.json())
      .then((d) => setRankings(d.rankings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto p-4">
        <header className="mb-6">
          <Link href="/wordstack" className="text-purple-300 hover:text-white text-sm">
            ← Game
          </Link>
          <h1 className="text-2xl font-bold mt-1">WordStack Rankings</h1>
        </header>

        {loading ? (
          <p className="text-center opacity-60 py-10">Loading...</p>
        ) : rankings.length === 0 ? (
          <p className="text-center opacity-60 py-10">No games played yet</p>
        ) : (
          <div className="space-y-2">
            {rankings.map((r, i) => (
              <div
                key={r.userId || r.id}
                className="flex items-center justify-between bg-white/5 rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <div>
                    <p className="font-medium">{r.user?.name || "Unknown"}</p>
                    <p className="text-sm opacity-60">
                      {r.gamesPlayed} games · {r.gamesWon} wins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{r.rating}</p>
                  <p className="text-sm opacity-60">rating</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
