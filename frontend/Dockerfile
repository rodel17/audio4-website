# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Development: hot reload ----
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- Build ----
FROM base AS builder
# The /api and /uploads proxy rules in next.config.ts are fixed at build time.
ARG API_URL=http://backend:8000
ENV API_URL=$API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production: standalone server ----
FROM base AS prod
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
