import { afterEach, describe, expect, test } from "bun:test";
import { WaitlistError, submitEmail } from "./client";

// The client posts to the same-origin /api/waitlist; the tests stub the global
// fetch so no server runs and every request is captured. The stub is installed
// per test and the real fetch is always restored, so the suite never leaks a
// mock into another file.
interface CapturedCall {
  url: string
  init: RequestInit | undefined
}

describe("submitEmail", () => {
  const realFetch = globalThis.fetch
  let calls: CapturedCall[] = []
  let responder: (call: CapturedCall) => Response

  const install = (next: (call: CapturedCall) => Response): void => {
    responder = next
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const call: CapturedCall = { url: String(input), init }
      calls.push(call)
      return responder(call)
    }) as typeof fetch
  }

  afterEach(() => {
    globalThis.fetch = realFetch
    calls = []
  })

  test("posts the trimmed email with lang, source and company to /api/waitlist", async () => {
    install(() => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    await submitEmail({ email: "  dev@example.org  ", lang: "es", source: "beta", company: "" })
    expect(calls.length).toBe(1)
    expect(calls[0].url).toBe("/api/waitlist")
    expect(calls[0].init?.method).toBe("POST")
    expect(calls[0].init?.credentials).toBe("omit")
    expect(calls[0].init?.headers).toEqual({ "content-type": "application/json" })
    // An empty company is still sent: the server treats an empty honeypot as
    // "not filled", and only a filled one drops the signup.
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      email: "dev@example.org",
      lang: "es",
      source: "beta",
      company: "",
    })
  })

  test("rejects an address the server would reject, without any request", async () => {
    install(() => new Response("{}", { status: 200 }))
    for (const bad of ["not-an-address", "a@b", "two words@example.org", ""]) {
      let caught: unknown = null
      try {
        await submitEmail({ email: bad, lang: "en", source: "list" })
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(WaitlistError)
      expect((caught as WaitlistError).code).toBe("invalid_email")
    }
    expect(calls.length).toBe(0)
  })

  test("maps 400 to invalid_email", async () => {
    install(() => new Response(JSON.stringify({ ok: false }), { status: 400 }))
    const error = await submitEmail({ email: "dev@example.org", lang: "en", source: "list" }).catch((e) => e)
    expect(error).toBeInstanceOf(WaitlistError)
    expect((error as WaitlistError).code).toBe("invalid_email")
  })

  test("maps 429 to rate_limited", async () => {
    install(() => new Response(JSON.stringify({ ok: false }), { status: 429 }))
    const error = await submitEmail({ email: "dev@example.org", lang: "en", source: "list" }).catch((e) => e)
    expect(error).toBeInstanceOf(WaitlistError)
    expect((error as WaitlistError).code).toBe("rate_limited")
  })

  test("maps other non-OK statuses to unavailable", async () => {
    install(() => new Response(JSON.stringify({ ok: false }), { status: 502 }))
    const error = await submitEmail({ email: "dev@example.org", lang: "en", source: "list" }).catch((e) => e)
    expect(error).toBeInstanceOf(WaitlistError)
    expect((error as WaitlistError).code).toBe("unavailable")
  })

  test("maps a network failure to unavailable so the visitor can retry", async () => {
    install(() => {
      throw new TypeError("fetch failed")
    })
    const error = await submitEmail({ email: "dev@example.org", lang: "en", source: "list" }).catch((e) => e)
    expect(error).toBeInstanceOf(WaitlistError)
    expect((error as WaitlistError).code).toBe("unavailable")
  })

  test("the error is a typed WaitlistError carrying its code and name", () => {
    const error = new WaitlistError("rate_limited")
    expect(error.name).toBe("WaitlistError")
    expect(error.code).toBe("rate_limited")
    expect(error.message).toBe("rate_limited")
  })
})
