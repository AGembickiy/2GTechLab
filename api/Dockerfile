FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --system --uid 1001 nodeapp
USER nodeapp

COPY --from=builder --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodeapp /app/dist ./dist
COPY --from=builder --chown=nodeapp:nodeapp /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/index.js"]
