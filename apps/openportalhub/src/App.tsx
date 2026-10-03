import { useSectionReveal } from './lib/reveal'
import TopBar from './components/TopBar'
import Hero from './components/Hero'
import Catalog from './components/Catalog'
import Notes from './components/Notes'
import Studio from './components/Studio'
import WaitlistClose from './components/WaitlistClose'
import LogbookStrip from './components/LogbookStrip'
import { LangProvider } from './lib/i18n'
import type { Lang } from './lib/pages'

export default function App({ lang }: { lang: Lang }) {
  useSectionReveal()

  return (
    <LangProvider lang={lang} page="home">
      <div className="page">
        <TopBar />
        <main>
          <Hero />
          <Catalog />
          <Notes />
          <Studio />
          <WaitlistClose />
        </main>
        <LogbookStrip />
      </div>
    </LangProvider>
  )
}
