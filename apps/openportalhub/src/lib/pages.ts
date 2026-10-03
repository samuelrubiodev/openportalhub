/* Page and language map: one source of truth for the URLs, the <head> metadata,
   the language switch, the generated sitemap and the prerender script.

   Nothing here touches the DOM or React, so `scripts/prerender.ts` can import it
   outside a browser. The language of a page is decided by its URL, never by the
   visitor's state: one URL per language is what makes both markets indexable. */

export type Lang = 'en' | 'es'
export type PageId = 'home' | 'product' | 'privacy' | 'terms'

export const SITE_ORIGIN = 'https://openportalhub.org'

export type Page = {
  /** Built HTML file, relative to the site root. */
  file: string
  /** Canonical path per language. */
  path: Record<Lang, string>
  title: Record<Lang, string>
  description: Record<Lang, string>
}

export const PAGES: Record<PageId, Page> = {
  home: {
    file: 'index.html',
    path: { en: '/', es: '/es/' },
    title: {
      en: 'OpenPortalHub — Desktop software, built one tool at a time.',
      es: 'OpenPortalHub — Software de escritorio, hecho una herramienta cada vez.',
    },
    description: {
      en: 'OpenPortalHub is an independent software studio. Small desktop tools for Windows, numbered, documented, and maintained in public. Home of Event Timeline.',
      es: 'OpenPortalHub es un estudio de software independiente. Pequeñas herramientas de escritorio para Windows, numeradas, documentadas y mantenidas en público. La casa de Event Timeline.',
    },
  },
  product: {
    file: 'event-timeline.html',
    path: { en: '/event-timeline.html', es: '/es/event-timeline.html' },
    title: {
      en: 'Event Timeline · Closed Beta · OpenPortalHub',
      es: 'Event Timeline · Beta cerrada · OpenPortalHub',
    },
    description: {
      en: 'Event Timeline is a Windows desktop application for reading activity over time: event logs, process starts, file changes, network activity on one clock. Not yet released — free closed beta.',
      es: 'Event Timeline es una aplicación de escritorio para Windows que lee la actividad a lo largo del tiempo: eventos, arranques de procesos, cambios en archivos y actividad de red en un solo reloj. Aún sin publicar: beta cerrada gratuita.',
    },
  },
  privacy: {
    file: 'privacy.html',
    path: { en: '/privacy.html', es: '/es/privacy.html' },
    title: {
      en: 'Privacy Policy · OpenPortalHub',
      es: 'Política de privacidad · OpenPortalHub',
    },
    description: {
      en: 'OpenPortalHub privacy policy: this website collects nothing. No cookies, no analytics, no trackers. Only standard Cloudflare network logging.',
      es: 'Política de privacidad de OpenPortalHub: esta web no recopila nada. Sin cookies, sin analítica y sin rastreadores. Solo el registro técnico estándar de Cloudflare.',
    },
  },
  terms: {
    file: 'terms.html',
    path: { en: '/terms.html', es: '/es/terms.html' },
    title: {
      en: 'Terms of Service · OpenPortalHub',
      es: 'Términos y condiciones · OpenPortalHub',
    },
    description: {
      en: 'OpenPortalHub terms of service: website use, Event Timeline closed beta status, beta software disclaimer and liability.',
      es: 'Términos y condiciones de OpenPortalHub: uso de la web, estado de beta cerrada de Event Timeline, aviso sobre software beta y responsabilidad.',
    },
  },
}

export const PAGE_IDS = Object.keys(PAGES) as PageId[]

export const LANGS: Lang[] = ['en', 'es']

/** Site-root-relative URL of a page in one language. */
export function hrefFor(page: PageId, lang: Lang): string {
  return PAGES[page].path[lang]
}

/** Absolute URL, for canonical links, hreflang and the sitemap. */
export function absoluteUrl(page: PageId, lang: Lang): string {
  return SITE_ORIGIN + PAGES[page].path[lang]
}

/** Page context written into the built HTML as data attributes on #root. */
export function readPageContext(root: HTMLElement | null): { page: PageId; lang: Lang } {
  const page = root?.dataset.page
  const lang = root?.dataset.lang
  return {
    page: page !== undefined && page in PAGES ? (page as PageId) : 'home',
    lang: lang === 'es' ? 'es' : 'en',
  }
}
