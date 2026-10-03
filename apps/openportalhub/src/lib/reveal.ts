import { useEffect } from 'react'

/** Shared scroll-reveal observer: adds .in-view to every .section once visible.
 *  Also marks hash-targeted sections. Content is visible by default when
 *  prefers-reduced-motion is set (CSS handles it). */
export function useSectionReveal() {
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

    const hash = window.location.hash
    if (hash.length > 1) {
      const el = document.querySelector<HTMLElement>(`#${CSS.escape(hash.slice(1))}`)
      if (el) {
        el.classList.add('in-view', 'section-targeted')
        // Section links from another page arrive as /#section. The browser's own
        // anchor jump happens before React renders the sections, so the deep link
        // has to place itself or it lands on the top of the page.
        el.scrollIntoView({ block: 'start' })
      }
    }

    return () => obs.disconnect()
  }, [])
}
