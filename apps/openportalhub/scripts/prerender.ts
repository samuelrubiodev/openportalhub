/* Static prerender and per-language <head> generation.
 *
 * Runs after `vite build`. For every page and language it renders the app to HTML
 * (so the text is in the file instead of only in JS), rewrites the head for that
 * language (title, description, canonical, hreflang, Open Graph) and writes the
 * file under dist/, with the Spanish pages under dist/es/. The sitemap and
 * robots.txt come from the same page map, so they cannot drift from the pages.
 *
 * Everything fails loudly: a page that does not match the expected shape aborts
 * the build instead of shipping a broken head. */

import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import App from '../src/App'
import EventApp from '../src/EventApp'
import LegalApp from '../src/LegalApp'
import { LANGS, PAGES, PAGE_IDS, SITE_ORIGIN, absoluteUrl, type Lang, type PageId } from '../src/lib/pages'

const DIST = join(import.meta.dir, '..', 'dist')

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ESCAPES[char])

function render(page: PageId, lang: Lang): string {
  if (page === 'home') return renderToString(createElement(App, { lang }))
  if (page === 'product') return renderToString(createElement(EventApp, { lang }))
  return renderToString(createElement(LegalApp, { lang, page }))
}

function headFor(page: PageId, lang: Lang): string {
  const other: Lang = lang === 'es' ? 'en' : 'es'
  const locale = lang === 'es' ? 'es_ES' : 'en_US'
  const otherLocale = other === 'es' ? 'es_ES' : 'en_US'
  return [
    `    <link rel="canonical" href="${absoluteUrl(page, lang)}">`,
    ...LANGS.map((l) => `    <link rel="alternate" hreflang="${l}" href="${absoluteUrl(page, l)}">`),
    `    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(page, 'en')}">`,
    `    <meta property="og:type" content="website">`,
    `    <meta property="og:site_name" content="OpenPortalHub">`,
    `    <meta property="og:url" content="${absoluteUrl(page, lang)}">`,
    `    <meta property="og:title" content="${esc(PAGES[page].title[lang])}">`,
    `    <meta property="og:description" content="${esc(PAGES[page].description[lang])}">`,
    `    <meta property="og:locale" content="${locale}">`,
    `    <meta property="og:locale:alternate" content="${otherLocale}">`,
  ].join('\n')
}

function replaceOnce(html: string, pattern: RegExp, replacement: string, what: string): string {
  if (!pattern.test(html)) {
    const already = what === 'the empty root div' && /<div id="root" data-page=/.test(html)
    throw new Error(
      already
        ? 'prerender: dist/ is already prerendered; run the full build (bun run build) instead of the prerender step alone'
        : `prerender: could not find ${what} in the built HTML`,
    )
  }
  return html.replace(pattern, replacement)
}

function build(page: PageId, lang: Lang, template: string): string {
  const markup = render(page, lang)
  const { title, description } = PAGES[page]
  let html = template
  html = replaceOnce(html, /<html lang="[^"]*"/, `<html lang="${lang}"`, 'the html lang attribute')
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(title[lang])}</title>`, 'the title')
  html = replaceOnce(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(description[lang])}">`,
    'the description meta tag',
  )
  html = replaceOnce(html, /<\/head>/, `${headFor(page, lang)}\n  </head>`, 'the closing head tag')
  html = replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root" data-page="${page}" data-lang="${lang}">${markup}</div>`,
    'the empty root div',
  )
  return html
}

function sitemap(): string {
  // The build date, not a content edit date: the prerender regenerates every page, so
  // this is the moment the file behind each URL was last written.
  const lastmod = new Date().toISOString().slice(0, 10)
  const entries = PAGE_IDS.flatMap((page) =>
    LANGS.map((lang) =>
      [
        '  <url>',
        `    <loc>${absoluteUrl(page, lang)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(page, l)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(page, 'en')}"/>`,
        '  </url>',
      ].join('\n'),
    ),
  )
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // Browsers apply this and show a table; crawlers ignore it and read the XML.
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

const ROBOTS = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ''].join('\n')

const templates = new Map<PageId, string>()
for (const page of PAGE_IDS) {
  templates.set(page, await readFile(join(DIST, PAGES[page].file), 'utf8'))
}

for (const page of PAGE_IDS) {
  for (const lang of LANGS) {
    const html = build(page, lang, templates.get(page)!)
    const target = lang === 'es' ? join(DIST, 'es', PAGES[page].file) : join(DIST, PAGES[page].file)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, html, 'utf8')
  }
}

await writeFile(join(DIST, 'sitemap.xml'), sitemap(), 'utf8')
await writeFile(join(DIST, 'robots.txt'), ROBOTS, 'utf8')

console.log(
  `prerender: ${PAGE_IDS.length} pages × ${LANGS.length} languages + sitemap.xml + robots.txt written to dist/`,
)
