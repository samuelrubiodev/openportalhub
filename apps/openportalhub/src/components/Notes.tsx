import { useLang } from '../lib/i18n'

const NOTES = [
  { date: '2026-08-19', kindKey: 'n1Kind' as const, textKey: 'n1' as const },
]

export default function Notes() {
  const { t } = useLang()
  return (
    <section id="notes" className="section notes">
      <h2 className="section-title">{t.notesTitle}</h2>
      <p className="section-sub">{t.notesSub}</p>
      <ul className="src-list">
        {NOTES.map((n) => (
          <li key={n.date}>
            <span className="src-name mono">{n.date}</span>
            <span className="src-desc">{t[n.textKey]}</span>
            <span className="src-name mono">{t[n.kindKey]}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
