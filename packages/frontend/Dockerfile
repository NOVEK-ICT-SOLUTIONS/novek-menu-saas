FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

RUN npm ci --workspace=frontend

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY packages/frontend ./packages/frontend
COPY tsconfig.json ./

ARG VITE_API_URL
ARG VITE_PUBLIC_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL

WORKDIR /app/packages/frontend
RUN npm run build

FROM nginx:alpine AS runner

COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
