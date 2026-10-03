/**
 * Nodemailer transport and the messages the API sends.
 *
 * OCI Email Delivery: implicit TLS on 465 (Oracle's recommended submission
 * port), STARTTLS on 587, plain 25. Timeouts are 10 s per phase (connection,
 * greeting, socket) because the visitor is waiting on the POST response — a
 * dead relay must fail visibly, not hang the request.
 *
 * The display name in the From: header comes from the brand profile (the mail
 * goes out as "EventTimeline <address>" for that brand); MAIL_FROM stays a
 * global, bare address.
 */
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { Env, WaitlistLang, WaitlistSource } from "./env";
import type { BrandProfile } from "./brand";
import { signWaitlistToken } from "./token";
import { renderConfirmationEmail, renderWithdrawalNotice } from "./templates";

const TEN_SECONDS_MS = 10_000;

export function buildTransport(env: Env): Transporter {
  if (env.transport === "json") {
    // Dev/CI: the message is serialized and printed instead of sent.
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    // OCI requires the SMTP credential pair; an unauthenticated relay (local
    // sink, internal smarthost) is supported by omitting auth entirely.
    auth: env.smtp.user && env.smtp.pass ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    connectionTimeout: TEN_SECONDS_MS,
    greetingTimeout: TEN_SECONDS_MS,
    socketTimeout: TEN_SECONDS_MS,
  });
}

export interface WaitlistSignup {
  email: string;
  lang: WaitlistLang;
  source: WaitlistSource;
}

/**
 * Sends the confirmation mail for one signup and returns the unsubscribe URL
 * that was embedded (the caller logs the route, never the token).
 */
export async function sendWaitlistConfirmation(env: Env, transport: Transporter, brand: BrandProfile, signup: WaitlistSignup): Promise<string> {
  const unsubscribeUrl = unsubscribeUrlFor(brand, signup.email, signup.lang, env.tokenSecret);
  const message = renderConfirmationEmail({
    email: signup.email,
    lang: signup.lang,
    source: signup.source,
    unsubscribeUrl,
    brand,
    postalAddress: env.legalPostalAddress,
  });

  await transport.sendMail({
    from: `${brand.productName} <${env.mailFrom}>`,
    replyTo: env.mailReplyTo,
    to: signup.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: {
      "Auto-Submitted": "auto-generated",
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  return unsubscribeUrl;
}

/**
 * Operator notification for a withdrawal (the record while there is no
 * storage, so it must actually land): two attempts, 400 ms apart, each failure
 * logged with the masked address, and the last error propagated so the route
 * can answer 502 instead of confirming a withdrawal nobody wrote down.
 *
 * The notice carries Auto-Submitted and a text alternative but deliberately
 * omits List-Unsubscribe(-Post): it is not a subscription mail, and a one-click
 * link back to the same route would make mail clients re-trigger the notice.
 */
export async function notifyWithdrawal(env: Env, transport: Transporter, brand: BrandProfile, withdrawal: { email: string; lang: WaitlistLang; iat: number }): Promise<void> {
  const message = renderWithdrawalNotice({
    email: withdrawal.email,
    lang: withdrawal.lang,
    iat: withdrawal.iat,
    brand,
  });
  const mail = {
    from: `${brand.productName} <${env.mailFrom}>`,
    replyTo: withdrawal.email,
    to: env.notifyEmail,
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: {
      "Auto-Submitted": "auto-generated",
    },
  };
  try {
    await transport.sendMail(mail);
    return;
  } catch (error) {
    console.error(`[waitlist] withdrawal notice attempt 1/2 failed (email=${maskEmail(withdrawal.email)}): ${error instanceof Error ? error.message : String(error)}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 400));
  try {
    await transport.sendMail(mail);
  } catch (error) {
    console.error(`[waitlist] withdrawal notice attempt 2/2 failed (email=${maskEmail(withdrawal.email)}): ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

function unsubscribeUrlFor(brand: BrandProfile, email: string, lang: WaitlistLang, tokenSecret: string): string {
  const token = signWaitlistToken({ email, lang, iat: Math.floor(Date.now() / 1000) }, tokenSecret);
  return `${brand.siteUrl}/api/waitlist/unsubscribe?token=${token}`;
}

/** Same masking as the API request logs (a***@domain). */
function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`;
}
