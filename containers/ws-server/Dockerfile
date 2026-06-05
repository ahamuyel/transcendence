FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node ws-server.js ./

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const net = require('net'); const client = net.connect(3001, '127.0.0.1', () => { client.end(); process.exit(0); }); client.on('error', () => process.exit(1));"

ENTRYPOINT ["node", "ws-server.js"]
