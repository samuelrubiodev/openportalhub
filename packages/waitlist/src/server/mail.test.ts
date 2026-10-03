import { describe, expect, test } from "bun:test";
import type { Transporter } from "nodemailer";
import type { Env } from "./env";
import { buildTransport, sendWaitlistConfirmation } from "./mail";
import { BRANDS } from "./brand";

function jsonEnv(): Env {
  return {
    transport: "json",
    smtp: { host: "", port: 465, secure: true },
    mailFrom: "beta@example.org",
    mailReplyTo: "legal@example.org",
    notifyEmail: "ops@example.org",
    tokenSecret: "0123456789abcdef0123456789abcdef",
    defaultBrand: "openportalhub",
    legalPostalAddress: "Test Street 1, 00000 Testville",
    rateLimitPerIpPerHour: 5,
    rateLimitPerEmailMinutes: 15,
  };
}

/** Wraps the real json transport so the serialized message can be inspected
 *  without touching the network. nodemailer's jsonTransport serializes the
 *  message as a JSON document in which the From: value is already parsed into
 *  {address, name} — that parse is what proves the composite form
 *  "DisplayName <address>" was accepted. */
function captureJsonMessages(): { transport: Transporter; messages: string[] } {
  const transport = buildTransport(jsonEnv());
  const messages: string[] = [];
  const real = transport.sendMail.bind(transport);
  transport.sendMail = (async (mail: unknown) => {
    const info = await real(mail as never);
    const message = (info as unknown as { message?: string }).message;
    if (typeof message === "string") messages.push(message);
    return info;
  }) as Transporter["sendMail"];
  return { transport, messages };
}

describe("confirmation mail through the json transport (no network)", () => {
  test("the openportalhub signup goes out with the profile display name, subject and one-click links", async () => {
    const { transport, messages } = captureJsonMessages();
    const unsubscribeUrl = await sendWaitlistConfirmation(jsonEnv(), transport, BRANDS.openportalhub, {
      email: "person@example.org",
      lang: "en",
      source: "beta",
    });

    expect(messages).toHaveLength(1);
    const message = messages[0];
    expect(unsubscribeUrl.startsWith(`${BRANDS.openportalhub.siteUrl}/api/waitlist/unsubscribe?token=`)).toBe(true);
    expect(message).toContain(`"from":{"address":"beta@example.org","name":"OpenPortalHub"}`);
    expect(message).toContain(`"replyTo":[{"address":"legal@example.org","name":""}]`);
    expect(message).toContain(`"to":[{"address":"person@example.org","name":""}]`);
    expect(message).toContain(`"subject":"You are on the OpenPortalHub list"`);
    expect(message).toContain(BRANDS.openportalhub.privacyUrls.en);
    expect(message).toContain(`"List-Unsubscribe":"<${unsubscribeUrl}>"`);
    expect(message).toContain(`"List-Unsubscribe-Post":"List-Unsubscribe=One-Click"`);
    expect(message).toContain(`"Auto-Submitted":"auto-generated"`);
  });

  test("the eventimeline signup goes out as EventTimeline with the eventimeline unsubscribe origin", async () => {
    const { transport, messages } = captureJsonMessages();
    const unsubscribeUrl = await sendWaitlistConfirmation(jsonEnv(), transport, BRANDS.eventimeline, {
      email: "person@example.org",
      lang: "en",
      source: "list",
    });

    expect(messages).toHaveLength(1);
    const message = messages[0];
    expect(unsubscribeUrl.startsWith(`${BRANDS.eventimeline.siteUrl}/api/waitlist/unsubscribe?token=`)).toBe(true);
    expect(message).toContain(`"from":{"address":"beta@example.org","name":"EventTimeline"}`);
    expect(message).toContain(`"subject":"You are on the EventTimeline list"`);
    // No policy page of its own: the English link points at OpenPortalHub's.
    expect(message).toContain(BRANDS.eventimeline.privacyUrls.en);
    expect(message).toContain(`"List-Unsubscribe":"<${unsubscribeUrl}>"`);
    expect(message).not.toContain(`"name":"OpenPortalHub"`);
  });

  test("a Spanish signup on either brand carries the Spanish policy link, never the English page", async () => {
    const { transport, messages } = captureJsonMessages();
    for (const brand of [BRANDS.openportalhub, BRANDS.eventimeline]) {
      await sendWaitlistConfirmation(jsonEnv(), transport, brand, {
        email: "person@example.org",
        lang: "es",
        source: "beta",
      });
    }

    expect(messages).toHaveLength(2);
    for (const message of messages) {
      expect(message).toContain(BRANDS.openportalhub.privacyUrls.es);
      expect(message).not.toContain(BRANDS.openportalhub.privacyUrls.en);
    }
  });
});
