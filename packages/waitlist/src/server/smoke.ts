/**
 * First-time SMTP setup check: sends one real message through the configured
 * transport. Run it once after the Oracle Email Delivery approved sender, the
 * SMTP credential and the SPF/DKIM records exist:
 *
 *   bun packages/waitlist/src/server/smoke.ts you@example.org [en|es] [beta|list] [openportalhub|eventimeline]
 *
 * Uses the same environment contract as the API (values from .env or the
 * environment); the recipient receives the same mail a signup would. The
 * brand defaults to WAITLIST_DEFAULT_BRAND (openportalhub when unset).
 */
import { loadEnv } from "./env";
import type { WaitlistLang, WaitlistSource } from "./env";
import { BRANDS, isBrandId } from "./brand";
import { buildTransport, sendWaitlistConfirmation } from "./mail";

/** Same masking as the API request logs. */
function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${email.slice(0, 1)}***@${email.slice(at + 1)}`;
}

async function main(): Promise<void> {
  const recipient = process.argv[2];
  if (recipient === undefined || recipient.trim() === "") {
    console.error("usage: bun packages/waitlist/src/server/smoke.ts <recipient> [en|es] [beta|list] [openportalhub|eventimeline]");
    process.exit(2);
  }
  const lang: WaitlistLang = process.argv[3] === "es" ? "es" : "en";
  const source: WaitlistSource = process.argv[4] === "list" ? "list" : "beta";
  const brandArg = process.argv[5];

  // loadEnv exits non-zero with one clear message when the environment is wrong.
  const env = loadEnv();
  if (brandArg !== undefined && !isBrandId(brandArg)) {
    console.error(`unknown brand "${brandArg}" — expected one of: ${Object.keys(BRANDS).join(", ")}`);
    process.exit(2);
  }
  const brand = BRANDS[brandArg ?? env.defaultBrand];
  const transport = buildTransport(env);
  const address = recipient.trim().toLowerCase();

  try {
    await sendWaitlistConfirmation(env, transport, brand, { email: address, lang, source });
    console.log(`[smoke] sent the ${source} confirmation (${lang}) as ${brand.productName} to ${maskEmail(address)} via ${env.transport}`);
    if (env.transport === "smtp") console.log("[smoke] check the inbox and the spam folder; approved senders reject unregistered From: addresses");
  } catch (error) {
    console.error(`[smoke] send failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

if (import.meta.main) await main();
