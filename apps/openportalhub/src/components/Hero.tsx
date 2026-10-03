import { useRef, type CSSProperties } from 'react'
import { useLang } from '../lib/i18n'
import WaitlistForm from './WaitlistForm'
import EventTimelineUI, { useTimelineFit } from '@openportalhub/event-timeline-ui/react'

export default function Hero() {
  const { t, lang } = useLang()
  const holderRef = useRef<HTMLDivElement | null>(null)
  const columnRef = useRef<HTMLDivElement | null>(null)
  const shotRef = useRef<HTMLDivElement | null>(null)
  const fit = useTimelineFit(holderRef, columnRef, shotRef)

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

            <WaitlistForm source="list" inputId="waitlist-email" formClass="waitlist-form" hero emailWrapDataRegion="email-input" />

            <p className="license-note" data-region="license-note">
              {t.license}
            </p>
          </div>
          {/* featured project card (static preview, real tool lives on its own site/page) */}
          {/* --et-fit-scale is published on the column so the poster and the card
              (whose width derives from it in oph.css) inherit the same measured
              value; nothing is published before the first measurement. */}
          <div
            className="r-appmock"
            ref={columnRef}
            style={fit !== null ? { '--et-fit-scale': String(fit.scale) } as CSSProperties : undefined}
          >
            <a className="feat-card" href={t.ftCardUrl}>
              <div className="feat-card__shot" ref={shotRef}>
                {/* The card is a link, so its window is always a poster: only the
                    measured scale is published (--et-fit-scale); the phone crop in
                    oph.css clamps the applied scale in CSS, never here. */}
                {fit !== null && (
                  <div className="et-poster">
                    <EventTimelineUI lang={lang} preset="reference-session" interactive={false} className="et-mount" />
                  </div>
                )}
              </div>
              <div className="feat-card__body">
                <p className="eyebrow">
                  <span className="eyebrow-bullet" aria-hidden="true" /> {t.cardEyebrow}
                </p>
                <p className="feat-card__title">EVENT TIMELINE <span className="mono">{t.cardStatus}</span></p>
                <p className="feat-card__desc">{t.cardDesc}</p>
                <p className="feat-card__link">{t.cardLink} <span aria-hidden="true">↗</span></p>
              </div>
            </a>
            <p className="window-caption" data-region="window-caption">
              {t.caption}
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
