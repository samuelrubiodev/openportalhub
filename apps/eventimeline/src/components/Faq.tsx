import { useState } from 'react'
import { useLang } from '../lib/i18n'

export default function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState<number | null>(0)
  const items: Array<{ q: string; a: string }> = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
  ]
  return (
    <section id="faq" className="section faq">
      <h2 className="section-title">{t.faqTitle}</h2>
      <div className="faq-list">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div className={`faq-item${isOpen ? ' open' : ''}`} key={i}>
              <button
                id={`faq-btn-${i}`}
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-ans-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="faq-marker" aria-hidden="true" />
                <span className="faq-question-text">{item.q}</span>
              </button>
              <div
                id={`faq-ans-${i}`}
                className="faq-answer-wrapper"
                role="region"
                aria-labelledby={`faq-btn-${i}`}
              >
                <div className="faq-answer-inner">
                  <p className="faq-a">{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
