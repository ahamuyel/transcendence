FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR .

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p .next && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]