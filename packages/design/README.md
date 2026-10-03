# @openportalhub/design

The rules both sites share. `src/hero.css` holds the design tokens (`:root` custom
properties), the base element styles, the topbar chrome and the language switch, the
language notice bar, the waitlist form and consent row, the logbook strip, the hero
geometry and the poster, the step-label callouts, the sections below the hero
(mechanism, sources, licensing, FAQ), and the `target-scan` / `target-pulse` keyframes.

Both sites import this stylesheet **before** their own `styles/hero.css`, so the cascade
stays "system first, this site's exceptions after". What is left in a site file is only
what that site alone needs: OpenPortalHub keeps its font import and `.logbook-lang`;
Eventimeline keeps `.logbook-badge` and its own `.logbook-lang`.

## The one-file-per-selector invariant

Every selector belongs to one file per site: a selector's rules are never split across
the package and a site file, so the order that decides its outcome stays readable in one
place. When the two sites *agree* on a selector, its rules move here whole — that is the
only way a rule enters this file, and it is how the divergences below were closed.

Two things that are easy to get wrong:

- **Ties on specificity are decided by order.** `.r-appmock .et-mount` and
  `.et-poster .et-mount` both match the widget's host with the same specificity, so the
  poster's rule must stay *after* the other one in this file.
- **A `prefers-reduced-motion` list may repeat a selector from an earlier block.** That is
  safe only when the media rule sets properties the earlier rule does not touch, or sets
  the same value with `!important`. The list at the end of this file sets
  `transition: none !important` over the transitions declared earlier, which is why it has
  to come last.

## The hero, drawn once

Both sites draw the featured window the same measured way: the widget is pinned to its
1377×796 reference box (the size at which its shipped 13.2px base scale is exact) and that
box is scaled to fit. `useTimelineFit`, in `packages/widget/src/react.tsx`, is what
measures; `packages/widget/README.md` documents its three refs and the sizing contract.

The host publishes the measured scale as an inline `--et-fit-scale`; `.et-poster` derives
the applied `--et-scale` from it, so a host can clamp the applied value in CSS.
OpenPortalHub does exactly that, under `max-width: 560px`, to keep its phone crop legible.
The fallback is `0`: a poster rendered before the measurement completes collapses instead
of overflowing.

Nothing here trusts a constant: the applied scale is measured from the DOM, so the window
never falls back to a fixed base scale inside the hero.

What stays per site is the **presentation**, not the mechanism, and both differences are
deliberate: OpenPortalHub frames the window in a card with a title, a description and an
outbound link (so its window is a poster: the card is a link), while Eventimeline shows the
operable window when the room allows it. OpenPortalHub's card is also the only one of the
two that renders without JavaScript, which is why it stays a card.

## What deliberately stays per site

| Difference | Why it stays |
| --- | --- |
| Hero presentation: the card against the operable window | Different jobs: a studio page that sends the visitor to the product, and the product page itself. Documented above. |
| The logbook strip: legal links plus a © line against a `PRE-RELEASE` badge and the footer language switch | Content, not styling: Eventimeline has no legal pages and OpenPortalHub has no badge. One strip item is shared, not per site: the static status-page link (`https://status.openportalhub.org/`, labelled `System status`/`Estado de los servicios`) renders identically in both sites and must change in both together. |
| `.logbook-lang` | Follows that content: OpenPortalHub's carries `white-space: nowrap` for its © line. |
| The dictionaries and the page maps | Per-site content by design. |
| The link inside `LangNotice` | Built from `hrefFor(page, 'es')` where a site has one URL per page and language, and from `pagePath(HOME, 'es')` where it is a single page. |
| `fonts.css` | OpenPortalHub bundles woff2 through the bundler from `src/assets/fonts`; Eventimeline serves them from `public/assets/fonts` with more subsets. A build and asset decision. |

The language notice is *not* in that table: both sites render the same in-flow bar, offered
to a visitor whose recorded choice or browser asks for Spanish, and the toggle that
suppresses it is the topbar's `EN`. Only the copy differs, and only because the dictionaries
are per site.

## What to check in review

- [ ] Every rule added here is identical in both sites: the point of the file is that a
      change cannot be made once and missed somewhere else.
- [ ] A moved selector's rules moved *whole*, and its position relative to any rule it can
      tie with is still the winning one.
- [ ] The site files hold only their own rules: no leftover copy of a rule that now lives
      here.
- [ ] The hero still fits: no clipped content, at 1× and at browser zoom, with and without
      container-query units.

## Related

- `packages/widget/README.md` — the widget's geometry and the `useTimelineFit` contract.
