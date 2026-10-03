# syntax=docker/dockerfile:1

# ── Build ─────────────────────────────────────────────────────────────
# The context is the monorepo root: the site imports the shared form and client,
# which live in packages/.
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Dependencies first (cacheable layer). Every workspace manifest is copied:
# --frozen-lockfile validates the whole workspace.
COPY package.json bun.lock ./
COPY apps/openportalhub/package.json apps/openportalhub/
COPY apps/eventimeline/package.json apps/eventimeline/
COPY packages/widget/package.json packages/widget/
COPY packages/waitlist/package.json packages/waitlist/
COPY packages/design/package.json packages/design/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Build source and config, plus the shared packages the site imports
COPY apps/eventimeline/tsconfig.json apps/eventimeline/vite.config.ts apps/eventimeline/index.html apps/eventimeline/
COPY apps/eventimeline/public ./apps/eventimeline/public
COPY apps/eventimeline/src ./apps/eventimeline/src
COPY apps/eventimeline/scripts ./apps/eventimeline/scripts
COPY packages/widget ./packages/widget
COPY packages/waitlist ./packages/waitlist
COPY packages/design ./packages/design
WORKDIR /app/apps/eventimeline
RUN bun run build

# ── Runtime ───────────────────────────────────────────────────────────
FROM nginx:1.29-alpine AS runtime
COPY apps/eventimeline/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/eventimeline/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
