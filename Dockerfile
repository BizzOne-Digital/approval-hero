# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 approvalhero \
  && apk add --no-cache wget

COPY --from=builder /app/package.json package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

RUN mkdir -p server/uploads logs && chown -R approvalhero:nodejs server/uploads logs

USER approvalhero

EXPOSE 3000 5000

# Override in docker-compose (api vs web) or use scripts/docker-start.mjs for all-in-one
CMD ["node", "server/dist/server.js"]
