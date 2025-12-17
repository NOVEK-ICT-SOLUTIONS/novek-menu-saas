FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm ci --workspace=backend

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY packages/backend ./packages/backend
COPY tsconfig.json ./

WORKDIR /app/packages/backend
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

COPY --from=builder --chown=backend:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/packages/backend/package.json ./package.json
COPY --from=builder --chown=backend:nodejs /app/packages/backend/prisma ./prisma

RUN mkdir -p /app/uploads && chown -R backend:nodejs /app/uploads

USER backend

EXPOSE 3000

CMD ["node", "dist/server.js"]
