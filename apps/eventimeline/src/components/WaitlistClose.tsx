import { useLang } from '../lib/i18n'
import WaitlistForm from './WaitlistForm'

export default function WaitlistClose() {
  const { t } = useLang()
  return (
    <section id="waitlist" className="section close">
      <h2 className="section-title">{t.closeTitle}</h2>
      <p className="close-sub">{t.closeSub}</p>
      <WaitlistForm inputId="close-email-input" formClass="close-form" />
      <p className="license-note close-license">{t.license}</p>
    </section>
  )
}
