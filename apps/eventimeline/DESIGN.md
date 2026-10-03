# DESIGN.md — EventTimeline presentation site

## World

**Seismograph station.** A dark drum-paper instrument ground with faint printed
rules, hairline lines, sharp 2px corners, and one human ink: red pencil. The
product window itself is the hero, annotated like an investigator's paper. No
gradients, no glow, no rounded cards, no glass.

## Color tokens

| Token | Value | Role |
|---|---|---|
| `--ground` | `#131313` | page ground |
| `--ground-raised` | `#1a1a1a` | raised panel ground |
| `--ink-hairline` | `#2c2c2c` | hairline rules, borders |
| `--ink-grey` | `#8a8a8a` | secondary text (≈5.2:1) |
| `--ink-grey-dim` | `#8d8d8d` | tertiary text, placeholders (≈5.4:1) |
| `--ink-faint` | `#9c9c9c` | smallest captions (≈4.9:1) |
| `--ink-white` | `#f5f5f3` | primary text |
| `--pencil-red` | `#d23b2e` | human marks only: annotations, CTA, eyebrows |
| `--error-red` | `#e2462f` | error text (≈4.6:1, recovery path) |
| `--amber` | `#c89b3c` | reserved for severity accents |

Red is reserved: eyebrow bullet, step annotations, primary button, error text.
Severity dots inside product mockups also use amber, never page chrome.

## Typography

The faces the site ships:

| Face | Use | Notes |
|---|---|---|
| Sofia Sans Extra Condensed 700 | display, wordmark, section titles | condensed uppercase; 4.6cqw in `:lang(es)` (longer copy) |
| Imprima 400 | body copy | |
| JetBrains Mono 300/400 | data, eyebrows, labels, captions, logbook | data/measurement voice |
| Oswald 700 | button labels | |
| Caveat 600 | handwritten step annotations | human pencil marks |

Self-hosted from `public/assets/fonts/`: the same five faces as 12 woff2 files
(latin and latin-ext subsets, per-subset `unicode-range`, `font-display: swap`
in `src/styles/fonts.css`), served from `/assets/fonts/` under nginx's
immutable cache; upstream OFL 1.1 texts in `public/assets/fonts/LICENSES.txt`.
The site makes no request to Google Fonts.

## Layout grammar

- Hero is a responsive, viewport-fit two-column layout (`min-height: calc(100vh - 56px)`, capped to viewport height on desktops >= 600px) so the entire product window is 100% visible on first load without scrolling.
- Left rail (eyebrow, headline, subline, waitlist CTA, license note) sits directly alongside the app mock (`gap: clamp(24px, 3.2vw, 48px)`), eliminating empty void space and creating a tight, cohesive composition.
- The hero shows the real application window (`packages/widget/src/**`), whose height follows its width (`104.3em : 60.3em`; base font `0.9586cqi` clamped to 8.5–15px). How it is drawn is measured from the DOM by `useTimelineFit` (exported by `@openportalhub/event-timeline-ui/react`, `packages/widget/src/react.tsx`): interactive at natural scale when the column clears the 8.5px base floor and the hero has room for the natural height, otherwise a poster — the same window drawn at its 1377x796 reference size and scaled with `transform: scale()` to fit the column exactly. Never clipped, never overflowing the page, never stacked.
- Below the hero: ruled sections (`border-top: 1px solid --ink-hairline`),
  880px measure, generous vertical padding, one reveal animation per section.

## The real product window

The hero's window is the real Event Timeline UI (`packages/widget/src/**`, React
wrapper `EventTimelineUI` with the `reference-session` preset) — the shipped
application itself, not a mock and not a raster, bilingual: the window speaks
the language of the page, which the URL owns (15 events, 9 clusters).

- Geometry: the window is `104.3em : 60.3em` — its height follows its width.
  A 1377px-wide host renders the shipped 13.2px base scale; the base font is
  `0.9586cqi` clamped to 8.5–15px, and the host (`.et-mount`) is the widget's
  own size container, so container queries drive the whole layout.
- Draw policy (`useTimelineFit`, exported by `@openportalhub/event-timeline-ui/react`
  because it encodes the widget's own geometry), measured from the DOM — never
  viewport media queries: when the column is wide enough that the 8.5px base
  floor does not bind and the hero has room for the natural height, the window
  renders interactive at natural scale. Otherwise it renders as a poster
  (`interactive={false}`): the same window drawn at its 1377x796 reference
  size and scaled with `transform: scale(var(--et-scale))` so it fits the
  column and the room left in the hero exactly. Never clipped, never
  overflowing the page horizontally, never stacked.
- Interactive mode: click or drag the playhead (Space starts/pauses it),
  select events to populate the inspector, zoom the time spans, and drive the
  title-bar sources and actions — all real widget behavior.
- Poster mode is inert (no listeners, `inert` root): the same window, drawn
  but not wired. The poster wrapper (`.et-poster`) owns the scaled box and the
  shadow; the interactive window carries its shadow on `.et-mount` directly.

## Interaction states

- Button: hover lift + darken, active settle, focus-visible white ring,
  disabled dimmed; `sending`/`done` label states.
- Email: bottom rule turns pencil-red on focus-within.
- FAQ: accordion buttons with `aria-expanded`, red +/− marker.
- Language switch: EN/ES links to the same page in the other language
  (`aria-current`; one URL per language and the served document already
  carries `lang`); ES headline auto-scales smaller via `:lang(es)`.
- Language notice: fixed strip bottom-left on raised ground with a hairline
  border, mono 11px, dismissible — an offer to read the page in Spanish, never
  an automatic swap.
- `prefers-reduced-motion: reduce` disables all transitions and reveals.

## Motion

One authored moment: sections reveal on scroll with a 480ms
`cubic-bezier(0.16, 1, 0.3, 1)` fade-up, 60ms stagger on alternates. Content
visible by default; nothing hides behind scroll-triggered JS.

## Voice

Professional, Windows-literate, honest: paid product (1 year of updates,
renewal by repurchase — never "free"), waitlist as the only conversion, no
invented claims or social proof. Bilingual EN (default) / ES with full
dictionary parity in `src/lib/i18n.tsx`.
