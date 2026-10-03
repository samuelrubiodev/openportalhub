import type { MouseEvent } from 'react'
import { useLang, rememberLang } from '../lib/i18n'
import { HOME, pagePath } from '../lib/pages'
import { scrollToSection } from '../lib/anchorScroll'
import LangNotice from './LangNotice'

export default function TopBar() {
  const { lang, t } = useLang()
  const homePath = pagePath(HOME, lang)

  const handleNav = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    // Look the target up first: when it is missing, let the browser follow the
    // href instead of swallowing the click with an early preventDefault().
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    scrollToSection(target, 'smooth')
    window.history.pushState(null, '', `#${id}`)
    target.classList.remove('section-targeted')
    void target.offsetWidth
    target.classList.add('section-targeted')
  }

  const handleHome = (e: MouseEvent<HTMLAnchorElement>) => {
    // Keep modified clicks (new tab / window / download) as plain navigation.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    // On any other path the link behaves normally; on the home path itself a
    // click must not reload the page: scroll to the top and drop the fragment.
    if (window.location.pathname !== homePath) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.history.replaceState(null, '', homePath)
  }

  return (
    <>
      <LangNotice />
      <header className="topbar" data-region="topbar">
        <div className="topbar-left">
          <a className="wordmark" href={homePath} onClick={handleHome}>EVENT&nbsp;TIMELINE</a>
          <span className="topbar-badge">{t.topbarBadge}</span>
        </div>
        <nav className="topbar-nav" aria-label={t.navMainAria}>
          <a href="#how-it-works" onClick={(e) => handleNav(e, 'how-it-works')}>{t.navHow}</a>
          <a href="#pricing" onClick={(e) => handleNav(e, 'pricing')}>{t.navPricing}</a>
          <a href="#faq" onClick={(e) => handleNav(e, 'faq')}>{t.navFaq}</a>
        </nav>
        <div className="lang-switch" role="group" aria-label={t.langSwitchAria}>
          {/* Real links to the same page in the other language: the URL owns the
              language, so opening one in a new tab or sharing it keeps the copy. */}
          <a href={pagePath(HOME, 'en')} className={`lang ${lang === 'en' ? 'active' : ''}`} aria-current={lang === 'en' ? 'true' : undefined} onClick={() => rememberLang('en')}>EN</a>
          <span className="lang-sep">|</span>
          <a href={pagePath(HOME, 'es')} className={`lang ${lang === 'es' ? 'active' : ''}`} aria-current={lang === 'es' ? 'true' : undefined} onClick={() => rememberLang('es')}>ES</a>
        </div>
      </header>
    </>
  )
}
