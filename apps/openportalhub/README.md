# OpenPortalHub — website

Studio site for OpenPortalHub, built with **Vite + React 19 + TypeScript** — the
same framework and visual world as the EventTimeline presentation site
(seismograph-station design: dark ground `#131313`, hairlines, red pencil
accents, condensed display type).

## Run

```
bun install           # run from the monorepo root: dependencies are hoisted there
bun run dev           # dev server
bun run build         # type-check + production build + prerender → dist/
bun run prerender     # regenerate the static pages only (needs a previous build)
bun run preview       # serve the production build
```

The standalone widget bundle lives in `packages/widget`, which builds it once for
every site: run `bun run build` inside `packages/widget` and look in
`packages/widget/dist/`.

## Waitlist email (SMTP API)

The waitlist forms post to `/api/waitlist`, served by a small Bun service that lives in
`packages/waitlist` and runs as its own container behind nginx. This app hosts that container; the
eventimeline site reaches the same service through its own nginx, and which brand a request serves
is decided by the profile that matches its host:

```
bun server/index.ts      # local API on :8787 (bun run dev proxies /api/ to it)

cd ../../deploy
cp env.example .env      # fill in the SMTP credential; never commit .env
docker compose up -d --build                            # build the platform images from the repo root
docker compose pull && docker compose up -d --no-build  # deploy what CI published
```

- `web` (nginx) serves `dist/` and proxies `/api/` to `api:8787`. The API port
  is not published — only nginx on the compose network reaches it — and nginx
  resolves the client address itself: `realip` honours `CF-Connecting-IP` only
  when the request comes from the private network where cloudflared or the host
  reverse proxy runs, and forwards the result as `X-Real-IP`, the only header
  the API uses for rate limiting. A visitor that reaches the port directly
  keeps its real peer address, so no forged header can move anyone into another
  bucket. When the edge does not set `CF-Connecting-IP`, every client shares
  one bucket — safe, just coarse. The API port is fixed at 8787: a different
  `API_PORT` in the environment makes the process refuse to start instead of
  reporting healthy while the proxy points elsewhere.
- `api` reads `SMTP_*`, `MAIL_FROM`, `MAIL_REPLY_TO`, `NOTIFY_EMAIL` and
  `TOKEN_SECRET` from `.env`. `deploy/env.example` documents every variable and
  the Oracle-specific values. `MAIL_TRANSPORT=json` prints the serialized message
  instead of sending it. The origin is per brand, in the brand profiles inside
  `packages/waitlist`.
- Withdrawal needs no storage: the signed token in the message carries the
  identity itself, the link opens a confirmation page, and only the POST
  performs the withdrawal and notifies `NOTIFY_EMAIL`. There is no database and
  no list file; the future control panel grows inside the same service.
- `bun server/dev/smtp-sink.ts 2525 /tmp/sink` is a throwaway SMTP sink that
  saves the raw `.eml` files, so local checks never leave the machine, and
  `bun server/smoke.ts you@example.com` sends one real message for the first
  Oracle setup.

### Oracle Cloud Infrastructure Email Delivery

1. **Email Delivery → Configuration**: copy the public endpoint
   (`smtp.email.<region>.oci.oraclecloud.com`) into `SMTP_HOST`, and use port
   `465` (implicit TLS, the submission port Oracle recommends; `587` is
   STARTTLS).
2. **Identity → Users → SMTP credentials**: create the credential on a
   dedicated IAM user and copy the Oracle-generated username and password into
   `SMTP_USER` / `SMTP_PASSWORD`. Neither string can be chosen by hand.
3. **Email Delivery → Approved Senders**: add the `From:` address
   (`beta@openportalhub.org`). Oracle rejects mail from any address that is not
   an approved sender in the sending region.
4. **Email Delivery → Email Domains**: add `openportalhub.org` and publish the
   SPF and DKIM records the console generates in Cloudflare DNS. Both are what
   keeps the confirmation out of the spam folder.
5. First real send: `bun server/smoke.ts you@example.com` with the `.env`
   loaded in the environment.

`LEGAL_POSTAL_ADDRESS` is optional and omitted from the message when empty; a
postal address in a commercial mail footer is advisable and none has been
provided yet. The root `.github/workflows/docker.yml` publishes three images to
GHCR — `ghcr.io/<owner>/web-openportalhub`, `...-web-openportalhub-api` and
`ghcr.io/<owner>/web-eventimeline`, with the names written out explicitly — using
`latest` from `main`, semver
tags from `v*` tags, and PR builds that neither push nor load. On a server,
`OPH_IMAGE_TAG` pins a published version across all three without editing the
compose file.

## Pages and languages

One URL per language. The language of a page comes from its URL, never from the
visitor's state: that is what lets both markets be indexed separately.

| Page | English | Spanish |
| --- | --- | --- |
| Studio home | `/` | `/es/` |
| Event Timeline | `/event-timeline.html` | `/es/event-timeline.html` |
| Privacy | `/privacy.html` | `/es/privacy.html` |
| Terms | `/terms.html` | `/es/terms.html` |

- `src/lib/pages.ts` is the single source of truth: paths, `<title>`,
  description and the helper used by the switch, the footer and the sitemap.
- `scripts/prerender.ts` runs after `vite build`. It renders every page in both
  languages to HTML (so the text is in the file, not only in JS), rewrites the
  head for that language (title, description, canonical, `hreflang`, Open Graph)
  and writes `dist/es/**`, `dist/sitemap.xml`, `dist/sitemap.xsl` and
  `dist/robots.txt`. The stylesheet is what makes a browser show the sitemap as a table
  instead of a line of URLs; nginx serves it as `text/xsl` for that reason.
- Every page hydrates with `hydrateRoot` and reads `data-page` / `data-lang` from
  `#root`, so the markup in the file and the first client render agree.
- The `EN | ES` control is a pair of links to the same page in the other
  language. The choice is remembered in `sessionStorage` (`oph.lang`) and, on an
  English page, a visitor whose browser asks for Spanish is offered the Spanish
  URL (`LangNotice`) instead of having the content swapped under them.

## Pages (components)

- `index.html` (`src/App.tsx`) — studio home: hero with the Event Timeline
  window in poster mode, catalog, featured project, notes, studio,
  waitlist.
- `event-timeline.html` (`src/EventApp.tsx`) — product page: facts, live
  window, features, closed-beta access (no public downloads yet).
- `privacy.html` / `terms.html` (`src/LegalApp.tsx`) — legal pages sharing the
  `LegalDoc` component; bilingual EN/ES, no trackers/cookies claims match reality.

Both marketing pages render the same shared interactive window from
`packages/widget/src/**`: a framework-free kernel, an `<event-timeline-ui>` custom
element, and a thin React wrapper. The home card shows it in poster mode
(`interactive={false}`); the product page shows it live — playhead drag,
span/zoom controls, level filters, inspector.

## Structure

- `packages/widget/` — the shared interactive window, published to both sites as
  `@openportalhub/event-timeline-ui`: framework-free kernel, `<event-timeline-ui>`
  element, React wrapper, and the library build that emits the standalone bundle.
  See its own README for embedding it in other sites.
- `src/styles/hero.css` — this site's exceptions to the shared design system
  (`@openportalhub/design`), which is imported before it
- `packages/waitlist/` — the shared waitlist service: Bun router, fail-fast env, nodemailer
  transport, brand profiles, bilingual HTML/text templates, signed withdrawal tokens, plus the
  typed client and the React form both sites use. See "Waitlist email" above;
  `deploy/env.example` is the credential template.
- `src/styles/oph.css` — OpenPortalHub sections (catalog table, facts, closed-beta block, legal docs)
- `src/lib/i18n.tsx` — bilingual EN/ES dictionary (packs selected by the page URL)
- `src/lib/pages.ts` — page and language map: paths, `<head>` metadata, URL helpers
- `scripts/prerender.ts` — static prerender and per-language `<head>` generation
- `nginx.conf` — clean URLs; `/es` is redirected to `/es/` so one page keeps one URL
- `src/lib/reveal.ts` — scroll-reveal observer shared by both pages
- `public/` — favicon and static assets

No trackers, no cookies. Event Timeline is not released: the product page
advertises the free closed beta (testers only) and notes that the stable
version will be paid. The beta-access and catalog forms go through the waitlist
API described above: one confirmation email, a signed withdrawal link, and no
list stored yet.
