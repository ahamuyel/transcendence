# --- ESTÁGIO 1: Build ---
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

RUN npx prisma generate
RUN npx next build

# --- ESTÁGIO 2: Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone já inclui tudo para o Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# WS server e entrypoint
COPY --from=builder /app/ws-server.js ./ws-server.js
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Prisma: schema, migrations e node_modules completo do builder
# (binários já compilados para Alpine - evita reinstalação)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000
EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]