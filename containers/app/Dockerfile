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

# Copy everything as node:node
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/server ./.next/server
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/scripts/entrypoint.sh ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

RUN chmod +x entrypoint.sh

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({ host: '127.0.0.1', port: 3000, path: '/api/health', method: 'GET', timeout: 5000 }, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

ENTRYPOINT ["sh", "entrypoint.sh"]
