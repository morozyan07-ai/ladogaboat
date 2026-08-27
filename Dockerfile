# Dockerfile для деплоя на Yandex Cloud Serverless Containers
# Multi-stage сборка: deps -> build -> runtime

# --- Stage 1: зависимости ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# --- Stage 2: сборка ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# DOCKER_BUILD=true включает output:'standalone' в next.config.ts
ENV DOCKER_BUILD=true
ENV NEXT_TELEMETRY_DISABLED=1

# DATABASE_URL нужен на build-time только если какие-то route используют
# статическую генерацию с обращением к БД. У нас все API force-dynamic,
# так что реальный URL не требуется — но next build должен пройти без ошибок.
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}

RUN npm run build

# --- Stage 3: runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Непривилегированный пользователь
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Standalone-сборка содержит минимальный сервер + node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Yandex Serverless Containers передаёт порт через переменную PORT
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
