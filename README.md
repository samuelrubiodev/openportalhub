# OpenPortalHub

Monorepo for the OpenPortalHub platform: the two websites and the code they
share. New OpenPortalHub projects and website updates land here.

| App | Domain |
| --- | --- |
| `apps/openportalhub` | https://openportalhub.org |
| `apps/eventimeline` | https://eventimeline.openportalhub.org |

## Layout

    apps/openportalhub/     OpenPortalHub studio site, plus the waitlist API container it hosts
    apps/eventimeline/      EventTimeline presentation site
    packages/widget/        @openportalhub/event-timeline-ui, the Event Timeline window widget
    packages/waitlist/      @openportalhub/waitlist: the API, the typed client and the form
    packages/design/        @openportalhub/design: the stylesheet both sites share
    deploy/                 the one compose project that runs the platform

## Rules

- CI lives in the root `.github/workflows/`: one workflow, three images with their names kept
  explicit. GitHub reads only the root `.github/`.
- Deployment lives in `deploy/`: one compose project for the two sites and the API, so the `api`
  name resolves for both. See `deploy/README.md`.
- Each app keeps its own `Dockerfile`, `nginx.conf` and runtime image, because each one describes
  that app. The compose project that runs them together is `deploy/docker-compose.yml`.
- Dependencies install from the root: bun workspaces hoist the store there, and the root
  `bun.lock` is the only lockfile.
- The embeddable widget bundle is a deliverable, not part of either site's runtime. It is built
  once, in `packages/widget`.
- Adding a workspace under `packages/` means adding its `package.json` to all three Dockerfiles
  and, if a site imports it, its sources too. CI has a guard job that fails with the file to edit
  when one is missing.

## Build

    bun install                # at the root: the workspace lockfile and store live here

    cd apps/openportalhub
    bun run build              # typecheck:server + tsc + vite build + prerender

    cd apps/eventimeline
    bun run build              # tsc + vite build + prerender

    cd packages/widget
    bun run build              # the embeddable bundle, built once for both sites

## Deploy

    cd deploy
    cp env.example .env        # then fill in the SMTP credential and the token secret
    docker compose up -d --build

One compose project runs the API and both sites, on ports 8080 and 8081. The host reverse proxy
maps each domain to its port. `deploy/README.md` has the details.

## License

Released under the GNU Affero General Public License, version 3.0 (`AGPL-3.0-only`). The full
text is in `LICENSE`. A commercial license is available for uses that cannot meet the AGPL terms;
see `COMMERCIAL.md`.
