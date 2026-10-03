import { useEffect } from 'react'
import TopBar from './components/TopBar'
import Hero from './components/Hero'
import Mechanism from './components/Mechanism'
import Sources from './components/Sources'
import Licensing from './components/Licensing'
import Faq from './components/Faq'
import WaitlistClose from './components/WaitlistClose'
import LogbookStrip from './components/LogbookStrip'
import { LangProvider } from './lib/i18n'
import type { Lang } from './lib/pages'
import { resolveFragmentTarget, scrollToSection } from './lib/anchorScroll'

export default function App({ lang }: { lang: Lang }) {
  useEffect(() => {
    const sections = document.querySelectorAll('.section')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    sections.forEach((s) => obs.observe(s))

    // A deep link such as /#how-it-works lands on the hero: the browser performs
    // its anchor jump while parsing, before React has rendered these sections, so
    // there is nothing to jump to yet. Do the jump here instead. See
    // `lib/anchorScroll` for why the position is computed from the layout and not
    // from `scrollIntoView`.
    const target = resolveFragmentTarget(window.location.hash)
    if (target !== null) {
      target.classList.add('in-view', 'section-targeted')
      scrollToSection(target)
    }

    return () => obs.disconnect()
  }, [])

  return (
    <LangProvider lang={lang}>
      <div className="page">
        <TopBar />
        <main>
          <Hero />
          <Mechanism />
          <Sources />
          <Licensing />
          <Faq />
          <WaitlistClose />
        </main>
        <LogbookStrip />
      </div>
    </LangProvider>
  )
}
