# syntax=docker/dockerfile:1

# ---- build stage ----------------------------------------------------------
# The context is the monorepo root (deploy/docker-compose.yml and the root CI
# workflow both pass it), so the shared packages/ workspaces are visible to
# the build.
FROM oven/bun:1-debian AS build
WORKDIR /app

# Install dependencies from the lockfile first (better layer caching). Every
# workspace manifest is needed: --frozen-lockfile checks the whole workspace,
# and bun links the internal packages into node_modules for the app's imports.
COPY package.json bun.lock ./
COPY apps/openportalhub/package.json apps/openportalhub/
COPY apps/eventimeline/package.json apps/eventimeline/
COPY packages/widget/package.json packages/widget/
COPY packages/waitlist/package.json packages/waitlist/
COPY packages/design/package.json packages/design/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Build the production bundle (typecheck:server + tsc -b + vite build + prerender
# -> /app/apps/openportalhub/dist). The server type-check runs inside
# "bun run build", so the server config and sources must be present in the
# build stage (never in the runtime stage), together with the shared widget,
# waitlist and design sources the app imports.
COPY apps/openportalhub/vite.config.ts apps/openportalhub/tsconfig.json apps/openportalhub/tsconfig.server.json apps/openportalhub/
COPY apps/openportalhub/*.html apps/openportalhub/
COPY apps/openportalhub/src ./apps/openportalhub/src
COPY apps/openportalhub/server ./apps/openportalhub/server
COPY apps/openportalhub/public ./apps/openportalhub/public
COPY apps/openportalhub/scripts ./apps/openportalhub/scripts
COPY packages/widget ./packages/widget
COPY packages/waitlist ./packages/waitlist
COPY packages/design ./packages/design
WORKDIR /app/apps/openportalhub
RUN bun run build

# ---- runtime stage ---------------------------------------------------------
FROM nginx:1.29-alpine
COPY apps/openportalhub/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/openportalhub/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
