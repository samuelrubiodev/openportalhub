import type { MouseEvent } from 'react'
import { useLang } from '../lib/i18n'
import { hrefFor } from '../lib/pages'
import LangNotice from './LangNotice'

export default function TopBar() {
  const { lang, page, set, t } = useLang()
  const home = hrefFor('home', lang)

  const handleNav = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    // These links point at sections of the home page. On any other page there is
    // nothing to scroll to, so leave the event alone and let the browser follow
    // href="#id" home.
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(null, '', `#${id}`)
    target.classList.remove('section-targeted')
    void target.offsetWidth
    target.classList.add('section-targeted')
  }

  // The wordmark is the way home from every page. On the home page itself a
  // plain click would reload the SPA, so there it scrolls to the top instead.
  const handleHome = (e: MouseEvent<HTMLAnchorElement>) => {
    if (document.location.pathname !== home) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.history.pushState(null, '', home)
  }

  // Switching language is a navigation to the other URL: one page per language is
  // what makes both indexable. `set` only remembers the choice in this tab, which
  // the notice on the English pages reads back.
  const switchLang = (to: 'en' | 'es') => {
    if (to === lang) return
    set(to)
  }

  return (
    <>
      <LangNotice />
      <header className="topbar" data-region="topbar">
        <div className="topbar-left">
          <a className="wordmark" href={home} onClick={handleHome}>OPENPORTALHUB</a>
          <span className="topbar-badge">{t.badge}</span>
        </div>
        <nav className="topbar-nav" aria-label={t.navMainAria}>
          <a href={`${home}#catalog`} onClick={(e) => handleNav(e, 'catalog')}>{t.navCatalog}</a>
          <a href={`${home}#notes`} onClick={(e) => handleNav(e, 'notes')}>{t.navNotes}</a>
          <a href={`${home}#studio`} onClick={(e) => handleNav(e, 'studio')}>{t.navStudio}</a>
        </nav>
        <nav className="lang-switch" aria-label={t.langSwitchAria}>
          <a
            className={`lang ${lang === 'en' ? 'active' : ''}`}
            href={hrefFor(page, 'en')}
            aria-current={lang === 'en' ? 'page' : undefined}
            onClick={() => switchLang('en')}
          >EN</a>
          <span className="lang-sep">|</span>
          <a
            className={`lang ${lang === 'es' ? 'active' : ''}`}
            href={hrefFor(page, 'es')}
            aria-current={lang === 'es' ? 'page' : undefined}
            onClick={() => switchLang('es')}
          >ES</a>
        </nav>
      </header>
    </>
  )
}
