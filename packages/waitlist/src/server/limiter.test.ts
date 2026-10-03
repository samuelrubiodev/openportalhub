import { describe, expect, test } from "bun:test";
import { LastSeen, SlidingWindow } from "./limiter";

describe("SlidingWindow (per-IP limiter)", () => {
  test("allows hits up to the limit inside the window and blocks beyond it", () => {
    const limiter = new SlidingWindow(2, 1_000);
    expect(limiter.hit("ip", 0)).toBe(true);
    expect(limiter.hit("ip", 10)).toBe(true);
    expect(limiter.hit("ip", 20)).toBe(false);
  });

  test("frees the budget once the window slides past the hits", () => {
    const limiter = new SlidingWindow(1, 1_000);
    expect(limiter.hit("ip", 0)).toBe(true);
    expect(limiter.hit("ip", 500)).toBe(false);
    expect(limiter.hit("ip", 1_000)).toBe(true); // the hit at 0 expired: 1000 - 0 is not < 1000
  });

  test("counts keys independently", () => {
    const limiter = new SlidingWindow(1, 1_000);
    expect(limiter.hit("a", 0)).toBe(true);
    expect(limiter.hit("b", 0)).toBe(true);
    expect(limiter.hit("a", 1)).toBe(false);
    expect(limiter.hit("b", 1)).toBe(false);
  });

  test("prune forgets expired keys but keeps counting live ones", () => {
    const limiter = new SlidingWindow(1, 1_000);
    expect(limiter.hit("expired", 0)).toBe(true);
    expect(limiter.hit("live", 900)).toBe(true);
    limiter.prune(1_100); // "expired" is out of the window, "live" is not
    expect(limiter.hit("expired", 1_100)).toBe(true); // budget freed by prune
    expect(limiter.hit("live", 1_100)).toBe(false); // still at its limit
  });
});

describe("LastSeen (per-email duplicate window)", () => {
  test("claim admits the first send and blocks repeats inside the window", () => {
    const limiter = new LastSeen(15 * 60 * 1000);
    expect(limiter.claim("a@example.org", 0)).toBe(true);
    expect(limiter.claim("a@example.org", 5 * 60 * 1000)).toBe(false);
  });

  test("claim admits again once the window has passed", () => {
    const limiter = new LastSeen(1_000);
    expect(limiter.claim("a@example.org", 0)).toBe(true);
    expect(limiter.claim("a@example.org", 999)).toBe(false);
    expect(limiter.claim("a@example.org", 1_000)).toBe(true);
  });

  test("release hands the slot back so a retry is possible immediately", () => {
    const limiter = new LastSeen(15 * 60 * 1000);
    expect(limiter.claim("a@example.org", 0)).toBe(true);
    expect(limiter.claim("a@example.org", 1)).toBe(false);
    limiter.release("a@example.org");
    expect(limiter.claim("a@example.org", 2)).toBe(true);
  });

  test("release on an unclaimed key is harmless", () => {
    const limiter = new LastSeen(1_000);
    expect(() => limiter.release("nobody@example.org")).not.toThrow();
  });

  test("prune drops only entries whose window has passed", () => {
    const limiter = new LastSeen(1_000);
    limiter.claim("old", 0);
    limiter.claim("fresh", 900);
    limiter.prune(1_200); // "old": 1200 >= 1000 dropped; "fresh": 300 < 1000 kept
    expect(limiter.claim("fresh", 1_200)).toBe(false);
    expect(limiter.claim("old", 1_200)).toBe(true);
  });
});
