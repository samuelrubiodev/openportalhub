import { useLang, type Dict } from '../lib/i18n'

type Key = keyof Dict

const ROWS: Array<{
  n: string
  featured: boolean
  nameKey: Key
  typeKey: Key
  platformKey: Key | ''
  statusKey: Key
  version: string
  year: string
}> = [
  {
    n: '001',
    featured: true,
    nameKey: 'p1Name',
    typeKey: 'p1Type',
    platformKey: 'p1Platform',
    statusKey: 'stActive',
    version: 'beta',
    year: '2026',
  },
]

export default function Catalog() {
  const { t } = useLang()
  return (
    <section id="catalog" className="section catalog">
      <h2 className="section-title">{t.catTitle}</h2>
      <p className="section-sub">{t.catSub}</p>
      <div className="cat-scroll">
        <table className="cat-table">
          <thead>
            <tr>
              <th>№</th>
              <th>{t.colProject}</th>
              <th>{t.colType}</th>
              <th>{t.colPlatform}</th>
              <th>{t.colStatus}</th>
              <th>{t.colVersion}</th>
              <th>{t.colYear}</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.n}>
                <td className="mono dim">{r.n}</td>
                <td>
                  {r.featured ? <a href="event-timeline.html">{t[r.nameKey]}</a> : t[r.nameKey]}
                  {r.featured && <span className="cat-badge">{t.p1Featured}</span>}
                </td>
                <td>{t[r.typeKey]}</td>
                <td>{r.platformKey ? t[r.platformKey] : '—'}</td>
                <td>{t[r.statusKey]}</td>
                <td className="mono">{r.version}</td>
                <td className="mono">{r.year}</td>
                <td>{r.featured ? <a href="event-timeline.html">{t.open}</a> : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lic-note">{t.catFoot}</p>
    </section>
  )
}
