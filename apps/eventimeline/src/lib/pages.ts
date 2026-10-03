/**
 * Page and language map. The language of a page comes from its URL and never from
 * visitor state, so each language is a document of its own: one `<title>`, one
 * description, one indexable URL. Derived copy comes from the approved dictionary
 * (`src/lib/i18n.tsx`): the titles restate the headline and the descriptions are
 * the subline, verbatim.
 */

export type Lang = 'en' | 'es'

export const langs: Lang[] = ['en', 'es']
export const defaultLang: Lang = 'en'

export interface SitePage {
  id: 'home'
  /** Output file inside dist/, per language. */
  file: Record<Lang, string>
  /** Public URL, per language; always ends in "/". */
  path: Record<Lang, string>
  title: Record<Lang, string>
  description: Record<Lang, string>
}

export const HOME: SitePage = {
  id: 'home',
  file: { en: 'index.html', es: 'es/index.html' },
  path: { en: '/', es: '/es/' },
  title: {
    en: 'EventTimeline — Bracket the moment. The logs fall into order.',
    es: 'EventTimeline — Acota el momento. Los registros se ordenan solos.',
  },
  description: {
    en: 'A Windows desktop app that turns Event Logs into one chronological Time Corridor around the hour you remember.',
    es: 'Una aplicación de escritorio para Windows que convierte los registros de eventos en un único corredor temporal cronológico en torno a la hora que recuerdas.',
  },
}

export const pages: SitePage[] = [HOME]

/** The one place the public origin is declared: the canonical tags in each
 *  document's head and the sitemap both derive their absolute URLs from it. */
export const SITE_ORIGIN = 'https://eventimeline.openportalhub.org'

/** Absolute public URL of a page in a language. */
export function absoluteUrl(page: SitePage, lang: Lang): string {
  return SITE_ORIGIN + page.path[lang]
}

/** Language of a pathname: `/es` and everything under `/es/` is Spanish. */
export function langFromPath(pathname: string): Lang {
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en'
}

/** URL of a page in a language. */
export function pagePath(page: SitePage, lang: Lang): string {
  return page.path[lang]
}
