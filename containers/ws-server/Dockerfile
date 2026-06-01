FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY ws-server.js ./

EXPOSE 3001

ENTRYPOINT ["node", "ws-server.js"]
