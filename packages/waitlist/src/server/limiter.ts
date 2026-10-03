/**
 * The two in-memory rate limiters of the waitlist API.
 *
 * Both are per process and best effort: a restart or a second replica resets
 * them — accepted as such while there is no storage (user decision 2).
 */

/** Sliding-window limiter over an in-memory Map with TTL pruning. */
export class SlidingWindow {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Records a hit; returns false when the key is already at the limit. */
  hit(key: string, now: number = Date.now()): boolean {
    const counted = this.alive(key, now);
    if (counted.length >= this.limit) return false;
    counted.push(now);
    this.hits.set(key, counted);
    return true;
  }

  prune(now: number = Date.now()): void {
    for (const key of this.hits.keys()) {
      const alive = this.alive(key, now);
      if (alive.length === 0) this.hits.delete(key);
    }
  }

  private alive(key: string, now: number): number[] {
    const previous = this.hits.get(key) ?? [];
    const counted = previous.filter((t) => now - t < this.windowMs);
    if (counted.length > 0) this.hits.set(key, counted);
    else this.hits.delete(key);
    return counted;
  }
}

/** One send per address per window. claim() marks the address and returns
 *  false only while the window is still open, so two concurrent posts for a
 *  fresh address cannot both reach the send — there is no await between the
 *  claim and the marking. release() gives the slot back when nothing was sent
 *  (rate limited or failed send), so a retry stays possible. */
export class LastSeen {
  private readonly seen = new Map<string, number>();

  constructor(private readonly windowMs: number) {}

  claim(key: string, now: number = Date.now()): boolean {
    const last = this.seen.get(key);
    if (last !== undefined && now - last < this.windowMs) return false;
    this.seen.set(key, now);
    return true;
  }

  release(key: string): void {
    this.seen.delete(key);
  }

  prune(now: number = Date.now()): void {
    for (const [key, last] of this.seen) {
      if (now - last >= this.windowMs) this.seen.delete(key);
    }
  }
}
