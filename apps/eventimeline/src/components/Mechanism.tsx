import { useLang } from '../lib/i18n'

export default function Mechanism() {
  const { t } = useLang()
  return (
    <section id="how-it-works" className="section mechanism">
      <h2 className="section-title">{t.mechTitle}</h2>
      <ol className="mech-steps">
        <li>
          <span className="mech-time">01</span>
          <h3>{t.mech1Title}</h3>
          <p>{t.mech1Body}</p>
        </li>
        <li>
          <span className="mech-time">02</span>
          <h3>{t.mech2Title}</h3>
          <p>{t.mech2Body}</p>
        </li>
        <li>
          <span className="mech-time">03</span>
          <h3>{t.mech3Title}</h3>
          <p>{t.mech3Body}</p>
        </li>
      </ol>
    </section>
  )
}
