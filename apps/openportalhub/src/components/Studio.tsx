import { useLang } from '../lib/i18n'

export default function Studio() {
  const { t } = useLang()
  const principles = [t.s1, t.s2, t.s3, t.s4]
  return (
    <section id="studio" className="section studio">
      <h2 className="section-title">{t.studioTitle}</h2>
      <p className="section-sub">{t.studioSub}</p>
      <p className="lic-line">{t.studioBody}</p>
      <ol className="mech-steps">
        {principles.map((p, i) => (
          <li key={i}>
            <span className="mech-time">{String(i + 1).padStart(2, '0')}</span>
            <p>{p}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
