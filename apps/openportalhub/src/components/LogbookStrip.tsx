import { useLang } from '../lib/i18n'
import { hrefFor } from '../lib/pages'

/** Public Uptime Kuma status page for the platform's monitors. */
const STATUS_PAGE_URL = 'https://status.openportalhub.org/'

/** Source repository, offered to network users as AGPL-3.0 section 13 requires. */
const SOURCE_URL = 'https://github.com/samuelrubiodev/openportalhub'

export default function LogbookStrip() {
  const { lang, t } = useLang()
  return (
    <footer className="logbook" data-region="logbook-strip">
      <a className="logbook-lang" href={hrefFor('privacy', lang)}>{t.legalPrivacy}</a>
      <a className="logbook-lang" href={hrefFor('terms', lang)}>{t.legalTerms}</a>
      <a className="logbook-lang" href={STATUS_PAGE_URL}>{t.statusLink}</a>
      <a className="logbook-lang" href={SOURCE_URL}>{t.sourceLink}</a>
      <span className="logbook-spacer" />
      <span className="logbook-lang">{t.footer}</span>
    </footer>
  )
}
