import { describe, expect, test } from "bun:test";
import { signWaitlistToken, verifyWaitlistToken } from "./token";

const SECRET = "test-secret-0123456789abcdef-0123456789abcdef";
const OTHER_SECRET = "other-secret-0123456789abcdef-0123456789ab";

describe("waitlist tokens", () => {
  test("a signed token verifies to the payload it was signed with", () => {
    const payload = { email: "person@example.org", lang: "en" as const, iat: 1_700_000_000 };
    const token = signWaitlistToken(payload, SECRET);
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(verifyWaitlistToken(token, SECRET)).toEqual(payload);
  });

  test("a tampered payload is rejected", () => {
    const token = signWaitlistToken({ email: "person@example.org", lang: "es", iat: 42 }, SECRET);
    const dot = token.indexOf(".");
    const forged = `${Buffer.from(JSON.stringify({ email: "attacker@example.org", lang: "es", iat: 42 }), "utf8").toString("base64url")}.${token.slice(dot + 1)}`;
    expect(forged).not.toEqual(token);
    expect(verifyWaitlistToken(forged, SECRET)).toBeNull();
  });

  test("a tampered signature is rejected", () => {
    const token = signWaitlistToken({ email: "person@example.org", lang: "en", iat: 1 }, SECRET);
    const forged = `${token.slice(0, token.indexOf(".") + 1)}${"A".repeat(43)}`;
    expect(verifyWaitlistToken(forged, SECRET)).toBeNull();
  });

  test("a token signed with a different secret is rejected", () => {
    const token = signWaitlistToken({ email: "person@example.org", lang: "en", iat: 1 }, SECRET);
    expect(verifyWaitlistToken(token, OTHER_SECRET)).toBeNull();
  });

  test("malformed tokens are rejected", () => {
    expect(verifyWaitlistToken("", SECRET)).toBeNull();
    expect(verifyWaitlistToken("not-a-token", SECRET)).toBeNull();
    const encoded = Buffer.from(JSON.stringify({ email: "person@example.org", lang: "en", iat: 1 }), "utf8").toString("base64url");
    expect(verifyWaitlistToken(`${encoded}.`, SECRET)).toBeNull(); // empty mac
    expect(verifyWaitlistToken(`${encoded}.extra.parts`, SECRET)).toBeNull(); // dots in the mac
    expect(verifyWaitlistToken("x".repeat(600), SECRET)).toBeNull(); // overlong
  });
});
