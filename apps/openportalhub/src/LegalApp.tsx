import TopBar from './components/TopBar'
import LogbookStrip from './components/LogbookStrip'
import LegalDoc from './components/LegalDoc'
import { LangProvider } from './lib/i18n'
import { useSectionReveal } from './lib/reveal'
import type { Lang } from './lib/pages'

/** The document is a prop, not a read of document.location: the prerender script
 *  has no location, and the URL already declares the page. */
export default function LegalApp({ lang, page }: { lang: Lang; page: 'privacy' | 'terms' }) {
  useSectionReveal()
  return (
    <LangProvider lang={lang} page={page}>
      <div className="page">
        <TopBar />
        <main>
          <LegalDoc doc={page} />
        </main>
        <LogbookStrip />
      </div>
    </LangProvider>
  )
}
