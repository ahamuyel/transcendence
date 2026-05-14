const { WebSocketServer } = require("ws")
const crypto = require("crypto")
const wordstack = require("./games/wordstack")

const PORT = parseInt(process.env.WS_PORT || "3001", 10)
const HOST = process.env.WS_HOST || "0.0.0.0"

const wss = new WebSocketServer({ port: PORT, host: HOST })
const clients = new Map()

// Active game matches (in-memory for dev; use Redis in prod)
const activeMatches = new Map()

function broadcast(userId, event, payload) {
  const client = clients.get(userId)
  if (client && client.readyState === 1) {
    client.send(JSON.stringify({ event, payload }))
  }
}

function broadcastToAll(event, payload) {
  const msg = JSON.stringify({ event, payload })
  for (const client of clients.values()) {
    if (client.readyState === 1) {
      client.send(msg)
    }
  }
}

function sendToBoth(match, event, payload) {
  broadcast(match.player1Id, event, payload)
  broadcast(match.player2Id, event, payload)
}

function finishMatch(match) {
  match.status = "finished"
  match.finishedAt = Date.now()

  const p1Score = match.scores[match.player1Id] || 0
  const p2Score = match.scores[match.player2Id] || 0

  if (!match.winnerId) {
    match.winnerId = p1Score > p2Score ? match.player1Id
      : p2Score > p1Score ? match.player2Id
      : null
  }

  const result = {
    matchId: match.id,
    winnerId: match.winnerId,
    scores: match.scores,
    foundWords: match.foundWords,
    stolenWords: match.stolenWords,
    finishedAt: match.finishedAt,
  }

  sendToBoth(match, "game_over", result)
  activeMatches.delete(match.id)
}

const TICK_INTERVAL = 1000

setInterval(() => {
  const now = Date.now()
  for (const [id, match] of activeMatches) {
    if (match.status !== "in_progress") continue

    const elapsed = now - match.turnStartAt
    const remaining = Math.max(0, wordstack.TURN_TIME - elapsed)

    broadcast(match.currentTurn, "game_tick", { remaining })

    if (elapsed >= wordstack.TURN_TIME) {
      const result = wordstack.handleTimeout(match, match.currentTurn)
      if (result.forfeited) {
        finishMatch(match)
      } else {
        sendToBoth(match, "game_turn_change", {
          currentTurn: match.currentTurn,
          scores: match.scores,
          skipCount: result.skipCount,
        })
      }
    }
  }
}, TICK_INTERVAL)

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress
  console.log(`[WS] Client connected from ${ip}`)

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString())

      if (msg.type === "auth" && msg.userId) {
        ws.userId = msg.userId
        clients.set(msg.userId, ws)
        console.log(`[WS] User ${msg.userId} authenticated`)
        broadcastToAll("online_status", { userId: msg.userId, status: "online" })
        return
      }

      if (msg.type === "broadcast" && msg.target === "user") {
        broadcast(msg.userId, msg.event, msg.payload)
        return
      }

      if (msg.type === "broadcast" && msg.target === "all") {
        broadcastToAll(msg.event, msg.payload)
        return
      }

      // ─── WordStack Game Messages ──────────────────────────────

      if (msg.type === "game_invite") {
        broadcast(msg.targetUserId, "game_invite", {
          from: msg.fromUserId,
          fromName: msg.fromName,
          matchId: msg.matchId,
          gameType: msg.gameType || "wordstack",
        })
        return
      }

      if (msg.type === "game_invite_response") {
        broadcast(msg.fromUserId, "game_invite_response", {
          accepted: msg.accepted,
          matchId: msg.matchId,
          byUserId: msg.byUserId,
        })
        return
      }

      if (msg.type === "game_create") {
        const player1 = msg.player1Id
        const player2 = msg.player2Id
        const match = wordstack.createMatch(player1, player2)
        match.id = msg.matchId || match.id

        activeMatches.set(match.id, match)
        console.log(`[Game] WordStack match ${match.id}: ${player1} vs ${player2}`)

        sendToBoth(match, "game_start", {
          matchId: match.id,
          grid: match.grid,
          currentTurn: match.currentTurn,
          scores: match.scores,
          player1Id: player1,
          player2Id: player2,
        })
        return
      }

      if (msg.type === "game_submit_word") {
        const match = activeMatches.get(msg.matchId)
        if (!match) {
          broadcast(ws.userId, "game_error", { error: "Match not found" })
          return
        }
        const result = wordstack.handleSubmitWord(match, ws.userId, msg)
        if (result.error) {
          broadcast(ws.userId, "game_error", { error: result.error })
          return
        }
        if (result.skulled) {
          sendToBoth(match, "game_skulled", {
            userId: ws.userId,
            nextTurn: result.nextTurn,
            scores: result.scores,
          })
          return
        }
        sendToBoth(match, "game_word_accepted", {
          userId: ws.userId,
          ...result,
        })
        return
      }

      if (msg.type === "game_skip") {
        const match = activeMatches.get(msg.matchId)
        if (!match) return

        const result = wordstack.handleSkip(match, ws.userId)
        if (result.error) {
          broadcast(ws.userId, "game_error", { error: result.error })
          return
        }
        if (result.forfeited) {
          finishMatch(match)
          return
        }
        sendToBoth(match, "game_skipped", {
          userId: ws.userId,
          ...result,
        })
        return
      }

      if (msg.type === "game_give_up") {
        const match = activeMatches.get(msg.matchId)
        if (!match) return
        const result = wordstack.handleGiveUp(match, ws.userId)
        finishMatch(match)
        return
      }

      if (msg.type === "game_rematch") {
        const oldMatch = activeMatches.get(msg.matchId)
        if (!oldMatch) {
          broadcast(ws.userId, "game_error", { error: "Original match not found" })
          return
        }
        const newMatch = wordstack.createMatch(
          oldMatch.player1Id,
          oldMatch.player2Id
        )
        newMatch.id = crypto.randomUUID()

        activeMatches.set(newMatch.id, newMatch)
        sendToBoth(newMatch, "game_start", {
          matchId: newMatch.id,
          grid: newMatch.grid,
          currentTurn: newMatch.currentTurn,
          scores: newMatch.scores,
          player1Id: newMatch.player1Id,
          player2Id: newMatch.player2Id,
        })
        return
      }
    } catch (err) {
      console.error("[WS] Error handling message:", err.message)
    }
  })

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId)
      broadcastToAll("online_status", { userId: ws.userId, status: "offline" })
      console.log(`[WS] User ${ws.userId} disconnected`)
    }
  })

  ws.on("error", () => {
    if (ws.userId) {
      clients.delete(ws.userId)
      broadcastToAll("online_status", { userId: ws.userId, status: "offline" })
    }
  })
})

console.log(`[WS] WebSocket server running on ${HOST}:${PORT}`)
