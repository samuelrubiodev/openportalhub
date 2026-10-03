# Self-hosted webfonts

These are the font files this site serves. They come from Google Fonts' own CDN and are
served from this origin, so loading a page opens no connection to a third party and no
visitor IP reaches Google.

## Why these files sit in `src/assets/` and not in `public/`

They are referenced from `src/styles/fonts.css`, so Vite emits them content-hashed into
`dist/assets/`, which `nginx.conf` already serves with
`Cache-Control: public, max-age=31536000, immutable`. A font swap invalidates itself
and no server rule is needed for a path that would otherwise be cached forever under a
stable name.

The OFL notices are in `public/fonts/licenses/`, so they are also served from the
deployed site and not only present in the repository.

## What is here

Six files, 132 KB, covering the eight `@font-face` declarations in
`src/styles/fonts.css`.

| Family | Weight | Subset | Bytes | Served as | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| Caveat | 600 | latin | 51,220 | `caveat-600-latin.woff2` | `d51e2283010e661d9f3dafdc9ff4b82b2ebcb2f7aa43ca48a105f5f68d46cc32` |
| Imprima | 400 | latin | 15,864 | `imprima-400-latin.woff2` | `ad0dec137c0debe49037364ffd0c63545b8cf5ace1f0808c5f7984bfe87ea36e` |
| JetBrains Mono | 300 | cyrillic | 8,856 | `jetbrains-mono-300-400-cyrillic.woff2` | `d335dbd3e9042314b04a09106485ffc59def38dbb8e0d9135dbb86d438617aae` |
| JetBrains Mono | 300 | latin | 30,924 | `jetbrains-mono-300-400-latin.woff2` | `58b4565492f06f6c429d565bd331f839d1fc8f3bc18ace8dd47017287481290d` |
| JetBrains Mono | 400 | cyrillic | 8,856 | `jetbrains-mono-300-400-cyrillic.woff2` | `d335dbd3e9042314b04a09106485ffc59def38dbb8e0d9135dbb86d438617aae` |
| JetBrains Mono | 400 | latin | 30,924 | `jetbrains-mono-300-400-latin.woff2` | `58b4565492f06f6c429d565bd331f839d1fc8f3bc18ace8dd47017287481290d` |
| Oswald | 700 | latin | 12,672 | `oswald-700-latin.woff2` | `aae665c75af89ea7cb7d8ccc8b0911ea72267442ebcd84f6e3efa041ad3b3c16` |
| Sofia Sans Extra Condensed | 700 | latin | 15,836 | `sofia-sans-extra-condensed-700-latin.woff2` | `e38feee1f469cfd4b964de4319044b21eb68fb5f307f7bd2e32b0b0b26121f0a` |

Google serves one file per subset for JetBrains Mono 300 **and** 400, so the two weights
share both files and the declarations carry the same two `src` URLs. Nothing about the
outcome changes: with the file being the only one Google offers for either weight, the
pair of declarations reproduces today's behaviour exactly, including synthetic bold for
any other requested weight.

## Where they came from

Fetched 2026-09-26 14:36 UTC, with a Chrome user agent, from the CSS Google serves for
the query the site links:

```
https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@700&family=Imprima&family=JetBrains+Mono:wght@300;400&family=Oswald:wght@700&family=Caveat:wght@600&display=swap
```

That response carries 28 `@font-face` blocks over six subsets (cyrillic-ext, cyrillic,
greek, vietnamese, latin-ext, latin). Eight of them are kept here. The declarations in
`src/styles/fonts.css` are copies of Google's own blocks, not retyped, so a future
refresh can be diffed block by block against upstream.

## The subset scope is measured, not guessed

The rule for this directory is: **keep the subsets the pages actually request**, no more
and no fewer. `/index.html` and `/es/index.html` request JetBrains Mono's **cyrillic**
file as well as `latin`.

The reason is one character. `U+2116` (№), used by the catalog table in
`src/components/Catalog.tsx`, falls inside that subset's `unicode-range`
(`U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116`) and inside no other. Shipping
`latin` alone would move the numero sign from JetBrains Mono to a system fallback on both
home pages: a small, silent visual change.

Everything else Google offers (`cyrillic-ext`, `greek`, `vietnamese`, `latin-ext`) is
unused by EN and ES content.

To re-derive the list after a copy or layout change: load every built page with the
network log open, and keep the subset file behind each `fonts.gstatic.com` request that
appears.

## Refreshing

1. Fetch the CSS above with a Chrome user agent.
2. Keep the blocks for the subsets that step 3 of "The subset scope" reports, mapping each
   to a local filename named `<family>-<weights>-<subset>.woff2`.
3. Download the `src` URL of each kept block and record its SHA-256 here.
4. Regenerate `src/styles/fonts.css` from the kept blocks instead of editing it by hand.
5. Re-run the browser check and confirm the advance widths and the page geometry are
   unchanged.

## Licensing

All five families are SIL Open Font License 1.1, each with its own copyright holder. The
licence texts are in `public/fonts/licenses/` and are served at `/fonts/licenses/`.
Redistribution inside this site is what the licence permits; the files must not be sold
on their own.
