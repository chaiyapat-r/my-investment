# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# API_PROXY_URL is NOT needed at build time — the API route handlers read it at
# request time (src/lib/api/backend.ts). It's supplied as a runtime env by
# docker-compose (service "web"), falling back to http://localhost:5153.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runtime (standalone output) ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
