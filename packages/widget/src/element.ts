// `<event-timeline-ui>` custom element: attributes in, widget mounted in the
// element's own shadow root, events (`event-select`, `timeline-action`,
// `view-change`) bubble out composed.

import { mountTimeline } from './timeline'
import type { TimelineInstance, TimelineOptions, TimelineSession } from './types'

const ATTRIBUTES = ['lang', 'preset', 'interactive', 'density', 'theme', 'session'] as const
const UPGRADE_KEYS = ['options', 'session'] as const

function attributeOptions(el: HTMLElement): TimelineOptions {
  const opts: TimelineOptions = {}
  const lang = el.getAttribute('lang')
  if (lang === 'es' || lang === 'en') opts.lang = lang
  const preset = el.getAttribute('preset')
  if (preset === 'reference-session') opts.preset = preset
  const interactive = el.getAttribute('interactive')
  if (interactive !== null) opts.interactive = interactive !== 'false'
  const density = el.getAttribute('density')
  if (density === 'comfortable' || density === 'compact') opts.density = density
  const theme = el.getAttribute('theme')
  if (theme === 'dark') opts.theme = theme
  const sessionAttr = el.getAttribute('session')
  if (sessionAttr !== null) {
    try {
      opts.session = JSON.parse(sessionAttr) as TimelineSession
    } catch {
      /* malformed session attribute is ignored */
    }
  }
  return opts
}

function cleanDefined(options: TimelineOptions): TimelineOptions {
  const out: TimelineOptions = {}
  const target = out as Record<string, unknown>
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) target[key] = value
  }
  return out
}

// The element class must be declarable outside a browser (SSR, tests, bundlers
// evaluating the module): fall back to a plain base when `HTMLElement` is absent.
const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === 'undefined' ? (class {} as unknown as typeof HTMLElement) : HTMLElement

export class EventTimelineUIElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return [...ATTRIBUTES]
  }

  #instance: TimelineInstance | null = null
  #props: TimelineOptions = {}

  constructor() {
    super()
    // Re-apply properties assigned before the element was upgraded
    // (class fields with define semantics would otherwise shadow them).
    const self = this as unknown as Record<string, unknown>
    for (const key of UPGRADE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(self, key)) {
        const value = self[key]
        delete self[key]
        self[key] = value
      }
    }
  }

  connectedCallback(): void {
    this.tryMount()
  }

  disconnectedCallback(): void {
    this.#instance?.destroy()
    this.#instance = null
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    this.#instance?.updateOptions(attributeOptions(this))
  }

  get options(): TimelineOptions {
    return { ...attributeOptions(this), ...this.#props }
  }

  set options(value: TimelineOptions) {
    this.#props = { ...value }
    if (this.#instance !== null) this.#instance.updateOptions(cleanDefined(this.#props))
    else this.tryMount()
  }

  get session(): TimelineSession | undefined {
    return this.#props.session ?? attributeOptions(this).session
  }

  set session(value: TimelineSession) {
    this.#props = { ...this.#props, session: value }
    if (this.#instance !== null) this.#instance.updateOptions({ session: value })
    else this.tryMount()
  }

  private tryMount(): void {
    if (this.#instance === null && this.isConnected) {
      this.#instance = mountTimeline(this, { ...attributeOptions(this), ...cleanDefined(this.#props) })
    }
  }
}

/** Registers `<event-timeline-ui>` (or a custom tag name) once. */
export function defineEventTimelineUI(tagName = 'event-timeline-ui'): void {
  if (typeof customElements === 'undefined') return
  if (customElements.get(tagName) === undefined) {
    customElements.define(tagName, EventTimelineUIElement)
  }
}
