/**
 * Waitlist submission client: POST /api/waitlist on the same origin — nginx
 * proxies /api/ to the api service in production, and the Vite dev server
 * proxies it to 127.0.0.1:8787 in development. Errors are typed so the forms
 * can react without parsing strings; the address check mirrors the server's.
 */
export type WaitlistSource = 'beta' | 'list'
export type WaitlistLang = 'en' | 'es'
export type WaitlistErrorCode = 'invalid_email' | 'rate_limited' | 'unavailable'

export class WaitlistError extends Error {
  readonly code: WaitlistErrorCode

  constructor(code: WaitlistErrorCode) {
    super(code)
    this.name = 'WaitlistError'
    this.code = code
  }
}

// Same shape as the server-side check in server/index.ts.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitEmail(input: {
  email: string
  lang: WaitlistLang
  source: WaitlistSource
  company?: string
}): Promise<void> {
  const email = input.email.trim()
  if (!EMAIL_PATTERN.test(email)) {
    throw new WaitlistError('invalid_email')
  }

  let response: Response
  try {
    response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, lang: input.lang, source: input.source, company: input.company }),
      // The API is anonymous by design: no cookies, no credentials.
      credentials: 'omit',
    })
  } catch {
    // Network failure, dev server down: the visitor must be able to retry.
    throw new WaitlistError('unavailable')
  }

  if (response.status === 400) throw new WaitlistError('invalid_email')
  if (response.status === 429) throw new WaitlistError('rate_limited')
  if (!response.ok) throw new WaitlistError('unavailable')
}
