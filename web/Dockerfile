FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN useradd --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
