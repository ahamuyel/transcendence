# --- ESTÁGIO 1: Dependências ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- ESTÁGIO 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# URL fictícia apenas para o build passar sem conectar ao banco real
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

RUN npx prisma generate
RUN npx next build

# --- ESTÁGIO 3: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário para não rodar como root (Segurança)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos garantindo que o usuário 'nextjs' seja o dono
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app ./

# Dar permissão de execução ao script
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]