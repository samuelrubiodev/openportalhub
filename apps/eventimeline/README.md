# EventTimeline — presentation site

Presentation landing page for **EventTimeline**, OpenPortalHub's Windows desktop
utility that turns Event Logs into a chronological timeline around the time of
the incident (*Time Corridor*).

This repository is the **site**, not the product: there is no browser app, no
download and no access to Windows logs. The only conversion is the **waitlist**.
It is pre-launch.

Project source-of-truth documents (read them before changing copy or design):

| File | What it governs |
| --- | --- |
| `DESIGN.md` | The visual system that actually ships: tokens, typography, layout grammar |
| `AGENTS.md` | Working rules, including the Google Stitch design flow |

## Requirements and setup

Node is unnecessary: the project uses **Bun** (`bun.lock`).

```bash
bun install            # from the monorepo root: dependencies are hoisted there
bun run dev            # dev server
bun run build          # tsc -b + vite build + prerender → dist/
bun run prerender      # prerender only (after vite build; refuses an already-prerendered dist/)
bun run preview        # serve dist/ in production
```

The widget's embeddable bundle lives in
`packages/widget` and is built once for both sites
(`bun run build` inside `packages/widget` → `packages/widget/dist/`).

The build ends with the prerender (`scripts/prerender.ts`): it renders the app
with `renderToString` in each language and writes `dist/index.html` and
`dist/es/index.html` with the prose inside `#root` and the `<head>` for each
language (title, description, canonical, the three `hreflang` values and Open
Graph), and generates `dist/sitemap.xml` (with stylesheet, `lastmod` and
per-URL alternates) and `dist/robots.txt`. If any pattern stops matching the
template, the build aborts instead of publishing a page with no head; and the
standalone prerender refuses to run over an already-prerendered `dist/`: run the
full build.

There is no test suite. Validation is the build's type-check plus a browser
pass over the built site.

Under `bun run dev` only `/` exists: the Spanish page is a file the prerender
generates, so to check the per-URL language and the redirects you have to use
the nginx-served build (`cd ../../deploy && docker compose up --build`).
`bun run preview` is no good for that either: it applies Vite's SPA fallback and
does not reproduce production's 301s or 404s.

## Structure

```
index.html                     template; mounts src/main.tsx (the prerender writes
                               one page per language from it)
src/main.tsx                   entry + global styles; hydrates with data-lang
src/App.tsx                    landing composition
src/components/                TopBar, Hero, Mechanism, Sources, Licensing,
                               Faq, WaitlistClose, LogbookStrip, LangNotice
src/lib/pages.ts               single page/language map and public origin (canonical,
                               hreflang, Open Graph, sitemap)
src/lib/i18n.tsx               bilingual EN/ES dictionary; the URL picks the pack
src/lib/waitlist.ts            waitlist submission adapter
src/styles/fonts.css           self-hosted @font-face (12 woff2, unicode-range)
src/styles/hero.css            this site's exceptions to the shared system
                               (@openportalhub/design, imported before)
vite.config.ts                 site build
scripts/prerender.ts           prerender: per-language head, sitemap, robots
public/assets/fonts/           self-hosted fonts (woff2) + LICENSES.txt (OFL 1.1)
public/sitemap.xsl             sitemap stylesheet
Dockerfile · nginx.conf        production image
../../deploy/                  portal compose: both sites and the API
../../.github/workflows/       CI: publishes the three images to GHCR
```

## The product window

The hero does not show a mock: it shows **the real program interface**, coming
from the shared `@openportalhub/event-timeline-ui` package (`packages/widget`).
It is a framework-free kernel plus an `<event-timeline-ui>` custom element
(Shadow DOM, isolated styles) and a thin React wrapper. **No npm dependencies**
and no site fonts.

- It mounts with the `reference-session` preset, which reproduces the shipped
  demo state of the application (15 events, 9 clusters).
- The language is the page's, fixed by the URL: `es` is the source of truth for
  the labels and `en` is its translation.
- On narrow screens the hero shows an inert poster of the same window instead
  of the operable one; the widget handles the switch itself.
- The full API (attributes, events, CSS-variable theming, embedding from another
  site with `script type="module"`) is in `packages/widget/README.md`.

## Docker

Multi-stage image: Bun builds, nginx serves. The Dockerfile copies `scripts/`,
so the prerender has its entry point in the build stage. `nginx.conf` caches
`/assets/` (self-hosted fonts included) immutably and leaves the pages
uncached. There is no SPA fallback: a route nobody wrote responds 404 and not
the landing with 200 (`try_files $uri $uri/index.html =404`); one page, one URL
(`/es`, `/index.html` and `/es/index.html` redirect to their canonical form) and
`/sitemap.xsl` is served as `text/xsl`. The image does not publish any widget
bundle: the embeddable bundle is built in `packages/widget` and is not part of
the site.

```bash
cd ../../deploy
docker compose up --build     # http://localhost:8081
```

The portal compose runs both sites and the API in one project, so this site no
longer takes port 8080: it uses 8081 and the proxy in front has to point its
domain there. The API is reached through `/api/` via this site's nginx, with the
`api` name that resolves on the project network.

`../../.github/workflows/docker.yml` builds the three images on every push and
pull request, and publishes to `ghcr.io/<owner>/web-eventimeline` only outside
PRs (tags: `latest`, semver, sha). `linux/amd64` only.

`../../.dockerignore` keeps the build context at the monorepo root and excludes
`*.md`; `public/` does travel, because nginx serves its content.

## Copy, language and honesty

- **The URL governs the language**: `/` is English and `/es/` is Spanish; there
  is no automatic redirect and no content change without a URL change. Each
  language is its own prerendered document, with its `<html lang>`, title,
  description, canonical, the three `hreflang` values (`en`, `es`, `x-default`)
  and Open Graph. `src/lib/pages.ts` is the single page-and-language map and the
  only place the public origin is declared. The topbar and footer switches are
  links to the same page in the other language (with `aria-current`); the
  preference is recorded in `sessionStorage` (`eventtimeline.lang`) and never
  leaves the device. On the English page, a visitor whose browser asks for
  Spanish is offered `/es/` with `LangNotice`: a notice, never an automatic
  switch. The two entries in `src/lib/i18n.tsx` must keep key parity.
- Paid product: one license with a year of included updates. The site must
  **never** suggest it is free.
- No invented social proof: no testimonials, no user counts, no product
  screenshots other than the real window.
- The waitlist is the only call to action. `src/lib/waitlist.ts` validates the
  email and resolves with no provider: there is no backend yet, so the flow is
  exercisable but sends nothing anywhere.

## Design

The design flow: the direction is visualized with the **Google Stitch** MCP
tools before any UI code is written, and every effort starts with a **new**
project and design system (previous Stitch projects are neither read nor
reused, by an explicit rule in `AGENTS.md`).

- `DESIGN.md` is the source of truth for the code; Stitch is the source of truth
  for the visual comps.
