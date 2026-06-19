# Dockerfile — Scheduler de Rimainder (NestJS) — build multi-stage

# ---- build: compila TypeScript con todas las dependencias ----
FROM node:20-slim AS build
WORKDIR /app
RUN corepack enable
# Cache de dependencias: copiamos solo los manifests primero.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# Código y compilación.
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN pnpm run build
# Dejamos node_modules solo con dependencias de producción.
RUN pnpm prune --prod

# ---- runtime: imagen final liviana ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Usuario no-root (buena práctica).
USER node
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
