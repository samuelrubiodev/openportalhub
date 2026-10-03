import { useLang } from '../lib/i18n'

export default function Licensing() {
  const { t } = useLang()
  return (
    <section id="pricing" className="section licensing">
      <h2 className="section-title">{t.licTitle}</h2>
      <p className="lic-line">{t.licLine1}</p>
      <p className="lic-line">{t.licLine2}</p>
      <p className="lic-note">{t.licNote}</p>
    </section>
  )
}
