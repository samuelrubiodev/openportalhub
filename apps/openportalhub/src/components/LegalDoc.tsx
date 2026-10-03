import { useLang, getLegalDoc, type LegalDict } from '../lib/i18n'
import { hrefFor } from '../lib/pages'

export default function LegalDoc({ doc }: { doc: 'privacy' | 'terms' }) {
  const { lang, t } = useLang()
  const d: LegalDict = getLegalDoc(doc, lang)

  return (
    <section className="section legal">
      <nav className="crumbs" aria-label={t.crumbsAria}>
        <a href="/">OpenPortalHub</a> / {d.docTitle}
      </nav>
      <h1 className="section-title" style={{ marginTop: 0 }}>{d.docTitle}</h1>
      <p className="legal-meta">{d.updated} · {d.docMeta}</p>
      <p className="legal-lead">{d.docLead}</p>
      {d.sections.map((s) => (
        <div className="legal-sec" key={s.h}>
          <h2>{s.h}</h2>
          {s.paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.bullets && (
            <ul>
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <p className="legal-contact">{d.contact}</p>
      <p className="legal-links">
        {doc === 'privacy'
          ? <a href={hrefFor('terms', lang)}>{t.legalTermsLink}</a>
          : <a href={hrefFor('privacy', lang)}>{t.legalPrivacyLink}</a>}
      </p>
    </section>
  )
}
