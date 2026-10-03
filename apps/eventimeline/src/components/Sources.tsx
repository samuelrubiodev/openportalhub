import { useLang } from '../lib/i18n'

export default function Sources() {
  const { t } = useLang()
  return (
    <section className="section sources">
      <h2 className="section-title">{t.srcTitle}</h2>
      <p className="section-sub">{t.srcSub}</p>
      <ul className="src-list">
        <li><span className="src-name">System</span><span className="src-desc">{t.srcSystem}</span></li>
        <li><span className="src-name">Security</span><span className="src-desc">{t.srcSecurity}</span></li>
        <li><span className="src-name">Application</span><span className="src-desc">{t.srcApplication}</span></li>
      </ul>
    </section>
  )
}
