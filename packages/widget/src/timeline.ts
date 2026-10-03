// DOM kernel: mounts the widget, owns state and interactions. All layout
// numbers live in `styles.ts`; this file only builds structure and wires
// behavior. Pure math lives in `view.ts` / `format.ts`.

import { buildEventXml, referenceSession } from './presets'
import { icon, type IconName } from './icons'
import { fill, labels as LABEL_PACKS } from './labels'
import { widgetStyles } from './styles'
import {
  activeSpanChip,
  clampSpan,
  clusterEvents,
  computeTicks,
  filterEvents,
  fractionToTime,
  initView,
  keepPlayheadVisible,
  levelList,
  normalizeSession,
  panWindow,
  spanOf,
  timeToFraction,
  zoomAround,
  SPAN_CHIPS,
  type EventCluster,
  type NormalizedEvent,
  type NormalizedSession,
} from './view'
import {
  formatClock,
  formatDateTime,
  formatDuration,
  formatOffsetLabel,
  formatTimeMs,
  formatUtcDotNet,
  parseWallClock,
} from './format'
import type { Labels, Level, TimelineInstance, TimelineOptions, TimelineSession, TimelineView } from './types'

const PRESETS: Record<string, TimelineSession> = { 'reference-session': referenceSession }
const DEFAULT_THRESHOLD_PX = 24
const LEVEL_VAR: Record<Level, string> = {
  critical: 'var(--et-critical)',
  error: 'var(--et-error)',
  warning: 'var(--et-warning)',
  information: 'var(--et-information)',
  verbose: 'var(--et-verbose)',
}

const LEVEL_KEYS: Record<Level, keyof Labels> = {
  critical: 'levelCritical',
  error: 'levelError',
  warning: 'levelWarning',
  information: 'levelInformation',
  verbose: 'levelVerbose',
}

function elt<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  return node
}

function pct(fraction: number): string {
  return `${(Math.min(1, Math.max(0, fraction)) * 100).toFixed(4)}%`
}

function setPressed(btn: HTMLElement, pressed: boolean): void {
  btn.setAttribute('aria-pressed', pressed ? 'true' : 'false')
}

export function mountTimeline(host: HTMLElement, options: TimelineOptions = {}): TimelineInstance {
  let opts: TimelineOptions = { ...options }
  let labelsValue: Labels = LABEL_PACKS.es
  let rawSession: TimelineSession = referenceSession
  let session: NormalizedSession = normalizeSession(rawSession)
  let view: TimelineView = initView(session)
  let destroyed = false
  let filtersOpen = false
  let playing = false
  let rafId = 0
  let copyTimer: number | undefined
  let dragging = false
  let playFrom = 0
  let playTo = 0
  let playStartWall = 0
  let playDuration = 0
  let clusters: EventCluster[] = []
  let visibleEvents: NormalizedEvent[] = []
  let interactiveAttached = false

  /* ---------- root: shadow DOM with light-DOM fallback ---------- */

  const existingShadow = host.shadowRoot
  let createdShadow: ShadowRoot | null = null
  if (existingShadow === null) {
    try {
      createdShadow = host.attachShadow({ mode: 'open' })
    } catch {
      createdShadow = null
    }
  }
  const shadow = existingShadow ?? createdShadow
  const lightDom = shadow === null
  let rootHost: HTMLElement
  if (lightDom) {
    host.classList.add('et-scope')
    if (document.head.querySelector('style[data-et-styles]') === null) {
      const style = document.createElement('style')
      style.setAttribute('data-et-styles', '')
      style.textContent = widgetStyles
      document.head.appendChild(style)
    }
    rootHost = host
  } else {
    const style = document.createElement('style')
    style.textContent = widgetStyles
    shadow.appendChild(style)
    const scope = elt('div', 'et-scope')
    shadow.appendChild(scope)
    rootHost = scope
  }

  const root = elt('div', 'et')
  rootHost.appendChild(root)

  /* title bar */
  const title = elt('header', 'et-title')
  const menuBtn = elt('button', 'et-menuBtn')
  menuBtn.type = 'button'
  menuBtn.dataset.action = 'menu'
  menuBtn.innerHTML = icon('hamburger')
  const brand = elt('div', 'et-brand')
  const brandName = elt('span', 'et-brandName')
  const brandDot = elt('span', 'et-brandDot')
  brandDot.textContent = '·'
  brandDot.setAttribute('aria-hidden', 'true')
  const brandSub = elt('span', 'et-brandSub')
  brand.append(brandName, brandDot, brandSub)
  const titleActions = elt('div', 'et-titleActions')
  const titleActionsSpecs: Array<['open-evtx' | 'new-incident' | 'save-incident' | 'close-incident', keyof Labels]> = [
    ['open-evtx', 'openEvtx'],
    ['new-incident', 'newLocalIncident'],
    ['save-incident', 'saveIncident'],
    ['close-incident', 'closeIncident'],
  ]
  const titleButtons: HTMLButtonElement[] = []
  for (const [action] of titleActionsSpecs) {
    const b = elt('button', 'et-tbtn')
    b.type = 'button'
    b.dataset.action = action
    titleButtons.push(b)
    titleActions.appendChild(b)
  }
  const titleSep = elt('span', 'et-titleSep')
  const winControls = elt('div', 'et-winControls')
  const winSpecs: Array<['minimize' | 'maximize' | 'close', IconName, keyof Labels]> = [
    ['minimize', 'minimize', 'winMinimize'],
    ['maximize', 'maximize', 'winMaximize'],
    ['close', 'close', 'winClose'],
  ]
  const winButtons: HTMLButtonElement[] = []
  for (const [action, iconName] of winSpecs) {
    const b = elt('button', 'et-winBtn')
    b.type = 'button'
    b.dataset.action = action
    b.innerHTML = icon(iconName)
    winButtons.push(b)
    winControls.appendChild(b)
  }
  title.append(menuBtn, brand, titleActions, titleSep, winControls)

  /* corridor strip */
  const corridor = elt('div', 'et-corridor')
  const corridorInfo = elt('div', 'et-corridorInfo')
  const corridorBadge = elt('span', 'et-corridorBadge')
  corridorBadge.innerHTML = icon('clock')
  const corridorTexts = elt('div', 'et-corridorTexts')
  const corridorLabel = elt('span', 'et-corridorLabel')
  const corridorRange = elt('span', 'et-corridorRange')
  corridorTexts.append(corridorLabel, corridorRange)
  corridorInfo.append(corridorBadge, corridorTexts)
  const corridorSep = elt('span', 'et-corridorSep')
  const corridorFields = elt('div', 'et-corridorFields')
  const startLabel = elt('span', 'et-fieldLabel')
  const startField = elt('input', 'et-field')
  startField.type = 'text'
  startField.spellcheck = false
  const startCal = elt('button', 'et-calBtn')
  startCal.type = 'button'
  startCal.dataset.action = 'pick-start'
  startCal.innerHTML = icon('calendar')
  const colon = elt('span', 'et-colon')
  colon.textContent = ':'
  colon.setAttribute('aria-hidden', 'true')
  const endLabel = elt('span', 'et-fieldLabel')
  const endField = elt('input', 'et-field')
  endField.type = 'text'
  endField.spellcheck = false
  const endCal = elt('button', 'et-calBtn')
  endCal.type = 'button'
  endCal.dataset.action = 'pick-end'
  endCal.innerHTML = icon('calendar')
  corridorFields.append(startLabel, startField, startCal, colon, endLabel, endField, endCal)
  const applyBtn = elt('button', 'et-applyBtn')
  applyBtn.type = 'button'
  applyBtn.dataset.action = 'apply-corridor'
  corridor.append(corridorInfo, corridorSep, corridorFields, applyBtn)

  /* context panel */
  const context = elt('aside', 'et-context')
  const ctxRail = elt('button', 'et-railBtn')
  ctxRail.type = 'button'
  ctxRail.dataset.action = 'toggle-context'
  ctxRail.innerHTML = icon('chevronsLeft')
  const ctxBody = elt('div', 'et-contextBody')
  const ctxHead = elt('div', 'et-panelHead')
  const incidentHead = elt('div', 'et-incidentHead')
  const incidentIcon = elt('span', 'et-incidentIcon')
  incidentIcon.innerHTML = icon('clock')
  const incidentTitle = elt('span', 'et-incidentTitle')
  const ctxCollapse = elt('button', 'et-collapseBtn')
  ctxCollapse.type = 'button'
  ctxCollapse.dataset.action = 'toggle-context'
  ctxCollapse.innerHTML = icon('chevronsRight')
  const kvName = elt('div', 'et-kv')
  const kvComputer = elt('div', 'et-kv')
  const kvDescription = elt('div', 'et-kv')
  const kvStart = elt('div', 'et-kv')
  const kvEnd = elt('div', 'et-kv')
  const nameValue = elt('span', 'et-kvValue')
  const computerValue = elt('span', 'et-kvValue')
  const descriptionValue = elt('span', 'et-kvValue')
  const startValue = elt('span', 'et-kvValue')
  const endValue = elt('span', 'et-kvValue')
  const startMiniCal = miniCal('pick-incident-start')
  const endMiniCal = miniCal('pick-incident-end')
  kvName.append(elt('span', 'et-kvLabel'), nameValue)
  kvComputer.append(elt('span', 'et-kvLabel'), computerValue)
  kvDescription.append(elt('span', 'et-kvLabel'), descriptionValue)
  kvStart.append(elt('span', 'et-kvLabel'), startValue, wrapActions(startMiniCal))
  kvEnd.append(elt('span', 'et-kvLabel'), endValue, wrapActions(endMiniCal))
  const tzLine = elt('div', 'et-tzLine')
  const noteLabel = elt('div', 'et-noteLabel')
  const noteBox = elt('div', 'et-noteBox')
  const sep1 = elt('hr', 'et-sep')
  const layersHead = elt('div', 'et-sectionHead')
  const layersIcon = elt('span', 'et-icon')
  layersIcon.innerHTML = icon('funnel')
  const layersTitle = elt('span')
  layersHead.append(layersIcon, layersTitle)
  const pillIncident = elt('button', 'et-pill')
  pillIncident.type = 'button'
  pillIncident.dataset.action = 'toggle-incident-mark'
  const pillIncidentText = elt('span')
  const pillIncidentTime = elt('span', 'et-pillTime')
  pillIncident.append(wrapIcon('flag'), pillIncidentText, pillIncidentTime)
  const pillBookmarks = elt('button', 'et-pill')
  pillBookmarks.type = 'button'
  pillBookmarks.dataset.action = 'toggle-bookmarks'
  const pillBookmarksText = elt('span')
  pillBookmarks.append(wrapIcon('flag'), pillBookmarksText)
  const levelHead = elt('div', 'et-levelHead')
  const levelChips = levelList().map((level) => {
    const chip = elt('button', 'et-chip')
    chip.type = 'button'
    chip.dataset.action = 'toggle-level'
    chip.dataset.arg = level
    return chip
  })
  const levelRow = elt('div', 'et-chipRow')
  levelRow.append(...levelChips)
  incidentHead.append(incidentIcon, incidentTitle, ctxCollapse)
  ctxBody.append(
    ctxHead,
    incidentHead,
    kvName,
    kvComputer,
    kvDescription,
    kvStart,
    kvEnd,
    tzLine,
    noteLabel,
    noteBox,
    sep1,
    layersHead,
    pillIncident,
    pillBookmarks,
    levelHead,
    levelRow,
  )
  context.append(ctxRail, ctxBody)

  /* center column */
  const center = elt('section', 'et-center')
  const centerHead = elt('div', 'et-centerHead')
  const centerTitle = elt('span', 'et-centerTitle')
  const centerCount = elt('span', 'et-centerCount')
  const spanGroup = elt('div', 'et-spanGroup')
  const spanButtons = new Map<string, HTMLButtonElement>()
  for (const chip of SPAN_CHIPS) {
    const b = elt('button', 'et-spanBtn')
    b.type = 'button'
    b.dataset.action = 'set-span'
    b.dataset.arg = chip.id
    spanButtons.set(chip.id, b)
    spanGroup.appendChild(b)
  }
  const fitBtn = spanLikeButton('fit', true)
  const zoomOutBtn = spanLikeButton('zoom-out', true)
  const zoomInBtn = spanLikeButton('zoom-in', false)
  spanGroup.append(fitBtn, zoomOutBtn, zoomInBtn)
  const filtersWrap = elt('div', 'et-filtersWrap')
  const filtersBtn = elt('button', 'et-filtersBtn')
  filtersBtn.type = 'button'
  filtersBtn.dataset.action = 'toggle-filters'
  filtersBtn.setAttribute('aria-expanded', 'false')
  const filtersIcon = elt('span', 'et-icon')
  filtersIcon.innerHTML = icon('funnel')
  const filtersText = elt('span')
  const filtersChevron = elt('span', 'et-icon et-chevron')
  filtersChevron.innerHTML = icon('chevronDown')
  filtersBtn.append(filtersIcon, filtersText, filtersChevron)
  const popover = elt('div', 'et-popover')
  const popLanesHead = elt('div', 'et-popHead')
  const popLanes = elt('div', 'et-chipRow')
  popLanes.style.flexDirection = 'column'
  const popLevelsHead = elt('div', 'et-popHead')
  const popLevels = elt('div', 'et-chipRow')
  const popLevelButtons = levelList().map((level) => {
    const chip = elt('button', 'et-chip')
    chip.type = 'button'
    chip.dataset.action = 'toggle-level'
    chip.dataset.arg = level
    return chip
  })
  popLevels.append(...popLevelButtons)
  const popLoaded = elt('button', 'et-loadedToggle')
  popLoaded.type = 'button'
  popLoaded.dataset.action = 'toggle-loaded-only'
  const popReset = elt('button', 'et-popReset')
  popReset.type = 'button'
  popReset.dataset.action = 'reset-filters'
  popover.append(popLanesHead, popLanes, popLevelsHead, popLevels, popLoaded, popReset)
  filtersWrap.append(filtersBtn, popover)
  centerHead.append(centerTitle, centerCount, spanGroup, filtersWrap)

  const searchRow = elt('div', 'et-searchRow')
  const searchLabel = elt('label', 'et-searchLabel')
  const searchInput = elt('input', 'et-searchInput')
  searchInput.type = 'text'
  searchInput.spellcheck = false
  searchLabel.htmlFor = 'et-search-input'
  searchInput.id = 'et-search-input'
  const loadedToggle = elt('button', 'et-loadedToggle')
  loadedToggle.type = 'button'
  loadedToggle.dataset.action = 'toggle-loaded-only'
  searchRow.append(searchLabel, searchInput, loadedToggle)

  const plot = elt('div', 'et-plot')
  const plotLabels = elt('div', 'et-plotLabels')
  const rulerCaption = elt('div', 'et-rulerCaption')
  plotLabels.append(rulerCaption)
  const laneLabelEls: Array<{ wrap: HTMLElement; name: HTMLElement; count: HTMLElement; eye: HTMLButtonElement }> = []
  const canvasScroll = elt('div', 'et-canvasScroll')
  const canvasHost = elt('div', 'et-canvasHost')
  canvasHost.tabIndex = 0
  canvasHost.setAttribute('role', 'application')
  const rulerBand = elt('div', 'et-rulerBand')
  const ticksGroup = elt('div')
  ticksGroup.style.cssText = 'position:absolute;inset:0;'
  const bracketLeft = elt('span', 'et-bracket et-bracketLeft')
  const bracketRight = elt('span', 'et-bracket et-bracketRight')
  const playChip = elt('span', 'et-playChip')
  rulerBand.append(ticksGroup, bracketLeft, bracketRight, playChip)
  const laneStrips: HTMLElement[] = []
  const overlay = elt('div', 'et-overlay')
  const corridorLineA = elt('span', 'et-corridorLine')
  const corridorLineB = elt('span', 'et-corridorLine')
  const incidentLine = elt('span', 'et-incidentLine')
  const bookmarkGroup = elt('div')
  bookmarkGroup.style.cssText = 'position:absolute;inset:0;'
  const playGlow = elt('span', 'et-playGlow')
  const playLine = elt('span', 'et-playLine')
  overlay.append(corridorLineA, corridorLineB, incidentLine, bookmarkGroup, playGlow, playLine)
  canvasHost.append(rulerBand, overlay)
  canvasScroll.appendChild(canvasHost)
  const plotFoot = elt('div', 'et-plotFoot')
  const footLabel = elt('span', 'et-footLabel')
  const footRange = elt('span', 'et-footRange')
  const footCounts = elt('span', 'et-footCounts')
  const footMsg = elt('span', 'et-footMsg')
  plotFoot.append(footLabel, footRange, footCounts, footMsg)
  plot.append(plotLabels, canvasScroll, plotFoot)
  center.append(centerHead, searchRow, plot)

  /* details panel */
  const details = elt('aside', 'et-details')
  const detRail = elt('button', 'et-railBtn')
  detRail.type = 'button'
  detRail.dataset.action = 'toggle-details'
  detRail.innerHTML = icon('chevronsLeft')
  const detBodyWrap = elt('div', 'et-detailsBodyWrap')
  const detHead = elt('div', 'et-detailsHead')
  const detTitle = elt('span', 'et-panelTitle')
  const detCollapse = elt('button', 'et-collapseBtn')
  detCollapse.type = 'button'
  detCollapse.dataset.action = 'toggle-details'
  detCollapse.innerHTML = icon('chevronsRight')
  detHead.append(detTitle, detCollapse)
  const tabs = elt('div', 'et-tabs')
  tabs.setAttribute('role', 'tablist')
  const tabDetails = elt('button', 'et-tab')
  tabDetails.type = 'button'
  tabDetails.dataset.action = 'set-tab'
  tabDetails.dataset.arg = 'details'
  tabDetails.setAttribute('role', 'tab')
  const tabXml = elt('button', 'et-tab')
  tabXml.type = 'button'
  tabXml.dataset.action = 'set-tab'
  tabXml.dataset.arg = 'xml'
  tabXml.setAttribute('role', 'tab')
  tabs.append(tabDetails, tabXml)
  const detBody = elt('div', 'et-detailsBody')
  const copyBtn = elt('button', 'et-copyBtn')
  copyBtn.type = 'button'
  copyBtn.dataset.action = 'copy-structured'
  const copyIcon = elt('span', 'et-icon')
  copyIcon.innerHTML = icon('copy')
  const copyLabel = elt('span')
  copyBtn.append(copyIcon, copyLabel)
  detBodyWrap.append(detHead, tabs, detBody, copyBtn)
  details.append(detRail, detBodyWrap)

  /* status bar */
  const status = elt('footer', 'et-status')
  const statusMsg = elt('span', 'et-statusMsg')
  const statusRange = elt('span', 'et-statusRange')
  status.append(statusMsg, statusRange)

  /* main split */
  const main = elt('div', 'et-main')
  main.append(context, center, details)
  root.append(title, corridor, main, status)

  function miniCal(action: string): HTMLButtonElement {
    const b = elt('button', 'et-miniCal')
    b.type = 'button'
    b.dataset.action = action
    b.innerHTML = icon('calendar')
    return b
  }

  function wrapActions(node: HTMLElement): HTMLElement {
    const wrap = elt('span', 'et-kvActions')
    wrap.appendChild(node)
    return wrap
  }

  function wrapIcon(name: IconName): HTMLElement {
    const wrap = elt('span', 'et-icon')
    wrap.innerHTML = icon(name)
    return wrap
  }

  function spanLikeButton(action: string, divided: boolean): HTMLButtonElement {
    const b = elt('button', divided ? 'et-spanBtn et-divided' : 'et-spanBtn')
    b.type = 'button'
    b.dataset.action = action
    return b
  }

  /* ---------- labels ---------- */

  function resolveLabels(): Labels {
    const lang = opts.lang ?? 'es'
    const base = typeof lang === 'object' ? lang : (LABEL_PACKS[lang] ?? LABEL_PACKS.es)
    return { ...base, ...opts.labels }
  }

  function applyLabels(): void {
    const L = labelsValue
    menuBtn.setAttribute('aria-label', L.menu)
    brandName.textContent = L.appTitle
    titleButtons.forEach((b, i) => {
      b.textContent = L[titleActionsSpecs[i][1]]
    })
    winButtons.forEach((b, i) => b.setAttribute('aria-label', L[winSpecs[i][2]]))
    corridorLabel.textContent = L.timeCorridor
    startLabel.textContent = L.start
    endLabel.textContent = L.end
    startField.setAttribute('aria-label', L.start)
    endField.setAttribute('aria-label', L.end)
    startCal.setAttribute('aria-label', L.pickStart)
    endCal.setAttribute('aria-label', L.pickEnd)
    applyBtn.textContent = L.apply
    ctxHead.textContent = L.context
    incidentTitle.textContent = L.incident
    const kvLabels = [L.name, L.computer, L.description, L.start, L.end]
    const kvRows = [kvName, kvComputer, kvDescription, kvStart, kvEnd]
    kvRows.forEach((row, i) => {
      const label = row.querySelector<HTMLElement>('.et-kvLabel')
      if (label !== null) label.textContent = kvLabels[i]
    })
    startMiniCal.setAttribute('aria-label', L.pickStart)
    endMiniCal.setAttribute('aria-label', L.pickEnd)
    tzLine.textContent = fill(L.localTime, { tz: formatOffsetLabel(session.incident.offset) })
    noteLabel.textContent = L.incidentNote
    layersTitle.textContent = L.layers
    pillIncidentText.textContent = L.incidentMark
    pillBookmarksText.textContent = L.bookmarks
    levelHead.textContent = L.levelHeader
    levelChips.forEach((chip) => {
      chip.textContent = L[LEVEL_KEYS[chip.dataset.arg as Level]]
    })
    centerTitle.textContent = L.unifiedTimeline
    const spanTexts: Array<[string, string]> = [
      ['15m', L.span15m],
      ['1h', L.span1h],
      ['6h', L.span6h],
      ['24h', L.span24h],
    ]
    for (const [id, text] of spanTexts) {
      const b = spanButtons.get(id)
      if (b !== undefined) b.textContent = text
    }
    fitBtn.textContent = L.fit
    zoomOutBtn.textContent = L.zoomOut
    zoomInBtn.textContent = L.zoomIn
    filtersText.textContent = L.filters
    popLanesHead.textContent = L.layers
    popLevelsHead.textContent = L.levelHeader
    popLevelButtons.forEach((chip) => {
      chip.textContent = L[LEVEL_KEYS[chip.dataset.arg as Level]]
    })
    popLoaded.textContent = L.loadedCorridorOnly
    popReset.textContent = L.resetFilters
    searchLabel.textContent = L.search
    searchInput.placeholder = L.searchPlaceholder
    loadedToggle.textContent = L.loadedCorridorOnly
    rulerCaption.textContent = L.timeRuler
    footLabel.textContent = L.visibleWindowLabel
    footMsg.textContent = L.localQueryDone
    detTitle.textContent = L.eventDetails
    tabDetails.textContent = L.tabDetails
    tabXml.textContent = L.tabXml
    copyLabel.textContent = L.copyStructured
    canvasHost.setAttribute('aria-label', L.canvasAria)
    ctxCollapse.setAttribute('aria-label', L.collapseContext)
    ctxRail.setAttribute('aria-label', L.expandContext)
    detCollapse.setAttribute('aria-label', L.collapseDetails)
    detRail.setAttribute('aria-label', L.expandDetails)
    for (const entry of laneLabelEls) {
      entry.eye.setAttribute('aria-label', fill(L.toggleLane, { lane: entry.name.textContent ?? '' }))
    }
  }

  /* ---------- structure that follows the session ---------- */

  function buildLaneStructure(): void {
    for (const entry of laneLabelEls) entry.wrap.remove()
    laneLabelEls.length = 0
    for (const strip of laneStrips) strip.remove()
    laneStrips.length = 0
    while (popLanes.firstChild !== null) popLanes.firstChild.remove()
    session.lanes.forEach((lane, i) => {
      const wrap = elt('div', 'et-laneLabel')
      const head = elt('div', 'et-laneHead')
      const bar = elt('span', 'et-laneBar')
      bar.style.background = lane.color
      const name = elt('span', 'et-laneName')
      name.textContent = lane.label
      const eye = elt('button', 'et-eyeBtn')
      eye.type = 'button'
      eye.dataset.action = 'toggle-lane'
      eye.dataset.arg = lane.id
      eye.innerHTML = icon('eye')
      const count = elt('span', 'et-laneCount')
      head.append(bar, name, eye)
      wrap.append(head, count)
      plotLabels.appendChild(wrap)
      laneLabelEls.push({ wrap, name, count, eye })
      const strip = elt('div', 'et-laneStrip')
      strip.style.top = `calc(4.091em + ${i} * 7.273em)`
      strip.dataset.even = i % 2 === 0 ? 'true' : 'false'
      canvasHost.insertBefore(strip, overlay)
      laneStrips.push(strip)
      const popLane = elt('button', 'et-popLane')
      popLane.type = 'button'
      popLane.dataset.action = 'toggle-lane'
      popLane.dataset.arg = lane.id
      const dot = elt('span', 'et-popLaneDot')
      dot.style.background = lane.color
      popLane.append(dot, document.createTextNode(lane.label))
      popLanes.appendChild(popLane)
    })
    applyLabels()
  }

  /* ---------- rendering ---------- */

  function render(): void {
    if (destroyed) return
    const L = labelsValue
    const off = session.incident.offset
    root.dataset.density = opts.density ?? 'comfortable'
    root.dataset.theme = opts.theme ?? 'dark'
    root.dataset.poster = opts.interactive === false ? 'true' : 'false'
    root.inert = opts.interactive === false
    context.setAttribute('data-collapsed', view.collapsed.context ? 'true' : 'false')
    details.setAttribute('data-collapsed', view.collapsed.details ? 'true' : 'false')

    // corridor
    corridorRange.textContent = fill(L.corridorRange, {
      from: formatDateTime(session.queryRange.start, off, { date: false }),
      to: formatDateTime(session.queryRange.end, off, { date: false }),
    })
    syncFieldValue(startField, formatDateTime(session.queryRange.start, off))
    syncFieldValue(endField, formatDateTime(session.queryRange.end, off))
    brandSub.textContent = session.subtitle

    // context
    nameValue.textContent = session.incident.name
    computerValue.textContent = session.incident.computer
    descriptionValue.textContent = session.incident.description
    startValue.textContent = formatDateTime(session.incident.startMs, off)
    endValue.textContent = formatDateTime(session.incident.endMs, off)
    tzLine.textContent = fill(L.localTime, { tz: session.incident.offsetLabel })
    noteBox.textContent = session.incident.note
    setPressed(pillIncident, view.showIncidentMark)
    setPressed(pillBookmarks, view.showBookmarks)
    pillIncidentTime.textContent = formatDateTime(session.incident.startMs, off, { date: false })
    for (const chip of levelChips) setPressed(chip, view.levels.includes(chip.dataset.arg as Level))
    for (const chip of popLevelButtons) setPressed(chip, view.levels.includes(chip.dataset.arg as Level))

    // center head + clusters
    visibleEvents = filterEvents(session, view)
    const canvasWidth = canvasHost.clientWidth
    clusters = clusterEvents(visibleEvents, view, canvasWidth, opts.clusterThresholdPx ?? DEFAULT_THRESHOLD_PX)
    centerCount.textContent = fill(L.eventCounter, {
      total: session.events.length,
      shown: visibleEvents.length,
    })
    const activeChip = activeSpanChip(spanOf(view))
    for (const [id, btn] of spanButtons) setPressed(btn, id === activeChip)

    // popover
    filtersBtn.setAttribute('aria-expanded', filtersOpen ? 'true' : 'false')
    popover.dataset.open = filtersOpen ? 'true' : 'false'
    const popLaneButtons = popLanes.querySelectorAll<HTMLButtonElement>('[data-action="toggle-lane"]')
    popLaneButtons.forEach((btn) => setPressed(btn, !view.hiddenLanes.includes(btn.dataset.arg ?? '')))

    // search
    syncFieldValue(searchInput, view.query)
    setPressed(loadedToggle, view.loadedOnly)
    setPressed(popLoaded, view.loadedOnly)

    // lane labels
    session.lanes.forEach((lane, i) => {
      const entry = laneLabelEls[i]
      if (entry === undefined) return
      const loaded = session.events.filter((e) => e.lane === lane.id).length
      entry.count.textContent = `(${loaded})`
      entry.wrap.dataset.hidden = view.hiddenLanes.includes(lane.id) ? 'true' : 'false'
      setPressed(entry.eye, !view.hiddenLanes.includes(lane.id))
    })

    renderRuler(off)
    renderOverlay()
    renderMarkers(off)
    renderPlayhead(off)

    // footer
    footRange.textContent = fill(L.windowRange, {
      from: formatDateTime(view.start, off),
      to: formatDateTime(view.end, off),
      duration: formatDuration(view.end - view.start),
    })
    footCounts.textContent = fill(L.visibleClusters, {
      visible: visibleEvents.length,
      clusters: clusters.length,
    })

    renderDetails()
    statusMsg.textContent = session.statusLine ?? L.localQueryDone
    statusRange.textContent = fill(L.utcRange, {
      from: formatUtcDotNet(session.queryRange.start),
      to: formatUtcDotNet(session.queryRange.end),
    })
  }

  function syncFieldValue(input: HTMLInputElement, value: string): void {
    if (document.activeElement !== input && input.value !== value) input.value = value
  }

  function renderRuler(off: number): void {
    ticksGroup.replaceChildren()
    const ticks = computeTicks(view.start, view.end)
    for (const t of ticks.minors) {
      const tick = elt('span', 'et-tick')
      tick.style.left = pct(timeToFraction(t, view))
      ticksGroup.appendChild(tick)
    }
    for (const t of ticks.majors) {
      const tick = elt('span', 'et-tick et-tickMajor')
      tick.style.left = pct(timeToFraction(t, view))
      const label = elt('span', 'et-tickLabel')
      label.style.left = pct(timeToFraction(t, view))
      label.textContent = formatClock(t, off)
      ticksGroup.append(tick, label)
    }
    const corridorMarks = session.marks.filter((m) => m.mark.kind === 'corridor').sort((a, b) => a.t - b.t)
    bracketLeft.textContent =
      corridorMarks[0]?.mark.label ?? formatDateTime(session.queryRange.start, off, { date: false })
    bracketRight.textContent =
      corridorMarks[1]?.mark.label ?? formatDateTime(session.queryRange.end, off, { date: false })
    bracketLeft.style.setProperty('--px', pct(timeToFraction(session.queryRange.start, view)))
    bracketRight.style.setProperty('--px', pct(timeToFraction(session.queryRange.end, view)))
  }

  function renderOverlay(): void {
    corridorLineA.style.left = pct(timeToFraction(session.queryRange.start, view))
    corridorLineB.style.left = pct(timeToFraction(session.queryRange.end, view))
    incidentLine.style.left = pct(timeToFraction(session.incident.startMs, view))
    // Skipped when coincident with a corridor bound (either distance within 0.4% of the view span): one sky-blue line instead of two overlapping.
    const span = spanOf(view)
    const coincidentWithCorridor =
      Math.abs(session.incident.startMs - session.queryRange.start) < span * 0.004 ||
      Math.abs(session.incident.startMs - session.queryRange.end) < span * 0.004
    incidentLine.style.display = view.showIncidentMark && !coincidentWithCorridor ? '' : 'none'
    bookmarkGroup.replaceChildren()
    if (view.showBookmarks) {
      for (const entry of session.marks) {
        if (entry.mark.kind !== 'bookmark') continue
        const flag = elt('span', 'et-bookmarkFlag')
        flag.style.left = pct(timeToFraction(entry.t, view))
        if (entry.mark.color !== undefined) flag.style.background = entry.mark.color
        bookmarkGroup.appendChild(flag)
      }
    }
  }

  function markerAria(entry: NormalizedEvent, off: number): string {
    const L = labelsValue
    const time = formatTimeMs(entry.t, off)
    return entry.event.provider !== undefined
      ? fill(L.markerLabelFull, { time, provider: entry.event.provider })
      : fill(L.markerLabel, { time })
  }

  function renderMarkers(off: number): void {
    session.lanes.forEach((lane, i) => {
      const strip = laneStrips[i]
      if (strip === undefined) return
      strip.replaceChildren()
      if (view.hiddenLanes.includes(lane.id)) return
      for (const cluster of clusters) {
        if (cluster.lane !== lane.id) continue
        const left = pct(timeToFraction((cluster.t0 + cluster.t1) / 2, view))
        if (cluster.members.length === 1) {
          const entry = cluster.anchor
          const b = elt('button', 'et-marker')
          b.type = 'button'
          b.dataset.action = 'select-event'
          b.dataset.arg = entry.event.id
          b.style.left = left
          b.setAttribute('aria-label', markerAria(entry, off))
          b.innerHTML = '<span class="et-markerDiamond"></span>'
          if (view.selectedId === entry.event.id) b.dataset.selected = 'true'
          strip.appendChild(b)
        } else {
          const b = elt('button', 'et-clusterPill')
          b.type = 'button'
          b.dataset.action = 'zoom-cluster'
          b.dataset.arg = cluster.id
          b.style.left = left
          b.setAttribute('aria-label', fill(labelsValue.clusterLabel, { count: cluster.members.length }))
          // Display convention of the reference application: clusters of four or more
          // events carry a `+` prefix, smaller ones show the plain count.
          const size = cluster.members.length
          b.innerHTML = `${icon('diamond')}<span>${size >= 4 ? `+${size}` : String(size)}</span>`
          strip.appendChild(b)
        }
      }
    })
  }

  function renderPlayhead(off: number): void {
    const fraction = timeToFraction(view.playhead, view)
    playLine.style.left = pct(fraction)
    playGlow.style.left = pct(fraction)
    playChip.style.setProperty('--px', pct(fraction))
    playChip.textContent = formatTimeMs(view.playhead, off)
  }

  function detailRow(label: string, value: HTMLElement): HTMLDivElement {
    const row = elt('div', 'et-drow')
    const labelNode = elt('span', 'et-dlabel')
    labelNode.textContent = label
    row.append(labelNode, value)
    return row
  }

  function textValue(text: string | undefined, L: Labels): HTMLElement {
    const value = elt('span', 'et-dvalue')
    value.textContent = text === undefined || text === '' ? L.dash : text
    return value
  }

  function renderDetails(): void {
    const L = labelsValue
    const off = session.incident.offset
    detBody.replaceChildren()
    const selected = view.selectedId
      ? (session.events.find((e) => e.event.id === view.selectedId) ?? null)
      : null
    tabDetails.setAttribute('aria-selected', view.tab === 'details' ? 'true' : 'false')
    tabXml.setAttribute('aria-selected', view.tab === 'xml' ? 'true' : 'false')
    if (selected === null) {
      const hint = elt('div', 'et-hint')
      hint.textContent = L.noSelection
      detBody.appendChild(hint)
      copyBtn.style.display = 'none'
      return
    }
    copyBtn.style.display = ''
    const ev = selected.event
    if (view.tab === 'xml') {
      const pre = elt('pre', 'et-xmlPre')
      pre.textContent = ev.xml ?? buildEventXml(ev, rawSession)
      detBody.appendChild(pre)
      return
    }
    detBody.appendChild(detailRow(L.provider, textValue(ev.provider, L)))
    detBody.appendChild(
      detailRow(L.eventIdLabel, textValue(ev.eventId === undefined ? undefined : String(ev.eventId), L)),
    )
    const levelValue = elt('span', 'et-dvalue')
    if (ev.level !== undefined) {
      const dot = elt('span', 'et-levelDot')
      dot.style.background = LEVEL_VAR[ev.level]
      levelValue.append(dot, document.createTextNode(L[LEVEL_KEYS[ev.level]]))
    } else {
      levelValue.textContent = L.dash
    }
    detBody.appendChild(detailRow(L.levelLabel, levelValue))
    detBody.appendChild(detailRow(L.dateLabel, textValue(formatDateTime(selected.t, off, { time: false }), L)))
    detBody.appendChild(
      detailRow(L.timeLabel, textValue(`${formatTimeMs(selected.t, off)} ${session.incident.offsetLabel}`, L)),
    )
    detBody.appendChild(detailRow(L.channel, textValue(ev.channel, L)))
    if (ev.category !== undefined) {
      const catValue = elt('span', 'et-dvalue')
      catValue.textContent = ev.category.label
      if (ev.category.id !== undefined) {
        const sub = elt('span', 'et-dsub')
        sub.textContent = ev.category.id
        catValue.appendChild(sub)
      }
      if (ev.category.note !== undefined) {
        const sub = elt('span', 'et-dsub')
        sub.textContent = ev.category.note
        catValue.appendChild(sub)
      }
      detBody.appendChild(detailRow(L.category, catValue))
    }
    detBody.appendChild(detailRow(L.computer, textValue(ev.computer, L)))
    detBody.appendChild(detailRow(L.origin, textValue(ev.origin, L)))
    detBody.appendChild(
      detailRow(L.processId, textValue(ev.processId === undefined ? undefined : String(ev.processId), L)),
    )
    detBody.appendChild(
      detailRow(L.threadId, textValue(ev.threadId === undefined ? undefined : String(ev.threadId), L)),
    )
    const laneLane = session.lanes.find((l) => l.id === ev.lane)
    const laneValue = elt('span', 'et-dvalue')
    const pill = elt('span', 'et-lanePill')
    pill.textContent = laneLane !== undefined ? laneLane.label : ev.lane
    if (laneLane !== undefined) pill.style.setProperty('--et-lane-color', laneLane.color)
    laneValue.appendChild(pill)
    detBody.appendChild(detailRow(L.lane, laneValue))
    const dataEntries = Object.entries(ev.data ?? {})
    if (dataEntries.length > 0 || ev.markNote !== undefined) {
      const dataValue = elt('span', 'et-dvalue')
      for (const [key, value] of dataEntries) {
        const line = elt('span', 'et-dsub')
        line.style.color = 'var(--et-ink)'
        line.textContent = `${key}: ${value}`
        dataValue.appendChild(line)
      }
      if (ev.markNote !== undefined) {
        const note = elt('span', 'et-dsub')
        note.textContent = ev.markNote
        note.title = L.markerNote
        dataValue.appendChild(note)
      }
      detBody.appendChild(detailRow(L.structuredData, dataValue))
    }
  }

  /* ---------- state helpers ---------- */

  function dispatch(name: string, detail: unknown): void {
    root.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
  }

  function dispatchAction(action: string): void {
    dispatch('timeline-action', { action })
    opts.onAction?.(action)
  }

  function snapshotView(): TimelineView {
    return {
      ...view,
      hiddenLanes: [...view.hiddenLanes],
      levels: [...view.levels],
      collapsed: { ...view.collapsed },
    }
  }

  function notifyView(): void {
    opts.onViewChange?.(snapshotView())
    dispatch('view-change', { view: snapshotView() })
  }

  function applyView(patch: Partial<TimelineView>, notify = true, light = false): void {
    view = { ...view, ...patch }
    if (light) renderPlayhead(session.incident.offset)
    else render()
    if (notify) notifyView()
  }

  function loadSession(): void {
    session = normalizeSession(rawSession)
    buildLaneStructure()
    const selectedGone = view.selectedId !== null && !session.events.some((e) => e.event.id === view.selectedId)
    if (selectedGone) view = { ...view, selectedId: null }
    view = {
      ...view,
      hiddenLanes: view.hiddenLanes.filter((id) => session.lanes.some((l) => l.id === id)),
    }
    filtersOpen = false
    render()
  }

  function currentRawSession(): TimelineSession {
    return opts.session ?? PRESETS[opts.preset ?? 'reference-session'] ?? referenceSession
  }

  /* ---------- actions ---------- */

  function runAction(action: string, arg: string | undefined): void {
    switch (action) {
      case 'menu':
      case 'open-evtx':
      case 'new-incident':
      case 'save-incident':
      case 'close-incident':
      case 'minimize':
      case 'maximize':
      case 'close':
      case 'pick-incident-start':
      case 'pick-incident-end':
        dispatchAction(action)
        return
      case 'pick-start':
        startField.focus()
        return
      case 'pick-end':
        endField.focus()
        return
      case 'apply-corridor':
        applyCorridor()
        return
      case 'toggle-context':
        applyView({ collapsed: { ...view.collapsed, context: !view.collapsed.context } })
        return
      case 'toggle-details':
        applyView({ collapsed: { ...view.collapsed, details: !view.collapsed.details } })
        return
      case 'toggle-incident-mark':
        applyView({ showIncidentMark: !view.showIncidentMark })
        return
      case 'toggle-bookmarks':
        applyView({ showBookmarks: !view.showBookmarks })
        return
      case 'toggle-level': {
        const level = (arg ?? '') as Level
        const levels = view.levels.includes(level)
          ? view.levels.filter((l) => l !== level)
          : [...view.levels, level]
        applyView({ levels })
        return
      }
      case 'toggle-lane': {
        const laneId = arg ?? ''
        const hiddenLanes = view.hiddenLanes.includes(laneId)
          ? view.hiddenLanes.filter((id) => id !== laneId)
          : [...view.hiddenLanes, laneId]
        applyView({ hiddenLanes })
        return
      }
      case 'toggle-loaded-only':
        applyView({ loadedOnly: !view.loadedOnly })
        return
      case 'reset-filters':
        applyView({
          hiddenLanes: [],
          levels: [],
          query: '',
          loadedOnly: true,
          showIncidentMark: true,
          showBookmarks: true,
        })
        closeFilters()
        return
      case 'set-span':
        applySpan(arg ?? '')
        return
      case 'fit':
        applyView({ start: session.queryRange.start, end: session.queryRange.end })
        return
      case 'zoom-out':
        applyView(zoomAround(view, 2, view.playhead))
        return
      case 'zoom-in':
        applyView(zoomAround(view, 0.5, view.playhead))
        return
      case 'toggle-filters':
        if (filtersOpen) closeFilters()
        else openFilters()
        return
      case 'set-tab':
        applyView({ tab: arg === 'xml' ? 'xml' : 'details' })
        return
      case 'copy-structured':
        void copyStructured()
        return
      case 'select-event':
        selectEvent(arg ?? null)
        return
      case 'zoom-cluster':
        zoomToCluster(arg ?? '')
        return
      default:
        return
    }
  }

  function openFilters(): void {
    filtersOpen = true
    filtersBtn.setAttribute('aria-expanded', 'true')
    popover.dataset.open = 'true'
  }

  function closeFilters(): void {
    filtersOpen = false
    filtersBtn.setAttribute('aria-expanded', 'false')
    popover.dataset.open = 'false'
  }

  function applySpan(id: string): void {
    const chip = SPAN_CHIPS.find((c) => c.id === id)
    if (chip === undefined) return
    const frac = timeToFraction(view.playhead, view)
    const start = view.playhead - frac * chip.ms
    applyView({ start, end: start + chip.ms })
  }

  function applyCorridor(): void {
    const off = session.incident.offset
    const start = parseWallClock(startField.value, off)
    const end = parseWallClock(endField.value, off)
    if (start === null || end === null || end <= start) {
      syncFieldValue(startField, formatDateTime(session.queryRange.start, off))
      syncFieldValue(endField, formatDateTime(session.queryRange.end, off))
      return
    }
    session = { ...session, queryRange: { start, end } }
    applyView({ start, end })
    dispatchAction('apply-corridor')
  }

  function selectEvent(id: string | null): void {
    const hadFocus = root.contains(document.activeElement)
    if (id !== null && id === view.selectedId) id = null
    const entry = id !== null ? (session.events.find((e) => e.event.id === id) ?? null) : null
    applyView({
      selectedId: entry !== null ? entry.event.id : null,
      playhead: entry !== null ? entry.t : view.playhead,
    })
    opts.onSelect?.(entry !== null ? entry.event : null)
    dispatch('event-select', { event: entry !== null ? entry.event : null })
    if (hadFocus && entry !== null) {
      const marker = canvasHost.querySelector<HTMLElement>(`[data-arg="${entry.event.id}"]`)
      marker?.focus({ preventScroll: true })
    }
  }

  function zoomToCluster(id: string): void {
    const cluster = clusters.find((c) => c.id === id)
    if (cluster === undefined) return
    if (cluster.members.length === 1) {
      selectEvent(cluster.anchor.event.id)
      return
    }
    const gaps: number[] = []
    for (let i = 1; i < cluster.members.length; i++) {
      gaps.push(cluster.members[i].t - cluster.members[i - 1].t)
    }
    const minGap = Math.min(...gaps)
    if (minGap <= 0) {
      selectEvent(cluster.anchor.event.id)
      return
    }
    const width = canvasHost.clientWidth
    if (width <= 0) return
    const threshold = opts.clusterThresholdPx ?? DEFAULT_THRESHOLD_PX
    const span = clampSpan((minGap * width) / (threshold * 1.5))
    const anchor = (cluster.t0 + cluster.t1) / 2
    const frac = timeToFraction(anchor, view)
    const start = anchor - frac * span
    applyView({ start, end: start + span })
  }

  async function copyStructured(): Promise<void> {
    const selected = view.selectedId
      ? (session.events.find((e) => e.event.id === view.selectedId) ?? null)
      : null
    if (selected === null) return
    const L = labelsValue
    const dataEntries = Object.entries(selected.event.data ?? {})
    let text: string
    if (dataEntries.length > 0) {
      text = dataEntries.map(([key, value]) => `${key}: ${value}`).join('\n')
    } else {
      const off = session.incident.offset
      text = [
        `${L.provider}: ${selected.event.provider ?? L.dash}`,
        `${L.eventIdLabel}: ${selected.event.eventId ?? L.dash}`,
        `${L.dateLabel}: ${formatDateTime(selected.t, off, { time: false })}`,
        `${L.timeLabel}: ${formatTimeMs(selected.t, off)}`,
      ].join('\n')
    }
    let copied = false
    try {
      if (navigator.clipboard !== undefined) {
        await navigator.clipboard.writeText(text)
        copied = true
      }
    } catch {
      copied = false
    }
    if (!copied) {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'true')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try {
        copied = document.execCommand('copy')
      } catch {
        copied = false
      }
      area.remove()
    }
    if (copied) {
      copyLabel.textContent = L.copied
      if (copyTimer !== undefined) clearTimeout(copyTimer)
      copyTimer = window.setTimeout(() => {
        copyLabel.textContent = labelsValue.copyStructured
        copyTimer = undefined
      }, 1600)
    }
  }

  /* ---------- play animation ---------- */

  function togglePlay(): void {
    if (playing) {
      stopPlay()
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyView({ playhead: session.queryRange.end })
      return
    }
    playFrom =
      view.playhead >= session.queryRange.start && view.playhead < session.queryRange.end
        ? view.playhead
        : session.queryRange.start
    playTo = session.queryRange.end
    if (playTo <= playFrom) return
    playing = true
    playDuration = Math.min(12_000, Math.max(3_000, (playTo - playFrom) / 40))
    playStartWall = performance.now()
    rafId = requestAnimationFrame(stepPlay)
  }

  function stepPlay(now: number): void {
    if (!playing || destroyed) return
    const k = Math.min(1, (now - playStartWall) / playDuration)
    applyView({ playhead: playFrom + (playTo - playFrom) * k }, false, true)
    if (k >= 1) {
      playing = false
      applyView({})
      return
    }
    rafId = requestAnimationFrame(stepPlay)
  }

  function stopPlay(): void {
    playing = false
    cancelAnimationFrame(rafId)
    applyView({})
  }

  /* ---------- canvas interactions ---------- */

  function dragTo(clientX: number): void {
    const rect = canvasHost.getBoundingClientRect()
    if (rect.width <= 0) return
    const frac = (clientX - rect.left) / rect.width
    applyView({ playhead: fractionToTime(frac, view) }, false, true)
  }

  function onCanvasPointerDown(ev: PointerEvent): void {
    if (opts.interactive === false || destroyed || ev.button !== 0) return
    const target = ev.target instanceof Element ? ev.target : null
    if (target !== null && target.closest('button') !== null) return
    dragging = true
    try {
      canvasHost.setPointerCapture(ev.pointerId)
    } catch {
      dragging = false
      return
    }
    dragTo(ev.clientX)
    ev.preventDefault()
  }

  function onCanvasPointerMove(ev: PointerEvent): void {
    if (!dragging) return
    dragTo(ev.clientX)
  }

  function onCanvasPointerUp(ev: PointerEvent): void {
    if (!dragging) return
    dragging = false
    try {
      canvasHost.releasePointerCapture(ev.pointerId)
    } catch {
      /* pointer already released */
    }
    applyView({})
  }

  function onCanvasWheel(ev: WheelEvent): void {
    if (opts.interactive === false || destroyed) return
    ev.preventDefault()
    if (ev.ctrlKey) {
      const rect = canvasHost.getBoundingClientRect()
      const frac = (ev.clientX - rect.left) / Math.max(1, rect.width)
      const anchor = fractionToTime(frac, view)
      applyView(zoomAround(view, Math.exp(ev.deltaY * 0.0015), anchor))
    } else {
      const delta = (Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY) * spanOf(view) * 0.002
      applyView(panWindow(view, delta))
    }
  }

  function movePlayhead(deltaMs: number): void {
    const playhead = view.playhead + deltaMs
    const shifted = keepPlayheadVisible({ ...view, playhead })
    applyView(shifted !== null ? { playhead, ...shifted } : { playhead })
  }

  function movePlayheadTo(time: number): void {
    const shifted = keepPlayheadVisible({ ...view, playhead: time })
    applyView(shifted !== null ? { playhead: time, ...shifted } : { playhead: time })
  }

  function onCanvasKeyDown(ev: KeyboardEvent): void {
    if (opts.interactive === false || destroyed || ev.altKey) return
    if (ev.target !== canvasHost) return // let focused child buttons keep their own keys
    const step = ev.shiftKey ? 10_000 : 1_000
    switch (ev.key) {
      case 'ArrowLeft':
        movePlayhead(-step)
        break
      case 'ArrowRight':
        movePlayhead(step)
        break
      case 'PageUp':
        applyView(panWindow(view, -spanOf(view) / 2))
        break
      case 'PageDown':
        applyView(panWindow(view, spanOf(view) / 2))
        break
      case '+':
      case '=':
        applyView(zoomAround(view, 0.5, view.playhead))
        break
      case '-':
      case '_':
        applyView(zoomAround(view, 2, view.playhead))
        break
      case 'Home':
        movePlayheadTo(session.queryRange.start)
        break
      case 'End':
        movePlayheadTo(session.queryRange.end)
        break
      case ' ':
      case 'Spacebar':
        togglePlay()
        break
      default:
        return
    }
    ev.preventDefault()
  }

  /* ---------- listeners ---------- */

  function onRootClick(ev: MouseEvent): void {
    // `interactive` defaults to ON: only an explicit `false` disables input.
    if (opts.interactive === false || destroyed) return
    const target = ev.target instanceof Element ? ev.target : null
    if (target === null) return
    const actionEl = target.closest<HTMLElement>('[data-action]')
    if (actionEl !== null) {
      runAction(actionEl.dataset.action ?? '', actionEl.dataset.arg)
      return
    }
    if (filtersOpen && target.closest('.et-popover') === null && target.closest('.et-filtersWrap') === null) {
      closeFilters()
    }
  }

  function onDocumentPointerDown(ev: PointerEvent): void {
    if (!filtersOpen || destroyed) return
    const target = ev.target instanceof Element ? ev.target : null
    if (target === null) return
    if (!root.contains(target)) closeFilters()
  }

  function onRootKeyDown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && filtersOpen) closeFilters()
  }

  function onFieldKeyDown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter') applyCorridor()
  }

  function attachInteractive(): void {
    if (interactiveAttached || destroyed) return
    interactiveAttached = true
    root.addEventListener('click', onRootClick)
    root.addEventListener('keydown', onRootKeyDown)
    canvasHost.addEventListener('pointerdown', onCanvasPointerDown)
    canvasHost.addEventListener('pointermove', onCanvasPointerMove)
    canvasHost.addEventListener('pointerup', onCanvasPointerUp)
    canvasHost.addEventListener('pointercancel', onCanvasPointerUp)
    canvasHost.addEventListener('wheel', onCanvasWheel, { passive: false })
    canvasHost.addEventListener('keydown', onCanvasKeyDown)
    startField.addEventListener('keydown', onFieldKeyDown)
    endField.addEventListener('keydown', onFieldKeyDown)
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
  }

  function detachInteractive(): void {
    if (!interactiveAttached) return
    interactiveAttached = false
    root.removeEventListener('click', onRootClick)
    root.removeEventListener('keydown', onRootKeyDown)
    canvasHost.removeEventListener('pointerdown', onCanvasPointerDown)
    canvasHost.removeEventListener('pointermove', onCanvasPointerMove)
    canvasHost.removeEventListener('pointerup', onCanvasPointerUp)
    canvasHost.removeEventListener('pointercancel', onCanvasPointerUp)
    canvasHost.removeEventListener('wheel', onCanvasWheel)
    canvasHost.removeEventListener('keydown', onCanvasKeyDown)
    startField.removeEventListener('keydown', onFieldKeyDown)
    endField.removeEventListener('keydown', onFieldKeyDown)
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  }

  const resizeObserver = new ResizeObserver(() => {
    if (!destroyed) render()
  })
  resizeObserver.observe(canvasHost)

  /* ---------- boot ---------- */

  labelsValue = resolveLabels()
  rawSession = currentRawSession()
  session = normalizeSession(rawSession)
  view = initView(session)
  buildLaneStructure()
  if (opts.interactive !== false) attachInteractive()
  render()

  return {
    update(next: TimelineSession): void {
      if (destroyed) return
      opts = { ...opts, session: next }
      rawSession = next
      loadSession()
    },
    updateOptions(patch: Partial<TimelineOptions>): void {
      if (destroyed) return
      const prevRaw = rawSession
      opts = { ...opts, ...definedEntries(patch) }
      labelsValue = resolveLabels()
      rawSession = currentRawSession()
      if (rawSession !== prevRaw) loadSession()
      else applyLabels()
      if (opts.interactive === false) detachInteractive()
      else attachInteractive()
      render()
    },
    getView: () => snapshotView(),
    setView(patch: Partial<TimelineView>): void {
      if (destroyed) return
      const merged = { ...view, ...patch }
      if (!(merged.end > merged.start)) return
      view = merged
      render()
      notifyView()
    },
    destroy(): void {
      if (destroyed) return
      destroyed = true
      playing = false
      cancelAnimationFrame(rafId)
      if (copyTimer !== undefined) clearTimeout(copyTimer)
      resizeObserver.disconnect()
      detachInteractive()
      if (lightDom) {
        host.classList.remove('et-scope')
        root.remove()
      } else if (shadow !== null) {
        shadow.replaceChildren()
      }
    },
    get root(): HTMLElement {
      return root
    },
  }
}

function definedEntries<T extends object>(patch: Partial<T>): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) out[key as keyof T] = value as T[keyof T]
  }
  return out
}
