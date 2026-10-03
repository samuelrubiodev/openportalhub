import { useLang, rememberLang } from '../lib/i18n'
import { HOME, pagePath } from '../lib/pages'

/** Public Uptime Kuma status page for the platform's monitors. */
const STATUS_PAGE_URL = 'https://status.openportalhub.org/'

/** Source repository, offered to network users as AGPL-3.0 section 13 requires. */
const SOURCE_URL = 'https://github.com/samuelrubiodev/openportalhub'

export default function LogbookStrip() {
  const { lang, t } = useLang()
  return (
    <footer className="logbook" data-region="logbook-strip">
      <span>{t.logWindows}</span>
      <span>{t.logSources}</span>
      <span className="logbook-spacer" />
      <span className="logbook-badge">{t.preRelease}</span>
      <a className="logbook-lang" href={STATUS_PAGE_URL}>{t.statusLink}</a>
      <a className="logbook-lang" href={SOURCE_URL}>{t.sourceLink}</a>
      <span className="logbook-lang">
        {/* The same two links as the topbar. The explicit spaces keep the
            `EN | ES` look: this span is not a flex gap container like
            .lang-switch, and JSX drops newline-only whitespace. */}
        <a href={pagePath(HOME, 'en')} className={`lang ${lang === 'en' ? 'active' : ''}`} aria-current={lang === 'en' ? 'true' : undefined} onClick={() => rememberLang('en')}>EN</a>
        {' '}<span className="lang-sep">|</span>{' '}
        <a href={pagePath(HOME, 'es')} className={`lang ${lang === 'es' ? 'active' : ''}`} aria-current={lang === 'es' ? 'true' : undefined} onClick={() => rememberLang('es')}>ES</a>
      </span>
    </footer>
  )
}
