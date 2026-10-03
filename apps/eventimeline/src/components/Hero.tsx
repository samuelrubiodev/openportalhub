import { useRef, type CSSProperties } from 'react'
import { useLang } from '../lib/i18n'
import EventTimelineUI, { useTimelineFit, type TimelineFit } from '@openportalhub/event-timeline-ui/react'
import WaitlistForm from './WaitlistForm'

export default function Hero() {
  const { t, lang } = useLang()
  const holderRef = useRef<HTMLDivElement | null>(null)
  const columnRef = useRef<HTMLDivElement | null>(null)
  // The same ref always points at the widget's laid-out box: the poster
  // wrapper in the poster branch, a plain wrapper around the live mount
  // otherwise.
  const boxRef = useRef<HTMLDivElement | null>(null)
  const fit: TimelineFit | null = useTimelineFit(holderRef, columnRef, boxRef)

  return (
    <div className="hero-holder" ref={holderRef}>
      <section className="hero hero-viewport" data-region="hero" aria-label={t.heroAria}>
        <div className="hero-layout">
          {/* left rail: flow column */}
          <div className="left-rail">
            <p className="eyebrow" data-region="eyebrow">
              <span className="eyebrow-bullet" aria-hidden="true" /> {t.eyebrow}
            </p>

            <h1 className="headline" data-region="headline">
              <span className="hl-white">{t.headlineWhite}</span>{' '}
              <span className="hl-grey">{t.headlineGrey}</span>
            </h1>

            <p className="subline" data-region="subline">
              {t.subline}
            </p>

            <WaitlistForm inputId="waitlist-email" formClass="waitlist-form" hero emailWrapDataRegion="email-input" />

            <p className="license-note" data-region="license-note">
              {t.license}
            </p>
          </div>

          {/* right column: the real application window */}
          {/* --et-fit-scale is published on the column so the poster inherits it;
              the live branch never reads it. Nothing is published before the
              first measurement. */}
          <div
            className="r-appmock"
            ref={columnRef}
            style={fit !== null ? { '--et-fit-scale': String(fit.scale) } as CSSProperties : undefined}
          >
            {fit !== null && (fit.interactive ? (
              <div ref={boxRef}>
                <EventTimelineUI lang={lang} preset="reference-session" className="et-mount" />
              </div>
            ) : (
              <div className="et-poster" ref={boxRef}>
                <EventTimelineUI lang={lang} preset="reference-session" interactive={false} className="et-mount" />
              </div>
            ))}
            <p className="window-caption" data-region="window-caption">
              {t.caption}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
