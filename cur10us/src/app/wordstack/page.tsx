"use client"
import { useSession } from "next-auth/react"
import { useWebSocket, on } from "@/hooks/useWebSocket"
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Cell = {
  letter: string | null
  special: { type: string; label: string } | null
  r: number
  c: number
}

type Grid = Cell[][]

type FoundWord = {
  word: string
  points: number
  stolen: boolean
  doubled: boolean
}

export default function WordStackPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [matchId, setMatchId] = useState<string | null>(null)
  const [grid, setGrid] = useState<Grid | null>(null)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [currentTurn, setCurrentTurn] = useState<string | null>(null)
  const [myWords, setMyWords] = useState<FoundWord[]>([])
  const [opponentWords, setOpponentWords] = useState<FoundWord[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [status, setStatus] = useState<"idle" | "waiting" | "playing" | "finished">("idle")
  const [result, setResult] = useState<any>(null)
  const [selectedPath, setSelectedPath] = useState<{ r: number; c: number }[]>([])
  const [message, setMessage] = useState("")
  const wsRef = useRef<WebSocket | null>(null)

  const connectWS = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
    const ws = new WebSocket(url)
    ws.onopen = () => {
      if (session?.user?.id) {
        ws.send(JSON.stringify({ type: "auth", userId: session.user.id }))
      }
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWSMessage(data)
    }
    ws.onclose = () => {
      setTimeout(connectWS, 3000)
    }
    wsRef.current = ws
  }, [session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id) return
    connectWS()
    return () => {
      wsRef.current?.close()
    }
  }, [session, connectWS])

  const send = useCallback((msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  function handleWSMessage(data: any) {
    const { event, payload } = data

    switch (event) {
      case "game_start":
        setGrid(payload.grid)
        setMatchId(payload.matchId)
        setCurrentTurn(payload.currentTurn)
        setScore(0)
        setOpponentScore(0)
        setMyWords([])
        setOpponentWords([])
        setStatus("playing")
        setMessage("Game started!")
        break

      case "game_word_accepted":
        setScore(payload.scores[session?.user?.id || ""])
        setOpponentScore(
          payload.scores[
            session?.user?.id === payload.nextTurn ? currentTurn || "" : session?.user?.id || ""
          ]
        )
        setCurrentTurn(payload.nextTurn)
        setMyWords(payload.foundWords?.[session?.user?.id || ""] || myWords)
        setOpponentWords(
          payload.foundWords?.[
            session?.user?.id === payload.nextTurn
              ? opponentWords.length > 0
                ? Object.keys(payload.foundWords).find((k) => k !== session?.user?.id) || ""
                : ""
              : ""
          ] || opponentWords
        )
        setMessage(`+${payload.points} pts! ${payload.doubled ? "★ DOUBLED!" : ""}`)
        setSelectedPath([])
        break

      case "game_skulled":
        setCurrentTurn(payload.nextTurn)
        setScore(payload.scores[session?.user?.id || ""])
        setOpponentScore(
          payload.scores[
            Object.keys(payload.scores).find((k) => k !== session?.user?.id) || ""
          ]
        )
        setMessage("💀 SKULL! Turn lost!")
        break

      case "game_skipped":
        setCurrentTurn(payload.nextTurn)
        setMessage(payload.userId === session?.user?.id ? "⏭ Skipped" : "Opponent skipped")
        break

      case "game_tick":
        setTimeLeft(Math.ceil(payload.remaining / 1000))
        break

      case "game_over":
        setStatus("finished")
        setResult(payload)
        setMessage(
          payload.winnerId === session?.user?.id
            ? "🎉 You won!"
            : payload.winnerId === null
              ? "Draw!"
              : "😢 You lost!"
        )
        break

      case "game_error":
        setMessage(`⚠ ${payload.error}`)
        break
    }
  }

  function handleCellClick(r: number, c: number) {
    if (currentTurn !== session?.user?.id || status !== "playing") return

    setSelectedPath((prev) => {
      const last = prev[prev.length - 1]
      if (last?.r === r && last?.c === c) {
        // Deselect
        return prev.slice(0, -1)
      }
      if (last) {
        const dr = Math.abs(last.r - r)
        const dc = Math.abs(last.c - c)
        if (dr > 1 || dc > 1) return [grid?.[r]?.[c] ? { r, c } : prev]
        if (prev.some((p) => p.r === r && p.c === c)) return prev
      }
      return [...prev, { r, c }]
    })
  }

  function submitWord() {
    if (!grid || selectedPath.length < 2) return
    const word = selectedPath
      .map((p) => {
        const cell = grid[p.r][p.c]
        return cell.letter || cell.special?.label || "?"
      })
      .join("")

    send({
      type: "game_submit_word",
      matchId,
      word,
      path: selectedPath,
    })
  }

  function skipTurn() {
    send({ type: "game_skip", matchId })
  }

  function giveUp() {
    if (confirm("Give up?")) {
      send({ type: "game_give_up", matchId })
    }
  }

  function startMatch(player2Id?: string) {
    const id = crypto.randomUUID()
    setMessage("Creating match...")
    send({
      type: "game_create",
      matchId: id,
      player1Id: session?.user?.id,
      player2Id: player2Id || "ai",
    })
  }

  useEffect(() => {
    if (status !== "idle" || !session?.user?.id) return
    if (typeof window !== "undefined" && !window.location.search.includes("invite=")) {
      // Quick play: find opponent or wait
      startMatch()
    }
  }, [status, session])

  const isMyTurn = currentTurn === session?.user?.id
  const opponentId =
    grid &&
    Object.keys(
      result?.scores || { [session?.user?.id || ""]: 0, opponent: 0 }
    ).find((k) => k !== session?.user?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <div>
            <Link href="/" className="text-purple-300 hover:text-white text-sm">
              ← Home
            </Link>
            <h1 className="text-2xl font-bold">WordStack</h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/wordstack/lobby"
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-sm"
            >
              Lobby
            </Link>
            <Link
              href="/wordstack/ranking"
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-sm"
            >
              Ranking
            </Link>
          </div>
        </header>

        {message && (
          <div className="text-center mb-4 text-lg font-semibold animate-pulse">
            {message}
          </div>
        )}

        {status === "waiting" && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-bounce">⏳</div>
            <p className="text-xl">Searching for opponent...</p>
          </div>
        )}

        {status === "playing" && grid && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <p className="text-sm opacity-70">You</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-lg">⏱ {timeLeft}s</p>
                {isMyTurn ? (
                  <span className="text-green-400 text-sm animate-pulse">Your turn</span>
                ) : (
                  <span className="text-yellow-400 text-sm">Opponent's turn...</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm opacity-70">Opponent</p>
                <p className="text-2xl font-bold">{opponentScore}</p>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(5, 1fr)` }}>
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const isSelected = selectedPath.some((p) => p.r === r && p.c === c)
                    const isStart = selectedPath[0]?.r === r && selectedPath[0]?.c === c
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        disabled={!isMyTurn}
                        className={`
                          w-16 h-16 rounded-xl text-2xl font-bold
                          transition-all duration-150
                          ${isSelected
                            ? "bg-green-500 scale-110 shadow-lg shadow-green-500/50"
                            : isStart
                              ? "bg-blue-500"
                              : "bg-white/10 hover:bg-white/20"
                          }
                          ${!isMyTurn ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                          ${cell.special?.type === "double" ? "ring-2 ring-yellow-400" : ""}
                          ${cell.special?.type === "skull" ? "ring-2 ring-red-500" : ""}
                        `}
                      >
                        {cell.special?.label || cell.letter || ""}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={submitWord}
                disabled={!isMyTurn || selectedPath.length < 2}
                className="px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                Submit Word ({selectedPath.length} letters)
              </button>
              <button
                onClick={skipTurn}
                disabled={!isMyTurn}
                className="px-6 py-3 bg-yellow-600 rounded-xl hover:bg-yellow-700 disabled:opacity-30 font-bold"
              >
                Skip ⏭
              </button>
              <button
                onClick={giveUp}
                className="px-6 py-3 bg-red-600/50 rounded-xl hover:bg-red-700/70 font-bold text-sm"
              >
                Give Up
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Your words</h3>
                <div className="flex flex-wrap gap-2">
                  {myWords.map((w, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded text-sm ${
                        w.stolen ? "bg-red-600/50" : w.doubled ? "bg-yellow-600/50" : "bg-white/10"
                      }`}
                    >
                      {w.word} {w.doubled && "★"} {w.stolen && "(stolen!)"}{" "}
                      <span className="opacity-60">({w.points})</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Opponent&apos;s words</h3>
                <div className="flex flex-wrap gap-2">
                  {opponentWords.map((w, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded text-sm ${
                        w.stolen ? "bg-red-600/50" : "bg-white/10"
                      }`}
                    >
                      {w.word} ({w.points})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "finished" && result && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">
              {result.winnerId === session?.user?.id ? "🏆" : result.winnerId === null ? "🤝" : "💪"}
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {result.winnerId === session?.user?.id
                ? "Victory!"
                : result.winnerId === null
                  ? "Draw!"
                  : "Defeat!"}
            </h2>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p>Your score</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
              <div>
                <p>Opponent</p>
                <p className="text-2xl font-bold">{opponentScore}</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStatus("idle")
                  setResult(null)
                  setMessage("")
                  startMatch()
                }}
                className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700 font-bold"
              >
                Play Again
              </button>
              <Link
                href="/wordstack/lobby"
                className="px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 font-bold"
              >
                Lobby
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
