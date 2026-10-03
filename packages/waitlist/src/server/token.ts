/**
 * Stateless withdrawal tokens (user decisions 2 and 4).
 *
 * There is no storage, so the token carries the identity itself:
 *
 *   base64url(JSON{email, lang, iat}) + "." + base64url(HMAC-SHA256(TOKEN_SECRET, payload))
 *
 * The HMAC is the only proof the link was issued by this service. Rotating
 * TOKEN_SECRET invalidates every link already sent — the intended revocation
 * path until the panel adds real storage.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { WaitlistLang } from "./env";

export interface TokenPayload {
  email: string;
  lang: WaitlistLang;
  /** Issued-at, seconds since epoch. */
  iat: number;
}

/** A well-formed token is ~200 chars; anything longer is malformed by definition. */
const MAX_TOKEN_LENGTH = 512;

function mac(secret: string, payload: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

export function signWaitlistToken(payload: TokenPayload, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${mac(secret, encoded).toString("base64url")}`;
}

/** Returns the parsed payload for a valid token, or null for anything else. */
export function verifyWaitlistToken(token: string, secret: string): TokenPayload | null {
  if (token.length === 0 || token.length > MAX_TOKEN_LENGTH) return null;

  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const encoded = token.slice(0, dot);
  const claimed = token.slice(dot + 1);
  if (claimed.includes(".")) return null; // base64url never contains dots

  const expected = mac(secret, encoded);
  const given = Buffer.from(claimed, "base64url");
  // HMAC output size is fixed and public, so the length guard leaks nothing;
  // timingSafeEqual would throw on unequal lengths.
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof parsed !== "object" || parsed === null) return null;
    const { email, lang, iat } = parsed as Record<string, unknown>;
    if (typeof email !== "string" || email.length === 0 || email.length > 254) return null;
    if (lang !== "en" && lang !== "es") return null;
    if (typeof iat !== "number" || !Number.isFinite(iat) || iat < 0) return null;
    return { email, lang, iat };
  } catch {
    return null;
  }
}
