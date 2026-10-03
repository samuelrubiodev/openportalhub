import { describe, expect, test } from "bun:test";
import { isValidWaitlistEmail } from "./index";

describe("waitlist email validation", () => {
  test("accepts ordinary addresses", () => {
    expect(isValidWaitlistEmail("person@example.org")).toBe(true);
    expect(isValidWaitlistEmail("  person@example.org  ")).toBe(true);
    expect(isValidWaitlistEmail("a.b+tag@sub.domain.co.uk")).toBe(true);
  });

  test("rejects non-strings and empty values", () => {
    expect(isValidWaitlistEmail(undefined)).toBe(false);
    expect(isValidWaitlistEmail(42)).toBe(false);
    expect(isValidWaitlistEmail(null)).toBe(false);
    expect(isValidWaitlistEmail("")).toBe(false);
    expect(isValidWaitlistEmail("   ")).toBe(false);
  });

  test("rejects control characters so nothing reaches a SMTP header line", () => {
    expect(isValidWaitlistEmail("person@example.org\nBcc: victim@example.org")).toBe(false);
    expect(isValidWaitlistEmail("person\r@example.org")).toBe(false);
    expect(isValidWaitlistEmail("per\u0000son@example.org")).toBe(false);
    expect(isValidWaitlistEmail("per\tson@example.org")).toBe(false);
    expect(isValidWaitlistEmail("person@example.org\u007f")).toBe(false);
  });

  test("rejects broken shapes", () => {
    expect(isValidWaitlistEmail("person@example")).toBe(false);
    expect(isValidWaitlistEmail("@example.org")).toBe(false);
    expect(isValidWaitlistEmail("person@")).toBe(false);
    expect(isValidWaitlistEmail("personexample.org")).toBe(false);
  });

  test("enforces the RFC 5321 length limits", () => {
    expect(isValidWaitlistEmail(`${"a".repeat(64)}@example.org`)).toBe(true); // local part: exactly 64
    expect(isValidWaitlistEmail(`${"a".repeat(65)}@example.org`)).toBe(false); // local part: 65
    expect(isValidWaitlistEmail(`a@${"b".repeat(248)}.org`)).toBe(true); // total: exactly 254
    expect(isValidWaitlistEmail(`a@${"b".repeat(249)}.org`)).toBe(false); // total: 255
  });
});
