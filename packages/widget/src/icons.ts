// Inline SVG icon builders. 1px-stroke outline style, stroke/fill from
// `currentColor`, `aria-hidden="true"`. Icons carry no width/height
// attributes: CSS sizes `.et-icon` boxes in em.

const OPEN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
const CLOSE = '</svg>'

function svg(body: string): string {
  return `${OPEN}${body}${CLOSE}`
}

/** Wraps an SVG string in the sizing span used across the widget. */
export function icon(name: IconName, cls?: string): string {
  const extra = cls ? ` ${cls}` : ''
  return `<span class="et-icon${extra}">${ICONS[name]()}</span>`
}

export type IconName =
  | 'hamburger'
  | 'clock'
  | 'calendar'
  | 'flag'
  | 'eye'
  | 'funnel'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'chevronsRight'
  | 'chevronsLeft'
  | 'copy'
  | 'info'
  | 'play'
  | 'pause'
  | 'diamond'
  | 'minimize'
  | 'maximize'
  | 'close'

export const ICONS: Record<IconName, () => string> = {
  hamburger: () =>
    svg('<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>'),
  clock: () =>
    svg('<circle cx="8" cy="8" r="6.25"/><path d="M8 4.75V8l2.6 1.5"/>'),
  calendar: () =>
    svg('<rect x="2.5" y="3.5" width="11" height="9.5" rx="1.4"/><path d="M2.5 6.6h11M5.2 2v3M10.8 2v3"/>'),
  flag: () =>
    svg('<path d="M4.5 2.5v11"/><path d="M4.5 3.6h7.2l-1.6 2.4 1.6 2.4H4.5z"/>'),
  eye: () =>
    svg('<path d="M1.9 8c1.7-3.1 4-4.6 6.1-4.6S12.4 4.9 14.1 8c-1.7 3.1-4 4.6-6.1 4.6S3.6 11.1 1.9 8z"/><circle cx="8" cy="8" r="1.9"/>'),
  funnel: () =>
    svg('<path d="M2.75 3.5h10.5L9.5 8.4v4.4l-3-1.8V8.4z"/>'),
  chevronRight: () =>
    svg('<path d="M6.2 3.5 10.7 8l-4.5 4.5"/>'),
  chevronLeft: () =>
    svg('<path d="M9.8 3.5 5.3 8l4.5 4.5"/>'),
  chevronDown: () =>
    svg('<path d="M3.5 6.2 8 10.7l4.5-4.5"/>'),
  chevronsRight: () =>
    svg('<path d="M3.6 3.9 7.7 8l-4.1 4.1M8.6 3.9 12.7 8l-4.1 4.1"/>'),
  chevronsLeft: () =>
    svg('<path d="M12.4 3.9 8.3 8l4.1 4.1M7.4 3.9 3.3 8l4.1 4.1"/>'),
  copy: () =>
    svg('<rect x="5.6" y="5.6" width="7.9" height="7.9" rx="1.2"/><path d="M3.4 10.4h-.5a1.1 1.1 0 0 1-1.1-1.1V3.3a1.1 1.1 0 0 1 1.1-1.1h6a1.1 1.1 0 0 1 1.1 1.1v.4"/>'),
  info: () =>
    svg('<circle cx="8" cy="8" r="6.25"/><path d="M8 7.4v3.4"/><path d="M8 5.1v.01"/>'),
  play: () =>
    svg('<path d="M5.6 3.6v8.8L12.4 8z"/>'),
  pause: () =>
    svg('<path d="M5.4 3.8v8.4M10.6 3.8v8.4"/>'),
  diamond: () =>
    svg('<path d="M8 2.9 13.1 8 8 13.1 2.9 8z"/>'),
  minimize: () =>
    svg('<path d="M3.9 11.4h8.2"/>'),
  maximize: () =>
    svg('<rect x="3.7" y="3.7" width="8.6" height="8.6" rx="0.6"/>'),
  close: () =>
    svg('<path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"/>'),
}
