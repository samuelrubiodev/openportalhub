/**
 * Fail-fast environment loading for the waitlist API.
 *
 * The process refuses to start with one clear message that lists every problem
 * found, instead of dying later on the first send. Variable names and defaults
 * are the contract documented in .env.example.
 *
 * Required unconditionally: MAIL_FROM, MAIL_REPLY_TO, NOTIFY_EMAIL, TOKEN_SECRET
 * (min 32 chars). Required only when MAIL_TRANSPORT=smtp: SMTP_HOST.
 * SMTP_USER/SMTP_PASSWORD are optional — when both are set the transport
 * authenticates (OCI SMTP credential), otherwise it submits anonymously
 * (local relay, dev sink).
 *
 * The public origin is a property of the brand profile, not the environment.
 * SITE_URL is ignored: setting it is not an error.
 */

import type { BrandId } from "./brand";
import { isBrandId } from "./brand";

export type MailTransport = "smtp" | "json";
export type WaitlistLang = "en" | "es";
export type WaitlistSource = "beta" | "list";

export interface Env {
  /** smtp = real delivery (OCI Email Delivery), json = print the message (dev). */
  transport: MailTransport;
  smtp: {
    host: string;
    port: number;
    /** true = implicit TLS on connect (465). false = STARTTLS/plain (587, 25). */
    secure: boolean;
    user?: string;
    pass?: string;
  };
  /** Approved-sender address used as From: (registered in OCI Email Delivery).
   *  Always the bare address: a legacy "Name <address>" value is accepted and
   *  reduced to its address, because the display name comes from the
   *  brand profile. */
  mailFrom: string;
  mailReplyTo: string;
  /** Mailbox that receives withdrawal notices until the panel exists. */
  notifyEmail: string;
  /** Brand served when neither the X-Site header nor the host selects one. */
  defaultBrand: BrandId;
  /** HMAC key for the withdrawal tokens; rotating it revokes links already sent. */
  tokenSecret: string;
  /** Optional postal address; printed in the legal block only when non-empty. */
  legalPostalAddress?: string;
  rateLimitPerIpPerHour: number;
  rateLimitPerEmailMinutes: number;
}

export interface Problem {
  name: string;
  problem: string;
}

/** The error parseEnv throws; loadEnv turns it into the startup message + exit 1. */
export class EnvValidationError extends Error {
  constructor(readonly problems: readonly Problem[]) {
    super(formatProblems(problems));
    this.name = "EnvValidationError";
  }
}

function formatProblems(problems: readonly Problem[]): string {
  return (
    `The waitlist API cannot start — fix the environment (${problems.length} problem${problems.length === 1 ? "" : "s"}):\n` +
    problems.map((problem) => `  - ${problem.name}: ${problem.problem}`).join("\n")
  );
}

/** Reduces a legacy "Name <address>" value to the bare address, so the brand
 *  profile can own the display name. */
function bareAddress(value: string): string {
  const match = /^[^<]*<([^<>]+)>$/.exec(value.trim());
  return (match ? match[1] : value).trim();
}

/**
 * Pure core of the environment contract: reads the given source (defaults to
 * process.env), collects every problem and throws EnvValidationError listing
 * them all. Side-effect free, so tests exercise the fail-fast cases directly.
 */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const problems: Problem[] = [];

  const raw = (name: string): string | undefined => {
    const value = source[name];
    return value === undefined || value.trim() === "" ? undefined : value.trim();
  };
  const required = (name: string, why: string): string => {
    const value = raw(name);
    if (value === undefined) {
      problems.push({ name, problem: `required — ${why}` });
      return "";
    }
    return value;
  };
  const integer = (name: string, fallback: number, min: number, max: number): number => {
    const value = raw(name);
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      problems.push({ name, problem: `must be an integer between ${min} and ${max}, got "${value}"` });
      return fallback;
    }
    return parsed;
  };
  const flag = (name: string, fallback: boolean): boolean => {
    const value = raw(name);
    if (value === undefined) return fallback;
    if (value === "true") return true;
    if (value === "false") return false;
    problems.push({ name, problem: `must be "true" or "false", got "${value}"` });
    return fallback;
  };

  const transportName = raw("MAIL_TRANSPORT") ?? "smtp";
  if (transportName !== "smtp" && transportName !== "json") {
    problems.push({ name: "MAIL_TRANSPORT", problem: `must be "smtp" or "json", got "${transportName}"` });
  }
  const transport: MailTransport = transportName === "json" ? "json" : "smtp";

  const mailFrom = required("MAIL_FROM", "the address mail is sent from (an approved sender in OCI Email Delivery)");
  const mailReplyTo = required("MAIL_REPLY_TO", "the reply-to address, and the contact shown on the withdrawal pages");
  const notifyEmail = required("NOTIFY_EMAIL", "the mailbox that receives withdrawal notices until the panel exists");
  const tokenSecret = required("TOKEN_SECRET", "the HMAC key for withdrawal links (generate one with: openssl rand -hex 32)");
  if (tokenSecret !== "" && tokenSecret.length < 32) {
    problems.push({ name: "TOKEN_SECRET", problem: `must be at least 32 characters, got ${tokenSecret.length}` });
  }

  const smtpHost = raw("SMTP_HOST");
  if (transport === "smtp" && smtpHost === undefined) {
    problems.push({
      name: "SMTP_HOST",
      problem: 'required when MAIL_TRANSPORT=smtp (the OCI endpoint, e.g. smtp.email.<region>.oci.oraclecloud.com)',
    });
  }

  const smtpUser = raw("SMTP_USER");
  const smtpPassword = raw("SMTP_PASSWORD");
  if ((smtpUser === undefined) !== (smtpPassword === undefined)) {
    problems.push({ name: "SMTP_USER", problem: "SMTP_USER and SMTP_PASSWORD must be set together (or both omitted for an unauthenticated relay)" });
  }

  // The port is fixed so the proxy target and the listener cannot drift apart:
  // a stale API_PORT must fail loudly here instead of reporting healthy while
  // nginx keeps proxying /api/ to 8787.
  const apiPortRaw = raw("API_PORT");
  if (apiPortRaw !== undefined && apiPortRaw !== "8787") {
    problems.push({
      name: "API_PORT",
      problem: "the API port is fixed at 8787 (nginx proxies /api/ to that port); remove API_PORT from the environment",
    });
  }

  const defaultBrandRaw = raw("WAITLIST_DEFAULT_BRAND");
  if (defaultBrandRaw !== undefined && !isBrandId(defaultBrandRaw)) {
    problems.push({
      name: "WAITLIST_DEFAULT_BRAND",
      problem: `must be "openportalhub" or "eventimeline", got "${defaultBrandRaw}"`,
    });
  }

  const smtpPort = integer("SMTP_PORT", 465, 1, 65535);
  const smtpSecure = flag("SMTP_SECURE", true);
  const rateLimitPerIpPerHour = integer("RATE_LIMIT_PER_IP_PER_HOUR", 5, 1, 10_000);
  const rateLimitPerEmailMinutes = integer("RATE_LIMIT_PER_EMAIL_MINUTES", 15, 1, 1_440);

  if (problems.length > 0) {
    throw new EnvValidationError(problems);
  }

  return {
    transport,
    smtp: {
      host: smtpHost ?? "",
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPassword,
    },
    mailFrom: bareAddress(mailFrom),
    mailReplyTo,
    notifyEmail,
    defaultBrand: (defaultBrandRaw ?? "openportalhub") as BrandId,
    tokenSecret,
    legalPostalAddress: raw("LEGAL_POSTAL_ADDRESS"),
    rateLimitPerIpPerHour,
    rateLimitPerEmailMinutes,
  };
}

/**
 * Loads the real process environment. On a failed contract it prints one
 * clear message listing every problem and exits — the startup behaviour the
 * container entrypoint relies on.
 */
export function loadEnv(): Env {
  try {
    return parseEnv(process.env);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}
