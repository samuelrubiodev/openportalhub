/* Dev-only routing for the pages that only exist as prerendered files.
 *
 * `scripts/prerender.ts` writes the Spanish pages (`dist/es/*.html`) and the
 * `data-page` / `data-lang` context after `vite build`, so the Vite dev server
 * has no route for them: `/es/anything` falls back to `/index.html` and the app
 * renders the English home. The dev server also never tells the app which page a
 * URL means, so `/terms.html` renders the privacy document.
 *
 * Production is unaffected: nginx serves the prerendered files, and the context
 * is already in their HTML. This plugin gives dev the same mapping the prerender
 * writes — the file decides the page, the `/es/` prefix decides the language —
 * so a URL behaves the same before and after the build.
 *
 * Dev only (`apply: 'serve'`): the build never loads this middleware. */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'
import { PAGES } from '../src/lib/pages'

/** Source file -> page id, the same pairs `src/lib/pages.ts` declares. */
const PAGE_BY_FILE = {
  'index.html': 'home',
  'event-timeline.html': 'product',
  'privacy.html': 'privacy',
  'terms.html': 'terms',
} as const

type PageId = (typeof PAGE_BY_FILE)[keyof typeof PAGE_BY_FILE]

/** The empty root the app hydrates, carrying the context the prerender writes. */
const rootDiv = (page: PageId, lang: 'en' | 'es') =>
  `<div id="root" data-page="${page}" data-lang="${lang}"></div>`

/** The prerender escapes these when it writes a head; dev rewrites the same two
 *  tags from the same page map, so it has to escape them the same way. */
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const esc = (value: string) => value.replace(/[&<>"]/g, (char) => ESCAPES[char]!)

/** Serve a source HTML file as its Spanish page, through Vite's own pipeline so
 *  the client, the module graph and HMR still load. */
async function serveSpanish(
  server: ViteDevServer,
  file: string,
  page: PageId,
  url: string,
  res: ServerResponse,
) {
  const html = await readFile(resolve(server.config.root, file), 'utf8')
  const localized = html
    .replace(/<html lang="[^"]*"/, '<html lang="es"')
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(PAGES[page].title.es)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${esc(PAGES[page].description.es)}">`,
    )
    .replace('<div id="root"></div>', rootDiv(page, 'es'))
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(await server.transformIndexHtml(url, localized))
}

export function devPages(): Plugin {
  return {
    name: 'oph-dev-pages',
    apply: 'serve',

    // The English pages are real files, so Vite serves them; they only lack the
    // page id the prerender would have written into the root div.
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = PAGE_BY_FILE[ctx.path.replace(/^\//, '') as keyof typeof PAGE_BY_FILE]
        return page ? html.replace('<div id="root"></div>', rootDiv(page, 'en')) : html
      },
    },

    configureServer(server) {
      // Registered here, before Vite installs its own middlewares, so the SPA
      // fallback never sees an `/es/` path.
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]

        // One page, one URL: the same redirect nginx performs in production.
        if (path === '/es') {
          res.statusCode = 301
          res.setHeader('Location', '/es/')
          res.end()
          return
        }
        if (!path.startsWith('/es/')) return next()

        const file = path === '/es/' ? 'index.html' : path.slice('/es/'.length)
        const page = PAGE_BY_FILE[file as keyof typeof PAGE_BY_FILE]
        if (!page || !existsSync(resolve(server.config.root, file))) return next()
        void serveSpanish(server, file, page, path, res).catch(next)
      })
    },
  }
}
