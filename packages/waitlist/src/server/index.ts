/**
 * Waitlist API — one small Bun server, no framework (user decision 1: a
 * separate api service behind nginx that later grows into the control panel).
 *
 * Routes:
 *   POST /api/waitlist                send the confirmation mail
 *   GET  /api/waitlist/unsubscribe    confirmation page (token in query; nothing changes here)
 *   POST /api/waitlist/unsubscribe    performs the withdrawal; also RFC 8058 one-click
 *   GET  /api/health                  container healthcheck
 *
 * The client must not be able to probe the list: a filled honeypot, an invalid
 * email and a duplicate all answer like a success or a plain 400, and logs
 * always mask the address (a***@domain). Tokens are never logged.
 *
 * No import-time side effects: this module only exports. createWaitlistApi()
 * builds the runtime (transport, limiters, handlers) and start() binds the
 * fixed port and installs the shutdown signal handlers, so the logic is
 * testable and the container entrypoint decides when the process serves.
 *
 * The brand served for each request is resolved from routing hints in the
 * order documented in brand.ts — an unknown hint never fails the request.
 */
import type { Env, WaitlistLang, WaitlistSource } from "./env";
import type { BrandProfile } from "./brand";
import { resolveBrand } from "./brand";
import { buildTransport, notifyWithdrawal, sendWaitlistConfirmation } from "./mail";
import { verifyWaitlistToken } from "./token";
import { renderConfirmPage, renderInvalidTokenPage, renderWithdrawalFailedPage, renderWithdrawalPage } from "./templates";
import { LastSeen, SlidingWindow } from "./limiter";

export { loadEnv, parseEnv, EnvValidationError } from "./env";
export type { Env, MailTransport, WaitlistLang, WaitlistSource } from "./env";
export { BRANDS, DEFAULT_BRAND_ID, isBrandId, resolveBrand } from "./brand";
export type { BrandId, BrandProfile, BrandResolution } from "./brand";

/** nginx enforces the same cap (client_max_body_size 8k); this is the backstop. */
const MAX_BODY_BYTES = 8 * 1024;

/** Fixed on purpose: nginx proxies /api/ to exactly this port (see env.ts,
 *  which refuses a different API_PORT instead of drifting). */
const PORT = 8787;

/** Unknown routing hints are untrusted input; never echo them in full. */
const MAX_LOGGED_HINT_LENGTH = 64;

function json(value: unknown, status: number): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function html(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** Request-log masking: a***@domain. Never log a full address or a token. */
function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`;
}

/**
 * Client identity for rate limiting.
 *
 * The API port is not published — only the nginx container on the compose
 * network can reach it. nginx resolves the client itself (realip honours
 * CF-Connecting-IP only for peers on the private network where cloudflared or
 * the host reverse proxy runs) and sends the result as X-Real-IP, the only
 * header this API trusts. CF-Connecting-IP and X-Forwarded-For arriving here
 * come from the caller: trusting them let a caller choose its own rate-limit
 * bucket, so they are now ignored. A request without a usable X-Real-IP falls
 * back to the socket address, which puts every direct client in one bucket.
 */
const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

function clientIp(request: Request, server: { requestIP(request: Request): { address: string } | null }): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real !== undefined && real !== "" && IP_PATTERN.test(real)) return real;
  return server.requestIP(request)?.address ?? "unknown";
}

// Same shape as the client-side check in src/lib/waitlist.ts, plus explicit
// rejection of control characters so nothing user-controlled can reach a SMTP
// header line. Lengths follow RFC 5321 (64-octet local part, 254-octet address).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export function isValidWaitlistEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return false;
  if (CONTROL_CHARACTERS.test(email)) return false;
  if (!EMAIL_PATTERN.test(email)) return false;
  const at = email.lastIndexOf("@");
  return at > 0 && email.length - at - 1 > 0 && email.length - at - 1 <= 254 && email.slice(0, at).length <= 64;
}

/** Reads a bounded JSON body; null when absent, oversized or unparsable. */
async function readJsonBody(request: Request): Promise<unknown | null> {
  const declared = Number(request.headers.get("content-length") ?? NaN);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return null;
  if (text.trim() === "") return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** Short, single-line log form for an untrusted routing hint. */
function hintForLog(value: string): string {
  const flat = value.replace(/[\r\n\t]+/g, " ").trim();
  return flat.length > MAX_LOGGED_HINT_LENGTH ? `${flat.slice(0, MAX_LOGGED_HINT_LENGTH)}…` : flat;
}

export interface WaitlistApi {
  /** Binds the fixed port 8787 and installs the shutdown signal handlers. */
  start(): void;
  /** Stops the listener, the prune loop and the signal handlers; a no-op when
   *  not started. */
  stop(): void;
}

export function createWaitlistApi(env: Env): WaitlistApi {
  const transport = buildTransport(env);
  const perIp = new SlidingWindow(env.rateLimitPerIpPerHour, 60 * 60 * 1000);
  const perEmail = new LastSeen(env.rateLimitPerEmailMinutes * 60 * 1000);

  async function handleWaitlist(request: Request, ip: string, brand: BrandProfile): Promise<Response> {
    const body = await readJsonBody(request);
    if (body === null || typeof body !== "object") {
      return json({ ok: false, error: "invalid_request" }, 400);
    }
    const fields = body as Record<string, unknown>;

    if (!isValidWaitlistEmail(fields.email)) {
      return json({ ok: false, error: "invalid_email" }, 400);
    }

    // Honeypot: the form hides this field from people; only bots fill it. Answer
    // exactly like a success, send nothing, and spend no rate-limit budget.
    if (typeof fields.company === "string" && fields.company.trim() !== "") {
      console.log(`[waitlist] honeypot filled — dropped (ip=${ip})`);
      return json({ ok: true }, 200);
    }

    if ((fields.lang !== "en" && fields.lang !== "es") || (fields.source !== "beta" && fields.source !== "list")) {
      return json({ ok: false, error: "invalid_request" }, 400);
    }
    const lang = fields.lang as WaitlistLang;
    const source = fields.source as WaitlistSource;
    const address = (fields.email as string).trim().toLowerCase();

    // Duplicate window first, claimed atomically (no await before the marking):
    // a repeat answers 200 without a second send and spends no IP budget.
    if (!perEmail.claim(address)) {
      console.log(`[waitlist] duplicate suppressed (email=${maskEmail(address)})`);
      return json({ ok: true }, 200);
    }

    // Per-IP limit counts real send attempts (duplicates and honeypot hits excluded).
    if (!perIp.hit(ip)) {
      // Nothing was sent, so the address may retry once the IP window cools down.
      perEmail.release(address);
      console.log(`[waitlist] rate limited (ip=${ip})`);
      return json({ ok: false, error: "rate_limited" }, 429);
    }

    try {
      await sendWaitlistConfirmation(env, transport, brand, { email: address, lang, source });
      console.log(`[waitlist] confirmation sent (email=${maskEmail(address)}, lang=${lang}, source=${source}, brand=${brand.id})`);
      return json({ ok: true }, 200);
    } catch (error) {
      // A failed send produced no mail: release the claim so an immediate retry
      // is not suppressed as a duplicate.
      perEmail.release(address);
      console.error(`[waitlist] send failed (email=${maskEmail(address)}): ${error instanceof Error ? error.message : String(error)}`);
      return json({ ok: false, error: "send_failed" }, 502);
    }
  }

  function handleUnsubscribePage(url: URL, brand: BrandProfile): Response {
    const payload = verifyWaitlistToken(url.searchParams.get("token") ?? "", env.tokenSecret);
    if (payload === null) {
      // Fail closed: the 400 page shows only the contact address — never data
      // decoded from an unverified token.
      console.log("[waitlist] withdrawal confirmation page — invalid token");
      return html(renderInvalidTokenPage({ brand, contactAddress: env.mailReplyTo }), 400);
    }
    // Confirmation page only: nothing changes and no notice is sent here, because
    // plain GET links are also pre-fetched by scanners. The form on the page POSTs
    // to this same URL (token stays in the query string) to perform the withdrawal.
    console.log(`[waitlist] withdrawal confirmation page (email=${maskEmail(payload.email)})`);
    return html(
      renderConfirmPage({
        lang: payload.lang,
        email: payload.email,
        brand,
        contactAddress: env.mailReplyTo,
        formAction: `${url.pathname}${url.search}`,
      }),
      200,
    );
  }

  async function handleUnsubscribeOneClick(url: URL, brand: BrandProfile): Promise<Response> {
    const payload = verifyWaitlistToken(url.searchParams.get("token") ?? "", env.tokenSecret);
    if (payload === null) {
      console.log("[waitlist] withdrawal POST — invalid token");
      return html(renderInvalidTokenPage({ brand, contactAddress: env.mailReplyTo }), 400);
    }
    // The POST performs the withdrawal: the operator notice IS the record while
    // there is no storage, so a notice that cannot be delivered must fail the
    // request instead of confirming a withdrawal nobody wrote down.
    try {
      await notifyWithdrawal(env, transport, brand, { email: payload.email, lang: payload.lang, iat: payload.iat });
    } catch (error) {
      console.error(`[waitlist] withdrawal could not be recorded (email=${maskEmail(payload.email)}): ${error instanceof Error ? error.message : String(error)}`);
      return html(
        renderWithdrawalFailedPage({ lang: payload.lang, email: payload.email, brand, contactAddress: env.mailReplyTo }),
        502,
      );
    }
    console.log(`[waitlist] withdrawal performed (email=${maskEmail(payload.email)})`);
    return html(renderWithdrawalPage({ lang: payload.lang, email: payload.email, brand, contactAddress: env.mailReplyTo }), 200);
  }

  async function fetch(request: Request, server: { requestIP(request: Request): { address: string } | null }): Promise<Response> {
    const url = new URL(request.url);
    const ip = clientIp(request, server);
    const resolution = resolveBrand({
      xSite: request.headers.get("x-site"),
      host: request.headers.get("host"),
      defaultBrand: env.defaultBrand,
    });
    if (resolution.unknownXSite !== undefined) {
      const via = resolution.via === "host" ? "the host match" : "the default brand";
      console.log(`[waitlist] unknown X-Site "${hintForLog(resolution.unknownXSite)}" — falling through to ${via}`);
    }
    const brand = resolution.brand;
    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true }, 200);
      }
      if (url.pathname === "/api/waitlist") {
        if (request.method === "POST") return await handleWaitlist(request, ip, brand);
        return json({ ok: false, error: "method_not_allowed" }, 405);
      }
      if (url.pathname === "/api/waitlist/unsubscribe") {
        if (request.method === "GET") return handleUnsubscribePage(url, brand);
        if (request.method === "POST") return await handleUnsubscribeOneClick(url, brand);
        return json({ ok: false, error: "method_not_allowed" }, 405);
      }
      return json({ ok: false, error: "not_found" }, 404);
    } catch (error) {
      console.error(`[waitlist] unhandled error (ip=${ip}): ${error instanceof Error ? error.message : String(error)}`);
      return json({ ok: false, error: "internal_error" }, 500);
    }
  }

  let running: ReturnType<typeof Bun.serve> | undefined;
  let pruner: ReturnType<typeof setInterval> | undefined;

  function shutdown(signal: string): void {
    console.log(`[waitlist] ${signal} received — closing server`);
    if (pruner !== undefined) clearInterval(pruner);
    running?.stop(true);
    process.exit(0);
  }

  const onSigterm = (): void => shutdown("SIGTERM");
  const onSigint = (): void => shutdown("SIGINT");

  return {
    start() {
      if (running !== undefined) return;
      // Prune both limiters periodically so abandoned keys do not pile up.
      const timer = setInterval(() => {
        perIp.prune();
        perEmail.prune();
      }, 5 * 60 * 1000);
      if (typeof timer.unref === "function") timer.unref();
      pruner = timer;
      running = Bun.serve({ port: PORT, fetch });
      console.log(`[waitlist] api listening on :8787 (fixed port; transport=${env.transport})`);
      // Graceful stop: SIGTERM is what `docker stop` sends; SIGINT covers Ctrl-C.
      process.on("SIGTERM", onSigterm);
      process.on("SIGINT", onSigint);
    },
    stop() {
      if (pruner !== undefined) {
        clearInterval(pruner);
        pruner = undefined;
      }
      if (running !== undefined) {
        running.stop(true);
        running = undefined;
      }
      process.off("SIGTERM", onSigterm);
      process.off("SIGINT", onSigint);
    },
  };
}
