import { describe, expect, test } from "bun:test";
import { EnvValidationError, parseEnv } from "./env";

const SECRET = "0123456789abcdef0123456789abcdef"; // exactly 32 chars

/** Minimal contract-complete environment for the json transport. */
function baseEnv(): Record<string, string> {
  return {
    MAIL_FROM: "beta@example.org",
    MAIL_REPLY_TO: "legal@example.org",
    NOTIFY_EMAIL: "ops@example.org",
    TOKEN_SECRET: SECRET,
    MAIL_TRANSPORT: "json",
  };
}

/** Returns the problem names parseEnv raised, or [] when it parsed cleanly. */
function problemsOf(source: Record<string, string | undefined>): string[] {
  try {
    parseEnv(source);
  } catch (error) {
    if (error instanceof EnvValidationError) return error.problems.map((problem) => problem.name);
    throw error;
  }
  return [];
}

describe("waitlist environment contract", () => {
  test("a contract-complete environment parses with the documented defaults", () => {
    const env = parseEnv(baseEnv());
    expect(env.transport).toBe("json");
    expect(env.smtp.port).toBe(465); // default
    expect(env.smtp.secure).toBe(true); // default
    expect(env.defaultBrand).toBe("openportalhub"); // fallback brand
    expect(env.rateLimitPerIpPerHour).toBe(5);
    expect(env.rateLimitPerEmailMinutes).toBe(15);
    expect(env.legalPostalAddress).toBeUndefined();
  });

  test("a missing MAIL_FROM is a problem", () => {
    const source = baseEnv();
    delete source.MAIL_FROM;
    expect(problemsOf(source)).toEqual(["MAIL_FROM"]);
  });

  test("a missing TOKEN_SECRET is a problem", () => {
    const source = baseEnv();
    delete source.TOKEN_SECRET;
    expect(problemsOf(source)).toEqual(["TOKEN_SECRET"]);
  });

  test("a short TOKEN_SECRET is a problem", () => {
    const source = baseEnv();
    source.TOKEN_SECRET = "too-short";
    expect(problemsOf(source)).toEqual(["TOKEN_SECRET"]);
  });

  test("SMTP_USER without SMTP_PASSWORD is a problem", () => {
    const source = baseEnv();
    source.MAIL_TRANSPORT = "smtp";
    source.SMTP_HOST = "smtp.example.org";
    source.SMTP_USER = "user@example.org";
    expect(problemsOf(source)).toEqual(["SMTP_USER"]);
  });

  test("SMTP_PASSWORD without SMTP_USER is a problem", () => {
    const source = baseEnv();
    source.MAIL_TRANSPORT = "smtp";
    source.SMTP_HOST = "smtp.example.org";
    source.SMTP_PASSWORD = "hunter2";
    expect(problemsOf(source)).toEqual(["SMTP_USER"]);
  });

  test("a missing SMTP_HOST with the smtp transport is a problem, json does not need it", () => {
    const source = baseEnv();
    source.MAIL_TRANSPORT = "smtp";
    expect(problemsOf(source)).toEqual(["SMTP_HOST"]);
    source.MAIL_TRANSPORT = "json";
    expect(problemsOf(source)).toEqual([]);
  });

  test("a non-8787 API_PORT is a problem; 8787 and unset are fine", () => {
    const source = baseEnv();
    source.API_PORT = "8788";
    expect(problemsOf(source)).toEqual(["API_PORT"]);
    source.API_PORT = "8787";
    expect(problemsOf(source)).toEqual([]);
    delete source.API_PORT;
    expect(problemsOf(source)).toEqual([]);
  });

  test("missing MAIL_REPLY_TO or NOTIFY_EMAIL are problems (the hardcoded default is gone)", () => {
    const withoutReplyTo = baseEnv();
    delete withoutReplyTo.MAIL_REPLY_TO;
    expect(problemsOf(withoutReplyTo)).toEqual(["MAIL_REPLY_TO"]);

    const withoutNotify = baseEnv();
    delete withoutNotify.NOTIFY_EMAIL;
    expect(problemsOf(withoutNotify)).toEqual(["NOTIFY_EMAIL"]);
  });

  test("an unknown WAITLIST_DEFAULT_BRAND is a problem; a known one is honoured", () => {
    const bad = baseEnv();
    bad.WAITLIST_DEFAULT_BRAND = "acme";
    expect(problemsOf(bad)).toEqual(["WAITLIST_DEFAULT_BRAND"]);

    const good = baseEnv();
    good.WAITLIST_DEFAULT_BRAND = "eventimeline";
    expect(parseEnv(good).defaultBrand).toBe("eventimeline");
  });

  test("SITE_URL is ignored, not an error, and never appears in the env", () => {
    const source = baseEnv();
    source.SITE_URL = "https://legacy.example.org";
    const env = parseEnv(source);
    expect(problemsOf(source)).toEqual([]);
    expect(Object.hasOwn(env, "siteUrl")).toBe(false);
  });

  test("a legacy MAIL_FROM display-name form is reduced to the bare address", () => {
    const source = baseEnv();
    source.MAIL_FROM = "OpenPortalHub <beta@example.org>";
    expect(parseEnv(source).mailFrom).toBe("beta@example.org");
  });

  test("the error lists every problem in one message", () => {
    const source: Record<string, string | undefined> = {};
    try {
      parseEnv(source);
      throw new Error("expected parseEnv to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const validation = error as EnvValidationError;
      expect(validation.problems.length).toBeGreaterThanOrEqual(4);
      expect(validation.message).toContain("The waitlist API cannot start");
      expect(validation.message).toContain("- MAIL_FROM:");
      expect(validation.message).toContain("- MAIL_REPLY_TO:");
      expect(validation.message).toContain("- NOTIFY_EMAIL:");
      expect(validation.message).toContain("- TOKEN_SECRET:");
    }
  });
});
