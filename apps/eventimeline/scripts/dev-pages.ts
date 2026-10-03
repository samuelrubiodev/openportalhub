/* Dev-only routing for the page that only exists as a prerendered file.
 *
 * `scripts/prerender.ts` writes `dist/es/index.html` and the `data-page` /
 * `data-lang` context after `vite build`, so the Vite dev server has no route for
 * it: `/es/` falls back to `/index.html`, `src/main.tsx` finds no `data-lang` and
 * falls back to `defaultLang`, and the English page is rendered. Production is
 * unaffected: nginx serves the prerendered file and its HTML already carries the
 * context.
 *
 * Dev only (`apply: 'serve'`): the build never loads this middleware. */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'
import { HOME } from '../src/lib/pages'

/** The prerender escapes the head it writes; dev rewrites the same two tags from
 *  the same page map, so it has to escape them the same way. */
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const esc = (value: string) => value.replace(/[&<>"]/g, (char) => ESCAPES[char]!)

/** Serve `index.html` as the Spanish page, through Vite's own pipeline so the
 *  client, the module graph and HMR still load. */
async function serveSpanish(server: ViteDevServer, url: string, res: ServerResponse) {
  const html = await readFile(resolve(server.config.root, 'index.html'), 'utf8')
  const localized = html
    .replace(/<html lang="[^"]*"/, '<html lang="es"')
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(HOME.title.es)}</title>`)
    // The source has no description meta; the prerender inserts it after the
    // viewport tag, and dev writes the same block for the same language.
    .replace(
      /<meta name="viewport"[^>]*>/,
      (tag) => `${tag}\n    <meta name="description" content="${esc(HOME.description.es)}">`,
    )
    .replace('<div id="root"></div>', '<div id="root" data-page="home" data-lang="es"></div>')
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(await server.transformIndexHtml(url, localized))
}

export function devPages(): Plugin {
  return {
    name: 'et-dev-pages',
    apply: 'serve',

    // The English page is a real file, so Vite serves it; it only lacks the
    // context the prerender writes into the root div.
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // Vite normalises the root request to `/index.html` before this hook.
        return ctx.path === '/' || ctx.path === '/index.html'
          ? html.replace('<div id="root"></div>', '<div id="root" data-page="home" data-lang="en"></div>')
          : html
      },
    },

    configureServer(server) {
      // Registered here, before Vite installs its own middlewares, so the SPA
      // fallback never sees these paths.
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]

        // One page, one URL: the redirects nginx performs in production.
        if (path === '/es' || path === '/es/index.html') {
          res.statusCode = 301
          res.setHeader('Location', '/es/')
          res.end()
          return
        }
        if (path === '/index.html') {
          res.statusCode = 301
          res.setHeader('Location', '/')
          res.end()
          return
        }
        if (path !== '/es/') return next()

        if (!existsSync(resolve(server.config.root, 'index.html'))) return next()
        void serveSpanish(server, path, res).catch(next)
      })
    },
  }
}
