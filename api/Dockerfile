FROM node:20-alpine AS base

WORKDIR /app

# Install deps separately for caching
COPY package.json package-lock.json* ./
RUN npm run dev

COPY . .

USER node

# Run as non-root
EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]