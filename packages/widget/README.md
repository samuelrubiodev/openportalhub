# `@openportalhub/event-timeline-ui`

A faithful, embeddable Event Timeline window widget. Framework-free kernel +
`<event-timeline-ui>` custom element (Shadow DOM, isolated styles) + a thin
React wrapper. No dependencies, no site fonts, dark theme.

The widget ships with a `reference-session` preset that reproduces the shipped
application's demo state (15 events, 9 clusters, Spanish UI).

## Install / copy

Copy the `src/widget/` folder into your project (or build it with your own
bundler). It only needs a DOM; there are no npm dependencies. React is required
only if you use the wrapper.

## Script tag / custom element

```html
<script type="module">
  import { defineEventTimelineUI } from './widget/index.js'
  defineEventTimelineUI() // registers <event-timeline-ui>
</script>

<event-timeline-ui lang="es" preset="reference-session"></event-timeline-ui>

<event-timeline-ui lang="en" interactive="false" density="compact"></event-timeline-ui>
```

### Attributes

| Attribute    | Values                                  | Default             | Notes |
| ------------ | --------------------------------------- | ------------------- | ----- |
| `lang`       | `es` \| `en`                            | `es`                | Label pack language. |
| `preset`     | `reference-session`                     | `reference-session` | Demo session used when no `session` is given. |
| `interactive`| `true` \| `false`                       | `true`              | `false` renders an inert poster (no listeners, `inert` root). |
| `density`    | `comfortable` \| `compact`              | `comfortable`       | Compact reduces the type ceiling and paddings. |
| `theme`      | `dark`                                  | `dark`              | Only dark exists. |
| `session`    | JSON `TimelineSession`                  | —                   | Full session data; wins over `preset`. |

Properties `options` (full `TimelineOptions`) and `session` mirror the
attributes for JS use.

### Events

Composed, bubbling custom events (listen on the element):

- `event-select` — `detail.event`: the selected `TimelineEvent`, or `null`.
- `timeline-action` — `detail.action`: title-bar buttons, `Aplicar`,
  incident pickers, window controls.
- `view-change` — `detail.view`: the current `TimelineView`.

## JS API

```js
import { mountTimeline } from './widget/index.js'

const instance = mountTimeline(hostEl, {
  lang: 'es',
  preset: 'reference-session',
  interactive: true,
  density: 'comfortable',
  theme: 'dark',
  clusterThresholdPx: 24,
  onSelect: (event) => console.log(event),
  onAction: (action) => console.log(action),
  onViewChange: (view) => console.log(view),
})

instance.update(session)              // replace the session
instance.updateOptions({ lang: 'en' })// patch options
instance.getView()                    // TimelineView snapshot
instance.setView({ start, end })      // patch the view
instance.destroy()                    // unmount everything
instance.root                         // widget root element
```

`mountTimeline` prefers a shadow root (`attachShadow({ mode: 'open' })`); if
that throws it falls back to light DOM, injecting the stylesheet into
`document.head` once and scoping everything under the `et-scope` class it adds
to the host.

Pure helpers (`parseTime`, `wallClock`, `formatDateTime`, `formatClock`,
`formatTimeMs`, `formatDuration`, `formatUtcDotNet`, `minuteOfDay`) and the
sample data (`referenceSession`, `buildEventXml`) are exported from the same
entry for reuse and testing.

## React

```tsx
import EventTimelineUI from './widget/react'

<div style={{ width: 1377 }}>
  <EventTimelineUI
    lang={lang}
    preset="reference-session"
    session={session}            // optional; omit to use the preset
    density="comfortable"
    theme="dark"
    interactive
    className="my-mount"
    onSelectEvent={(event) => setSelected(event)}
    onAction={(action) => console.log(action)}
  />
</div>
```

The wrapper mounts once and syncs props through the JS API; give the component
a stable size (the widget scales with its container width).

## Sizing

The widget has no intrinsic width: it scales with its container, so the host
picks the size. Reference geometry: a `1377px`-wide host renders the window at
the shipped `13.2px` base scale, `104.3em` wide by `60.3em` tall — an aspect
ratio of about `1.73`, height = width ÷ 1.73.

- Give the host a width (or let it fill a sized column); the height follows.
- Inside a box of fixed height, don't cap the width with a constant — measure.
  The React entry exports `useTimelineFit`, which reads the DOM (never viewport
  media queries) and decides between the interactive window at natural scale
  and a poster drawn at the 1377×796 reference size and scaled down:

  ```tsx
  import EventTimelineUI, { useTimelineFit } from './widget/react'

  const holderRef = useRef<HTMLDivElement | null>(null)
  const columnRef = useRef<HTMLDivElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const fit = useTimelineFit(holderRef, columnRef, boxRef)
  ```

  `holderRef` is the box whose height bounds the hero: its computed
  `max-height`/`min-height` and padding decide the budget. `columnRef` is the
  flex column that holds the widget box and the chrome around it; everything in
  it that is not the box (caption, card body, framing border) is measured and
  subtracted. `boxRef` is the element whose laid-out height is the widget's
  rendered height. The inline space is the column's `clientWidth`, not the
  box parent's: the measured scale drives a host's framing box, so measuring
  that framing box would feed the result back into its own measurement.

  The host publishes the measured scale as an inline `--et-fit-scale` on an
  element the poster and any framing box both inherit from — an ancestor of
  the poster, e.g. the column. The poster owns the scaled 1377×796 box and
  derives the applied `--et-scale` from it; a host that frames the window may
  derive its own width from the same variable,
  `calc(1377px * var(--et-fit-scale, 1))`, so the frame hugs the measured
  window. The fallback is `0`: a poster rendered before measurement completes
  shows nothing instead of an overflowing reference box.

  ```tsx
  <div ref={columnRef} style={fit !== null ? { '--et-fit-scale': String(fit.scale) } as CSSProperties : undefined}>
    {fit !== null && (
      <div className="et-poster">
        <EventTimelineUI preset="reference-session" interactive={false} className="et-mount" />
      </div>
    )}
  </div>
  ```

- Poster mode scales proportionally with no minimum font size and keeps the
  desktop layout, so a small card shows a scaled-down window instead of a
  stacked one. To keep it legible on phones, clamp the applied scale in CSS
  under a phone breakpoint — a 720px-wide window keeps its text near 7px — and
  let a clipping parent crop the overflow:

  ```css
  @media (max-width: 560px) {
    .card-shot { overflow: hidden; aspect-ratio: 16 / 10; }

    /* 720 / 1377: the applied-scale floor for a legible crop */
    .card-shot .et-poster { --et-scale: max(var(--et-fit-scale, 0), 0.523); }
  }
  ```

## Theming

All colors are CSS custom properties defined on the root (`:host, .et-scope`).
Override them from outside the shadow root on the host element:

```css
event-timeline-ui {
  --et-marker: #22d3ee;
  --et-playhead: #ff5722;
  --et-accent: #0ea5e9;
}
```

Full set: `--et-ground`, `--et-strip`, `--et-panel`, `--et-center`,
`--et-ruler`, `--et-lane-even`, `--et-lane-odd`, `--et-outside`,
`--et-footer`, `--et-inset`, `--et-line`, `--et-line-soft`, `--et-ink`,
`--et-ink-soft`, `--et-ink-dim`, `--et-accent`, `--et-marker`,
`--et-playhead`, `--et-playhead-glow`, `--et-amber`, `--et-teal`,
`--et-critical`, `--et-error`, `--et-warning`, `--et-information`,
`--et-verbose`, `--et-lane-system`, `--et-lane-applications`,
`--et-lane-files`, `--et-lane-network`, `--et-lane-user`, `--et-ctl`,
`--et-shadow`, `--et-font`, `--et-font-mono`.

Lane accents are usable on their own (`--et-lane-system` … `--et-lane-user`);
the widget also sets `--et-lane-color` per rendered lane chip at runtime, so a
host may read it but should not define it.

Fonts: set `--et-font` / `--et-font-mono`; the widget defaults to Segoe
UI / Cascadia stacks and never loads webfonts.

## Label packs

`es` is the source of truth; `en` is bundled. The `es` pack must not contain
English values. Override any key, or pass a full pack, with `lang` / `labels`:

```js
mountTimeline(host, {
  lang: 'es',
  labels: { apply: 'Aplicar cambios' },
})
```

Template keys use `{placeholders}`:

| Key | Template |
| --- | --- |
| `corridorRange` | `({from} - {to})` |
| `localTime` | `Hora local · {tz}` |
| `eventCounter` | `{total} eventos, mostrando {shown}` |
| `visibleClusters` | `{visible} visibles · {clusters} agrupados` |
| `windowRange` | `{from} - {to} ({duration})` |
| `utcRange` | `[{from}, {to}] (UTC inclusivo)` |
| `toggleLane` | `Mostrar u ocultar {lane}` |
| `clusterLabel` | `{count} eventos agrupados` |
| `markerLabel` / `markerLabelFull` | `Evento a las {time}` / `Evento a las {time} — {provider}` |

## Keyboard shortcuts

`Space` starts and pauses the playhead; there is no visible play control.

## Poster mode

`interactive="false"` (or `interactive: false`) renders the same static frame
with no listeners, sets the `inert` attribute on the root and disables pointer
events — useful for marketing pages and screenshots.

## Responsiveness

The root is a size container. With interaction on, `≥1100px` renders the full
three-column window, `860–1100px` narrows the side panels, and below `860px` it
stacks (title, corridor, timeline, context, details, status) with auto height
and a horizontally scrollable canvas. Poster mode ignores those breakpoints on
purpose and always draws the desktop window.
