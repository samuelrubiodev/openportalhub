import SharedWaitlistForm, { type WaitlistCopy } from '@openportalhub/waitlist/react'
import { useLang } from '../lib/i18n'

interface Props {
  source: 'beta' | 'list'
  inputId: string
  /** Class for the <form>: 'waitlist-form' in the hero, 'close-form' (EventApp adds 'beta-form'). */
  formClass: string
  /** true only in the hero: its input and button are absolutely positioned, so they must NOT take the close-* classes. */
  hero?: boolean
  /** Kept for the annotated hero scaffold: data-region="email-input" on the email wrap. */
  emailWrapDataRegion?: string
}

/** Thin site wrapper around the shared waitlist form. The package owns the
 *  markup and the send flow; this file only supplies this site's copy from the
 *  dictionary (the dictionaries are per-site content) and its privacy link,
 *  which differs per site and per language. The public props are unchanged, so
 *  the call sites did not move. Send errors arrive typed from the package
 *  client (@openportalhub/waitlist/client). */
export default function WaitlistForm({ source, inputId, formClass, hero = false, emailWrapDataRegion }: Props) {
  const { t, lang } = useLang()
  const copy: WaitlistCopy = {
    emailLabel: t.emailLabel,
    emailPlaceholder: t.emailPlaceholder,
    join: t.join,
    betaSubmit: t.etBetaSubmit,
    joined: t.joined,
    sending: t.sending,
    consentPre: t.consentPre,
    consentLink: t.consentLink,
    consentError: t.consentError,
    joinedNotice: t.joinedNotice,
    formError: t.formError,
    formErrorBusy: t.formErrorBusy,
    formErrorLater: t.formErrorLater,
  }
  return (
    <SharedWaitlistForm
      source={source}
      inputId={inputId}
      formClass={formClass}
      hero={hero}
      emailWrapDataRegion={emailWrapDataRegion}
      lang={lang}
      privacyHref={lang === 'es' ? '/es/privacy.html' : '/privacy.html'}
      copy={copy}
    />
  )
}
