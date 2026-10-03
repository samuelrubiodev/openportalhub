import { useEffect, useState } from 'react'
import { preferredLang, useLang } from '../lib/i18n'
import { HOME, pagePath } from '../lib/pages'

/** Offered on the English page to a visitor whose browser asks for Spanish.
 *
 *  The URL owns the language, so this never swaps the content: it points at the
 *  Spanish URL and lets the visitor decide, which keeps one page per language and
 *  keeps the crawler's view of `/` stable. It renders nothing until the effect has
 *  run, so the prerendered HTML and the first client render always agree.
 *
 *  The text is Spanish in both packs on purpose (see `langNotice` in i18n). */
export default function LangNotice() {
  const { lang, t } = useLang()
  const [offered, setOffered] = useState(false)

  useEffect(() => {
    if (lang !== 'en') return
    if (preferredLang() === 'es') setOffered(true)
  }, [lang])

  if (!offered || lang !== 'en') return null

  return (
    <div className="lang-notice" data-region="lang-notice" lang="es" role="status">
      <span>{t.langNotice}</span>
      <a href={pagePath(HOME, 'es')}>{t.langNoticeLink}</a>
    </div>
  )
}
