import SharedWaitlistForm, { type WaitlistCopy } from '@openportalhub/waitlist/react'
import { useLang } from '../lib/i18n'

interface Props {
  inputId: string
  /** Class for the <form>: 'waitlist-form' in the hero, 'close-form' in the close section. */
  formClass: string
  /** true only in the hero: its input and button are absolutely positioned, so they must NOT take the close-* classes. */
  hero?: boolean
  /** Kept for the annotated hero scaffold: data-region="email-input" on the email wrap. */
  emailWrapDataRegion?: string
}

/** Thin site wrapper around the shared waitlist form. The package owns the
 *  markup and the send flow; this file only supplies this site's copy from the
 *  dictionary and its privacy link. EventTimeline publishes no policy of its
 *  own: the link points at the OpenPortalHub policy, in the reader's language.
 *  The site has a single submit intent, so the copy has no separate beta label
 *  and the shared form falls back to `join` for any source. */
export default function WaitlistForm({ inputId, formClass, hero = false, emailWrapDataRegion }: Props) {
  const { t, lang } = useLang()
  const copy: WaitlistCopy = {
    emailLabel: t.emailLabel,
    emailPlaceholder: t.emailPlaceholder,
    join: t.join,
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
      source="list"
      inputId={inputId}
      formClass={formClass}
      hero={hero}
      emailWrapDataRegion={emailWrapDataRegion}
      lang={lang}
      privacyHref={lang === 'es' ? 'https://openportalhub.org/es/privacy.html' : 'https://openportalhub.org/privacy.html'}
      copy={copy}
    />
  )
}
