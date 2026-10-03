// Public data, option and label types for the Event Timeline UI widget.

export type Level = 'critical' | 'error' | 'warning' | 'information' | 'verbose'
export type Theme = 'dark'
export type Density = 'comfortable' | 'compact'

export interface TimelineEvent {
  id: string
  lane: string
  /** ISO 8601 with offset; millisecond precision allowed. */
  time: string
  provider?: string
  eventId?: string | number
  level?: Level
  channel?: string
  category?: { label: string; id?: string; derived?: boolean; note?: string }
  computer?: string
  origin?: string
  processId?: number | string
  threadId?: number | string
  user?: string
  message?: string
  markNote?: string
  data?: Record<string, string>
  xml?: string
}

export interface TimelineLane {
  id: string
  label: string
  color: string
  visible?: boolean
}

export interface TimelineIncident {
  name: string
  computer: string
  description?: string
  start: string
  end: string
  /** Minutes east of UTC, e.g. 120 for UTC+02:00. */
  timezoneOffset: number
  timezoneLabel?: string
  note?: string
  active?: boolean
}

export interface TimelineMark {
  id: string
  /** `corridor` marks bracket the loaded range, `incident` marks the incident start, `bookmark` flags a moment. */
  kind: 'corridor' | 'incident' | 'bookmark'
  time: string
  label?: string
  color?: string
}

export interface TimelineSession {
  title: string
  subtitle?: string
  incident: TimelineIncident
  lanes: TimelineLane[]
  events: TimelineEvent[]
  marks?: TimelineMark[]
  window?: { start: string; end: string }
  queryRange?: { start: string; end: string }
  statusLine?: string
}

export interface TimelineView {
  start: number // epoch ms, left edge of the visible window
  end: number // epoch ms, right edge of the visible window
  playhead: number // epoch ms
  selectedId: string | null
  hiddenLanes: string[]
  /** Empty array = no level filter. */
  levels: Level[]
  query: string
  loadedOnly: boolean
  showIncidentMark: boolean
  showBookmarks: boolean
  tab: 'details' | 'xml'
  collapsed: { context: boolean; details: boolean }
}

/** Full label pack. `es` is the source of truth; see `labels.ts`. */
export interface Labels {
  // Title bar
  appTitle: string
  menu: string
  winMinimize: string
  winMaximize: string
  winClose: string
  openEvtx: string
  newLocalIncident: string
  saveIncident: string
  closeIncident: string
  // Time corridor strip
  timeCorridor: string
  corridorRange: string // '{from} - {to}' wrapped in parentheses
  start: string
  end: string
  apply: string
  pickStart: string
  pickEnd: string
  // Context panel
  context: string
  incident: string
  name: string
  computer: string
  description: string
  incidentNote: string
  localTime: string // 'Hora local · {tz}'
  layers: string
  incidentMark: string
  bookmarks: string
  levelHeader: string
  levelCritical: string
  levelError: string
  levelWarning: string
  levelInformation: string
  levelVerbose: string
  play: string
  pause: string
  collapseContext: string
  expandContext: string
  collapseDetails: string
  expandDetails: string
  // Center header + search
  unifiedTimeline: string
  eventCounter: string // '{total} eventos, mostrando {shown}'
  span15m: string
  span1h: string
  span6h: string
  span24h: string
  fit: string
  zoomOut: string
  zoomIn: string
  filters: string
  search: string
  searchPlaceholder: string
  loadedCorridorOnly: string
  resetFilters: string
  // Ruler + plot footer
  timeRuler: string
  visibleWindowLabel: string
  windowRange: string // '{from} – {to} ({duration})'
  visibleClusters: string // '{visible} visibles · {clusters} agrupados'
  localQueryDone: string
  utcRange: string // '[{from}, {to}] (UTC inclusivo)'
  // Details panel
  eventDetails: string
  tabDetails: string
  tabXml: string
  provider: string
  eventIdLabel: string
  levelLabel: string
  dateLabel: string
  timeLabel: string
  channel: string
  category: string
  origin: string
  processId: string
  threadId: string
  lane: string
  structuredData: string
  markerNote: string
  copyStructured: string
  copied: string
  noSelection: string
  // Canvas + markers
  canvasAria: string
  toggleLane: string // 'Mostrar u ocultar {lane}'
  clusterLabel: string // '{count} eventos agrupados'
  markerLabel: string // 'Evento a las {time}'
  markerLabelFull: string // 'Evento a las {time} — {provider}'
  dash: string
}

export interface TimelineOptions {
  lang?: 'es' | 'en' | Labels
  labels?: Partial<Labels>
  preset?: 'reference-session'
  session?: TimelineSession
  interactive?: boolean
  density?: Density
  theme?: Theme
  clusterThresholdPx?: number
  onSelect?: (event: TimelineEvent | null) => void
  onAction?: (action: string) => void
  onViewChange?: (view: TimelineView) => void
}

export interface TimelineInstance {
  update(session: TimelineSession): void
  updateOptions(options: Partial<TimelineOptions>): void
  getView(): TimelineView
  setView(patch: Partial<TimelineView>): void
  destroy(): void
  readonly root: HTMLElement
}
