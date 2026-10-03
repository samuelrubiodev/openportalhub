import { useState, type FormEvent } from 'react'
import { submitEmail, WaitlistError, type WaitlistErrorCode, type WaitlistLang, type WaitlistSource } from './client'

/** The strings the shared form renders. Sites own their dictionaries — the copy
 *  is per-site content — so the form takes it as props instead of reading an
 *  app dictionary. `betaSubmit` is optional on purpose: openportalhub has two
 *  submit intents (a beta request and the plain waitlist) while a site with a
 *  single intent has no separate beta label. Documented fallback: when
 *  `betaSubmit` is absent, a `source: 'beta'` form submits with `join`. */
export interface WaitlistCopy {
  emailLabel: string
  emailPlaceholder: string
  join: string
  betaSubmit?: string
  joined: string
  sending: string
  consentPre: string
  consentLink: string
  consentError: string
  /** Success notice; `{email}` is replaced with the address that was sent. */
  joinedNotice: string
  formError: string
  formErrorBusy: string
  formErrorLater: string
}

export interface WaitlistFormProps {
  copy: WaitlistCopy
  /** Privacy policy link, in the reader's language. Per site and per language,
   *  so the site supplies it; the package cannot know it. */
  privacyHref: string
  /** Language of the page, sent with the signup so the mail matches it. */
  lang: WaitlistLang
  source: WaitlistSource
  inputId: string
  /** Class for the <form>: 'waitlist-form' in the hero, 'close-form' (a page can add more, e.g. 'beta-form'). */
  formClass: string
  /** true only in the hero: its input and button are absolutely positioned, so they must NOT take the close-* classes. */
  hero?: boolean
  /** Kept for the annotated hero scaffold: data-region="email-input" on the email wrap. */
  emailWrapDataRegion?: string
}

type ErrorKind = 'consent' | WaitlistErrorCode

/** The one waitlist form: email, consent, honeypot, submit. Shared by every
 *  site and every placement; only the ids, the source and the form class
 *  differ between them. Copy arrives as props and send errors arrive typed
 *  (./client.ts). */
export default function WaitlistForm({ copy, privacyHref, lang, source, inputId, formClass, hero = false, emailWrapDataRegion }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null)
  const [sentTo, setSentTo] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'sending' || status === 'done') return
    if (!consent) {
      // Consent is required before anything is sent: no request without it.
      setStatus('error')
      setErrorKind('consent')
      return
    }
    setStatus('sending')
    try {
      await submitEmail({ email, lang, source, company })
      setSentTo(email)
      setErrorKind(null)
      setStatus('done')
    } catch (error) {
      setStatus('error')
      setErrorKind(error instanceof WaitlistError ? error.code : 'unavailable')
    }
  }

  const busy = status === 'sending' || status === 'done'

  return (
    <>
      <form className={formClass} onSubmit={onSubmit} noValidate>
        <div
          className={hero ? 'email-wrap' : 'email-wrap close-email'}
          {...(emailWrapDataRegion ? { 'data-region': emailWrapDataRegion } : {})}
        >
          <label className="visually-hidden" htmlFor={inputId}>{copy.emailLabel}</label>
          <input
            id={inputId}
            type="email"
            name="email"
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); setErrorKind(null) }}
            disabled={busy}
          />
        </div>
        <button className={hero ? 'waitlist-button' : 'waitlist-button close-btn'} type="submit" disabled={busy}>
          {status === 'done' ? copy.joined : status === 'sending' ? copy.sending : source === 'beta' ? copy.betaSubmit ?? copy.join : copy.join}
        </button>
        {/* Honeypot: hidden from people and assistive tech. A bot that fills it
            gets the same success answer as anyone else and no mail is sent. */}
        <div className="visually-hidden" aria-hidden="true">
          <input
            id={`${inputId}-company`}
            type="text"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      </form>
      <div className="consent">
        <input
          id={`${inputId}-consent`}
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (status === 'error') setStatus('idle'); setErrorKind(null) }}
        />
        <label htmlFor={`${inputId}-consent`}>
          {copy.consentPre} <a href={privacyHref}>{copy.consentLink}</a>.
        </label>
      </div>
      {status === 'error' && errorKind !== null && (
        <p className={hero ? 'form-error' : 'form-error close-error'} role="alert">
          {errorKind === 'consent'
            ? copy.consentError
            : errorKind === 'rate_limited'
              ? copy.formErrorBusy
              : errorKind === 'unavailable'
                ? copy.formErrorLater
                : copy.formError}
        </p>
      )}
      {status === 'done' && (
        <p className="form-done" role="status">{copy.joinedNotice.replace('{email}', sentTo)}</p>
      )}
    </>
  )
}
