# deploy

The production face of the portal: one compose project with the two sites and the waitlist API.

## What runs

| Service | Container | Host port | Image |
| --- | --- | --- | --- |
| `api` | `openportalhub-api` | none, internal only | `ghcr.io/samuelrubiodev/web-openportalhub-api` |
| `web-openportalhub` | `openportalhub-web` | 8080 | `ghcr.io/samuelrubiodev/web-openportalhub` |
| `web-eventimeline` | `eventtimeline-web` | 8081 | `ghcr.io/samuelrubiodev/web-eventimeline` |

All three share the project's default network, and that is what makes
`proxy_pass http://api:8787` resolve from either site's nginx. The API publishes no port: only
nginx reaches it.

Build contexts are the repository root, because the shared packages live outside each app
directory.

## First run on a server

```bash
cd deploy
cp env.example .env        # fill in the SMTP credential, the token secret and the addresses
docker compose up -d --build
```

`env.example` documents every variable. Four of them have no default and the API refuses to start
without them: `MAIL_FROM`, `MAIL_REPLY_TO`, `NOTIFY_EMAIL` and `TOKEN_SECRET`. The refusal is a
single message listing everything that is missing at once, so read it rather than guessing.

`.env` is git-ignored and never enters an image.

## Deploying what CI published

```bash
cd deploy
docker compose pull && docker compose up -d --no-build

OPH_IMAGE_TAG=v1.2.3 docker compose pull   # pin a published version instead of latest
```

## The reverse proxy in front

Each domain has to reach its own port:

- `openportalhub.org` → `127.0.0.1:8080`
- `eventimeline.openportalhub.org` → `127.0.0.1:8081`

The API is reached through each site's own nginx, at `/api/`, never directly. nginx resolves the
client address itself: the `realip` block trusts `CF-Connecting-IP` only from the private ranges
where cloudflared or the host reverse proxy runs, and forwards the result as `X-Real-IP`, the only
header the API trusts for rate limiting. Without that, every visitor shares one bucket — safe, just
coarse.

## Local check

```bash
# in .env: MAIL_TRANSPORT=json prints the serialized message instead of sending it
docker compose up --build

curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/   # 200, openportalhub
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081/   # 200, eventimeline
curl -s http://localhost:8080/api/health                          # {"ok":true}
```
