/* Static prerender and per-language <head> generation.
 *
 * Runs after `vite build`. It reads the built `dist/index.html` as the template and
 * rewrites it into one document per language: the prose rendered inside `#root` (so
 * the text is in the file instead of only in JS) and the head of that language
 * (title, description, canonical, hreflang alternates, Open Graph). The English
 * file stays at `dist/index.html`; the Spanish one is written to `dist/es/index.html`.
 *
 * Everything fails loudly: a template that stops matching aborts the build instead
 * of shipping a page without a head.
 */

import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import App from '../src/App'
import { HOME, defaultLang, langs, pages, SITE_ORIGIN, absoluteUrl, type Lang } from '../src/lib/pages'

const DIST = join(import.meta.dir, '..', 'dist')

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const esc = (value: string) => value.replace(/[&<>"]/g, (char) => ESCAPES[char])

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

/** The discovery head for one language: canonical, hreflang alternates and Open
 *  Graph, all derived from the page map. `x-default` points at `defaultLang`. */
function headFor(lang: Lang): string {
  const other: Lang = lang === 'es' ? 'en' : 'es'
  const locale = lang === 'es' ? 'es_ES' : 'en_US'
  const otherLocale = other === 'es' ? 'es_ES' : 'en_US'
  return [
    `    <link rel="canonical" href="${absoluteUrl(HOME, lang)}">`,
    ...langs.map((l) => `    <link rel="alternate" hreflang="${l}" href="${absoluteUrl(HOME, l)}">`),
    `    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(HOME, defaultLang)}">`,
    `    <meta property="og:type" content="website">`,
    `    <meta property="og:site_name" content="EventTimeline">`,
    `    <meta property="og:url" content="${absoluteUrl(HOME, lang)}">`,
    `    <meta property="og:title" content="${esc(HOME.title[lang])}">`,
    `    <meta property="og:description" content="${esc(HOME.description[lang])}">`,
    `    <meta property="og:locale" content="${locale}">`,
    `    <meta property="og:locale:alternate" content="${otherLocale}">`,
  ].join('\n')
}

function build(lang: Lang, template: string): string {
  const markup = renderToString(createElement(App, { lang }))
  let html = template
  html = replaceOnce(html, /<html lang="[^"]*"/, `<html lang="${lang}"`, 'the html lang attribute')
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(HOME.title[lang])}</title>`, 'the title')
  html = replaceOnce(
    html,
    /<meta name="viewport"[^>]*>/,
    // $& is the matched viewport tag: the description and the discovery head
    // (canonical, hreflang, Open Graph) are inserted right after it, as one block,
    // so a template that stops matching still aborts the build.
    `$&\n    <meta name="description" content="${esc(HOME.description[lang])}">\n${headFor(lang)}`,
    'the viewport meta tag',
  )
  html = replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root" data-page="home" data-lang="${lang}">${markup}</div>`,
    'the empty root div',
  )
  return html
}

/** The sitemap, from the same page map: one <url> per page and language, with the
 *  hreflang alternates so crawlers see the same pairing the head declares. */
function sitemap(): string {
  // The build date, not a content edit date: the prerender regenerates every page,
  // so this is the moment the file behind each URL was last written.
  const lastmod = new Date().toISOString().slice(0, 10)
  const entries = pages.flatMap((page) =>
    langs.map((lang) =>
      [
        '  <url>',
        `    <loc>${esc(absoluteUrl(page, lang))}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(absoluteUrl(page, l))}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(page, defaultLang))}"/>`,
        '  </url>',
      ].join('\n'),
    ),
  )
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // Browsers apply this and render the table in sitemap.xsl; crawlers ignore it.
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

const ROBOTS = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ''].join('\n')

const template = await readFile(join(DIST, HOME.file.en), 'utf8')

for (const lang of langs) {
  const html = build(lang, template)
  const target = join(DIST, HOME.file[lang])
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html, 'utf8')
  console.log(`prerender: dist/${HOME.file[lang]} (${Buffer.byteLength(html, 'utf8')} bytes)`)
}

const sitemapXml = sitemap()
await writeFile(join(DIST, 'sitemap.xml'), sitemapXml, 'utf8')
console.log(`prerender: dist/sitemap.xml (${Buffer.byteLength(sitemapXml, 'utf8')} bytes)`)

await writeFile(join(DIST, 'robots.txt'), ROBOTS, 'utf8')
console.log(`prerender: dist/robots.txt (${Buffer.byteLength(ROBOTS, 'utf8')} bytes)`)
