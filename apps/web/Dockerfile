# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20-bookworm-slim
ARG PNPM_VERSION=10.30.3
ARG TURBO_VERSION=2.8.14

FROM node:${NODE_VERSION} AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS pruner
ARG TURBO_VERSION
ENV TURBO_TELEMETRY_DISABLED=1
RUN npm install --global turbo@${TURBO_VERSION}
WORKDIR /repo
COPY . .
RUN turbo prune my-project --docker

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=pruner /repo/out/json/ .
RUN pnpm fetch --frozen-lockfile
RUN pnpm install --frozen-lockfile --offline
COPY --from=pruner /repo/out/full/ .
RUN pnpm --filter my-project build

FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER node
EXPOSE 8080

CMD ["node", "apps/web/server.js"]
