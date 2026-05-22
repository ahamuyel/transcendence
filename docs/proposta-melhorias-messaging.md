# Proposta de Melhorias — Sistema de Mensagens

## Problemas Identificados

### 1. Broadcast abre conexão WS nova a cada mensagem
`src/lib/ws-broadcast.ts` cria um `new WebSocket` para **cada** broadcast individual. Cada chamada `broadcastToUser()` abre conexão, autentica, envia e fecha. Em escala, isso é centenas de handshakes desnecessários por minuto.

### 2. Sem Redis pub/sub — WS server não escala horizontalmente
O `ws-server.js` mantém um `Map<userId, WebSocket>` em memória. Se rodar 2+ instâncias do app, usuários em instâncias diferentes não trocam mensagens em tempo real. O Redis já está no `docker-compose.yaml` mas não é usado.

### 3. HMAC token com expiração de 60s
O token expira em 60s (`verify-ws/route.ts:26`). O cliente faz cache por 25s (`useWebSocket.ts:35`). Se a reconexão demorar >35s, o token já expirou. O cliente tenta reconectar, mas não renova o token automaticamente — precisa esperar o próximo fetch.

### 4. WS server em JS puro, fora do ecossistema TypeScript
`ws-server.js` é JavaScript solto, sem tipos, sem build, sem lint. Não compartilha tipos com o resto do código.

### 5. Dois sistemas de mensagens com overlap
- `Conversation`/`ChatMessage`: chat real-time entre amigos
- `Message`: mensagens internas (escola), sem push real-time
Usuários podem se confundir sobre qual usar. O legado `Message` poderia ser migrado ou unificado.

### 6. Sem confirmação de entrega ("delivered")
Só existe `readAt` (lido). Não há `deliveredAt` (entregue). O remetente não sabe se a mensagem chegou ao dispositivo do destinatário.

---

## Propostas de Melhoria

### A. Conexão persistente no broadcast (alta prioridade)
Substituir `connectAndSend()` por um **WebSocket singleton** que mantém uma conexão permanente com o WS server. Se cair, reconecta com backoff.

**Antes (abre/fecha conexão a cada broadcast):**
```ts
function connectAndSend(msg: object) {
  const ws = new WebSocket("ws://localhost:3001")
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "auth", token }))
    ws.send(JSON.stringify(msg))
    setTimeout(() => ws.close(), 100)
  }
}
```

**Depois (singleton persistente):**
```ts
let client: WebSocket | null = null
let connectPromise: Promise<void> | null = null

async function getClient(): Promise<WebSocket> {
  if (client?.readyState === WebSocket.OPEN) return client
  if (connectPromise) return connectPromise
  connectPromise = new Promise((resolve, reject) => {
    client = new WebSocket("ws://localhost:3001")
    client.onopen = () => {
      client!.send(JSON.stringify({ type: "auth", token: generateServiceToken() }))
      resolve()
    }
    client.onclose = () => { client = null; connectPromise = null }
    client.onerror = () => { client = null; connectPromise = null; reject() }
  })
  return connectPromise.then(() => client!)
}
```

### B. Redis pub/sub no WS server (alta prioridade)
Integrar Redis pub/sub para que o WS server possa rodar em múltiplas instâncias:

1. **Subscriber**: cada instância do WS server assina o canal `ws:messages` e encaminha para seus clientes conectados
2. **Publisher**: quando um broadcast chega (via `ws-broadcast.ts`), publica no `ws:messages`
3. **Fallback**: se Redis estiver indisponível, opera apenas com o mapa local (single-instance)

```diff
// ws-server.js
+ const Redis = require("ioredis")
+ const pub = new Redis()
+ const sub = new Redis()
+
+ sub.subscribe("ws:messages")
+ sub.on("message", (channel, message) => {
+   const { target, userId, event, payload } = JSON.parse(message)
+   if (target === "user") {
+     const client = clients.get(userId)
+     if (client) client.send(JSON.stringify({ event, payload }))
+   } else {
+     broadcastToAll(event, payload)
+   }
+ })

// Ao receber broadcast via WebSocket (conexão do Next.js):
if (msg.type === "broadcast") {
+ pub.publish("ws:messages", JSON.stringify(msg))
- broadcast(msg.userId, msg.event, msg.payload)  // só local
}
```

### C. Renovação automática de token + TTL mais longo (média prioridade)
- Aumentar TTL do token para 5 minutos (`verify-ws/route.ts`)
- Cliente renova o token automaticamente a cada 3 minutos
- Na reconexão, sempre buscar token novo antes de conectar

### D. "DeliveredAt" no modelo ChatMessage (média prioridade)
Adicionar campo `deliveredAt` ao schema:
```prisma
model ChatMessage {
  ...
  deliveredAt DateTime?
  readAt      DateTime?
  ...
}
```
- Quando o destinatário recebe a mensagem via WebSocket, o cliente emite `{ type: "delivered", messageId }`
- WS server encaminha para o remetente que a mensagem foi entregue
- Interface mostra: ✅ entregue, ✅✅ lido

### E. Unificação dos sistemas de mensagens (baixa prioridade / longo prazo)
Migrar o modelo `Message` legado para usar o mesmo sistema de `Conversation`:
- `Message` com `toAll: true` → `GroupConversation` (conversa em grupo por escola/turma)
- Mantém compatibilidade com dados existentes via migration

### F. Migrar ws-server.js para TypeScript (média prioridade)
- Mover para `src/ws-server.ts`
- Compartilhar tipos com o resto do código (eventos, payloads)
- Integrar no build do Next.js ou rodar com `tsx`

---

## Ordem de Implementação Sugerida

| # | Melhoria | Esforço | Impacto | Dependências |
|---|----------|---------|---------|--------------|
| 1 | Conexão persistente no broadcast | ~2h | Alto (perf/confiabilidade) | Nenhuma |
| 2 | Redis pub/sub | ~4h | Alto (escalabilidade) | Instalar `ioredis` |
| 3 | Renovação automática de token | ~1h | Médio (estabilidade) | Nenhuma |
| 4 | DeliveredAt | ~3h | Médio (UX) | Frontend + migration |
| 5 | Migrar ws-server para TS | ~3h | Médio (manutenibilidade) | Nenhuma |
| 6 | Unificação dos sistemas | ~2d | Baixo (refatoração grande) | Itens 1-5 |

---

---

## Status da Implementação (22/05/2026)

| # | Melhoria | Status | Arquivos Alterados |
|---|----------|--------|-------------------|
| 1 | Conexão persistente no broadcast | ✅ Implementado | `src/lib/ws-broadcast.ts` — singleton com reconexão automática e fila de mensagens |
| 2 | Redis pub/sub | ✅ Implementado | `ws-server.js` — pub/sub no canal `ws:messages`, fallback single-instance |
| 3 | Renovação automática de token | ✅ Implementado | `verify-ws/route.ts` (TTL 5min), `useWebSocket.ts` (refresh a cada 4min, token novo na reconexão) |
| 4 | DeliveredAt | ✅ Implementado | `prisma/schema.prisma` (+campo), migration criada, `messages/route.ts` (marca entregue ao buscar), `chat/[id]/page.tsx` (indicador ✓/✓✓) |
| 5 | Migrar ws-server para TS | ❌ Cancelado | Manter `.js` é mais prático para o Dockerfile atual |
| 6 | Unificação dos sistemas | ⏳ Pendente | Requer refatoração maior — deixar para próximo ciclo |

##Análise de Risco

- **Redis pub/sub**: se Redis cair, o sistema continua funcionando em modo single-instance (graceful degradation)
- **Token mais longo**: risco mínimo — HMAC é seguro e o token só dá acesso ao WebSocket, não à API REST
- **DeliveredAt**: migration não-destrutiva, campo opcional
- **Conexão persistente**: se o singleton falhar, o `broadcastToUser` tenta reconectar; se não conseguir, a mensagem ainda foi salva no banco (o WebSocket é apenas notificação, não o transporte crítico)
