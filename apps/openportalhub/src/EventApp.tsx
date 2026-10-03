import TopBar from './components/TopBar'
import EventTimelineUI from '@openportalhub/event-timeline-ui/react'
import LogbookStrip from './components/LogbookStrip'
import WaitlistForm from './components/WaitlistForm'
import { LangProvider, useLang, type Dict } from './lib/i18n'
import { useSectionReveal } from './lib/reveal'
import type { Lang } from './lib/pages'

type Key = keyof Dict

/* Copy lives in the dictionary (src/lib/i18n.tsx); this page stores key names,
   the same way Catalog.tsx does. Nothing here is user-visible text. */

const JOBS: Array<{ n: string; title: Key; body: Key }> = [
  { n: '01', title: 'etJob1Title', body: 'etJob1Body' },
  { n: '02', title: 'etJob2Title', body: 'etJob2Body' },
  { n: '03', title: 'etJob3Title', body: 'etJob3Body' },
  { n: '04', title: 'etJob4Title', body: 'etJob4Body' },
  { n: '05', title: 'etJob5Title', body: 'etJob5Body' },
  { n: '06', title: 'etJob6Title', body: 'etJob6Body' },
]

const FACTS: Array<[Key, Key]> = [
  ['etFactPlatform', 'etFactPlatformValue'],
  ['etFactAvailability', 'etFactAvailabilityValue'],
  ['etFactStatus', 'etFactStatusValue'],
  ['etFactLicense', 'etFactLicenseValue'],
]

const REQUIREMENTS: Array<[Key, Key]> = [
  ['etReqOs', 'etReqOsValue'],
  ['etReqArch', 'etReqArchValue'],
  ['etReqMemory', 'etReqMemoryValue'],
  ['etReqDisk', 'etReqDiskValue'],
  ['etReqRuntime', 'etReqRuntimeValue'],
]

function ProductPage() {
  const { t, lang } = useLang()

  useSectionReveal()
  return (
    <div className="page">
      <TopBar />
      <main>
        <section className="section" style={{ paddingTop: 56 }}>
          <nav className="crumbs" aria-label={t.crumbsAria}>
            <a href="/">OpenPortalHub</a> / {t.etCrumbProjects} / 001 · Event Timeline
          </nav>
          <div className="prod-head">
            <div>
              <h1 className="section-title" style={{ marginTop: 0 }}>{t.etTitle}</h1>
              <p className="lic-line">{t.etIntro}</p>
              <p className="ft-actions">
                <a className="waitlist-button ft-btn" href="#beta">{t.etJoin}</a>
              </p>
            </div>
            <ul className="fact-list">
              {FACTS.map(([k, v]) => (
                <li key={k}><span className="k">{t[k]}</span><span className="v">{t[v]}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="r-appmock ft-mock">
            <EventTimelineUI lang={lang} preset="reference-session" className="et-mount" />
            <p className="window-caption">{t.etCaption}</p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">{t.etJobsTitle}</h2>
          <p className="section-sub">{t.etJobsSub}</p>
          <ol className="mech-steps ft-steps">
            {JOBS.map((j) => (
              <li key={j.n}>
                <span className="mech-time">{j.n}</span>
                <h3>{t[j.title]}</h3>
                <p>{t[j.body]}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="beta" className="section">
          <h2 className="section-title">{t.etBetaTitle}</h2>
          <p className="section-sub">{t.etBetaSub}</p>
          <div className="dl-grid">
            <div>
              <p className="lic-line">{t.etBetaBody}</p>
              <WaitlistForm source="beta" inputId="beta-email" formClass="close-form beta-form" />
            </div>
            <div>
              <ul className="fact-list">
                {REQUIREMENTS.map(([k, v]) => (
                  <li key={k}><span className="k">{t[k]}</span><span className="v">{t[v]}</span></li>
                ))}
              </ul>
              <p className="lic-note">{t.etBetaNote}</p>
            </div>
          </div>
        </section>

      </main>
      <LogbookStrip />
    </div>
  )
}

export default function EventApp({ lang }: { lang: Lang }) {
  return (
    <LangProvider lang={lang} page="product">
      <ProductPage />
    </LangProvider>
  )
}
