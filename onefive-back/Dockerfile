# Build context: monorepo ROOT (not onefive-back/)
# Railway: Dockerfile path = onefive-back/Dockerfile, root directory = / (repo root)

# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

RUN apk add --no-cache postgresql-client

WORKDIR /app

RUN npm install -g pnpm@9.15.6

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY onefive-back/package.json ./onefive-back/

RUN pnpm install --frozen-lockfile --filter onefive-back...

COPY onefive-back/prisma ./onefive-back/prisma
COPY onefive-back/src ./onefive-back/src
COPY onefive-back/tsconfig.json onefive-back/tsconfig.build.json onefive-back/nest-cli.json ./onefive-back/

WORKDIR /app/onefive-back

RUN pnpm exec prisma generate --schema=./prisma/schema/
RUN pnpm run build

# ===== Stage 2: Production =====
FROM node:20-alpine AS production

RUN apk add --no-cache postgresql-client curl bash

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

RUN npm install -g pnpm@9.15.6 prisma@6.16.3

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY onefive-back/package.json ./onefive-back/

RUN pnpm install --frozen-lockfile --prod --filter onefive-back...

COPY --from=builder /app/onefive-back/prisma ./onefive-back/prisma
COPY --from=builder /app/onefive-back/dist ./onefive-back/dist
COPY onefive-back/scripts/start-production.sh ./onefive-back/scripts/start-production.sh

WORKDIR /app/onefive-back

# pnpm hoists generated client to /app/node_modules — regenerate in prod stage
RUN pnpm exec prisma generate --schema=./prisma/schema/

RUN mkdir -p uploads && chown -R nestjs:nodejs uploads && \
    chmod +x scripts/start-production.sh

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f "http://localhost:${PORT:-3000}/health" || exit 1

CMD ["./scripts/start-production.sh"]
