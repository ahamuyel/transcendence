FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/server ./.next/server
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts/entrypoint.sh ./
COPY --from=builder /app/node_modules ./node_modules

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
