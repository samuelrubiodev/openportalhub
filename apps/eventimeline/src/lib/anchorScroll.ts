/**
 * Scrolls to a section the way a fragment link should land: on the layout
 * position, never on the animated one.
 *
 * `.section` starts at `transform: translateY(22px)` and settles with a 560ms
 * transition when it is marked `in-view` (see `styles/hero.css`). The browser's
 * `scrollIntoView` measures the transformed box, so a jump issued in the same
 * tick as the reveal lands 22px too low: the section then rises with the
 * transition and its top ends up hidden behind the sticky top bar. `offsetTop`
 * ignores transforms, so summing the offsetParent chain yields the position the
 * section will occupy once the reveal finishes.
 *
 * The offset is corrected with the document's own `scroll-padding-top`, the same
 * value the browser would use for a native fragment jump; `scrollTo` does not
 * apply it by itself.
 *
 * `behavior` defaults to `'instant'` so the existing fragment-link caller keeps
 * its exact landing behaviour. Callers may request `'smooth'`; if the user has
 * `prefers-reduced-motion: reduce` set, the request falls back to `'instant'`.
 */
export function scrollToSection(target: HTMLElement, behavior: 'smooth' | 'instant' = 'instant'): void {
  const padding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  let top = 0
  for (let node: HTMLElement | null = target; node !== null; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop
  }
  let resolved: 'smooth' | 'instant' = behavior
  if (behavior === 'smooth' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resolved = 'instant'
  }
  window.scrollTo({ top: Math.max(0, top - padding), behavior: resolved })
}

/**
 * Resolves a location fragment to an element id. Returns `null` when there is no
 * fragment or no such element.
 *
 * The fragment is decoded first: `decodeURIComponent` throws on a malformed
 * escape sequence such as `#%E0%A4%A`, and an arbitrary fragment such as
 * `#123abc` is not a valid CSS selector, so neither can be handed to
 * `querySelector` from inside a mount effect without unmounting the page.
 */
export function resolveFragmentTarget(hash: string): HTMLElement | null {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  if (fragment.length === 0) return null
  let id = fragment
  try {
    id = decodeURIComponent(fragment)
  } catch {
    id = fragment
  }
  return document.getElementById(id)
}
