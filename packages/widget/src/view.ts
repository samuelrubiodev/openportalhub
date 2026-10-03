// Pure view / cluster / tick math. No DOM, no globals — safe to unit test.

import { formatOffsetLabel, parseTime } from './format'
import type { Level, TimelineEvent, TimelineLane, TimelineMark, TimelineSession, TimelineView } from './types'

export const MIN_SPAN_MS = 10_000
export const MAX_SPAN_MS = 7 * 24 * 60 * 60 * 1000

export const SPAN_CHIPS: Array<{ id: '15m' | '1h' | '6h' | '24h'; ms: number }> = [
  { id: '15m', ms: 15 * 60_000 },
  { id: '1h', ms: 3_600_000 },
  { id: '6h', ms: 6 * 3_600_000 },
  { id: '24h', ms: 24 * 3_600_000 },
]

export interface NormalizedEvent {
  event: TimelineEvent
  t: number // epoch ms
  lane: string
}

export interface NormalizedMark {
  mark: TimelineMark
  t: number
}

export interface NormalizedIncident {
  name: string
  computer: string
  description: string
  note: string
  startMs: number
  endMs: number
  offset: number
  offsetLabel: string
}

export interface NormalizedSession {
  title: string
  subtitle: string
  incident: NormalizedIncident
  lanes: TimelineLane[]
  events: NormalizedEvent[]
  marks: NormalizedMark[]
  window: { start: number; end: number }
  queryRange: { start: number; end: number }
  statusLine: string | null
}

export interface EventCluster {
  id: string
  lane: string
  t0: number
  t1: number
  members: NormalizedEvent[]
  anchor: NormalizedEvent
}

function validRange(from: number, to: number): { start: number; end: number } | null {
  return Number.isFinite(from) && Number.isFinite(to) && to > from ? { start: from, end: to } : null
}

function padRange(range: { start: number; end: number }, ratio: number): { start: number; end: number } {
  const pad = (range.end - range.start) * ratio
  return { start: range.start - pad, end: range.end + pad }
}

/** Parses and sanity-checks a session; invalid timestamps drop out instead of crashing. */
export function normalizeSession(session: TimelineSession): NormalizedSession {
  const offset = session.incident.timezoneOffset
  const incidentStart = parseTime(session.incident.start)
  const incidentEnd = parseTime(session.incident.end)
  const incidentValid = Number.isFinite(incidentStart) && Number.isFinite(incidentEnd) && incidentEnd > incidentStart
  const qFrom = session.queryRange ? parseTime(session.queryRange.start) : NaN
  const qTo = session.queryRange ? parseTime(session.queryRange.end) : NaN
  const queryRange =
    validRange(qFrom, qTo) ?? (incidentValid ? { start: incidentStart, end: incidentEnd } : { start: 0, end: 360_000 })
  const wFrom = session.window ? parseTime(session.window.start) : NaN
  const wTo = session.window ? parseTime(session.window.end) : NaN
  const window = validRange(wFrom, wTo) ?? padRange(queryRange, 0.12)
  const events: NormalizedEvent[] = []
  for (const event of session.events) {
    const t = parseTime(event.time)
    if (Number.isFinite(t)) events.push({ event, t, lane: event.lane })
  }
  const marks: NormalizedMark[] = []
  for (const mark of session.marks ?? []) {
    const t = parseTime(mark.time)
    if (Number.isFinite(t)) marks.push({ mark, t })
  }
  return {
    title: session.title,
    subtitle: session.subtitle ?? '',
    incident: {
      name: session.incident.name,
      computer: session.incident.computer,
      description: session.incident.description ?? '',
      note: session.incident.note ?? '',
      startMs: incidentValid ? incidentStart : queryRange.start,
      endMs: incidentValid ? incidentEnd : queryRange.end,
      offset,
      offsetLabel: session.incident.timezoneLabel ?? formatOffsetLabel(offset),
    },
    lanes: session.lanes,
    events,
    marks,
    window,
    queryRange,
    statusLine: session.statusLine ?? null,
  }
}

/**
 * Initial view state. The event carrying a `markNote` plays the role of the
 * demo's pre-selected record: it starts selected and anchors the playhead,
 * matching the shipped application's opening frame.
 */
export function initView(session: NormalizedSession): TimelineView {
  const marked = session.events.find((e) => e.event.markNote !== undefined)
  return {
    start: session.window.start,
    end: session.window.end,
    playhead: marked ? marked.t : session.queryRange.start,
    selectedId: marked ? marked.event.id : null,
    hiddenLanes: [],
    levels: [],
    query: '',
    loadedOnly: true,
    showIncidentMark: true,
    showBookmarks: true,
    tab: 'details',
    collapsed: { context: false, details: false },
  }
}

export function spanOf(view: TimelineView): number {
  return Math.max(1, view.end - view.start)
}

export function clampSpan(span: number): number {
  return Math.min(MAX_SPAN_MS, Math.max(MIN_SPAN_MS, span))
}

/** Linear time → 0..1 fraction of the visible window. */
export function timeToFraction(t: number, view: TimelineView): number {
  return (t - view.start) / spanOf(view)
}

/** Inverse of `timeToFraction`. */
export function fractionToTime(fraction: number, view: TimelineView): number {
  return view.start + fraction * spanOf(view)
}

const STEP_LADDER_MS = [
  1_000, 2_000, 5_000, 10_000, 15_000, 30_000, 60_000, 120_000, 300_000, 600_000, 900_000, 1_800_000,
  3_600_000, 7_200_000, 10_800_000, 21_600_000, 43_200_000, 86_400_000, 172_800_000, 259_200_000,
  604_800_000, 1_209_600_000, 2_592_000_000,
]

function niceStep(span: number, targetTicks: number): number {
  for (const step of STEP_LADDER_MS) {
    if (span / step <= targetTicks) return step
  }
  return STEP_LADDER_MS[STEP_LADDER_MS.length - 1]
}

export interface TickSet {
  step: number
  majors: number[]
  minors: number[]
}

/** Nice-aligned major/minor tick times inside [start, end]. Labels are formatted by the caller. */
export function computeTicks(start: number, end: number, labelTarget = 3, minorTarget = 3): TickSet {
  const span = Math.max(1, end - start)
  const step = niceStep(span, labelTarget)
  const minorsStep = niceStep(step, minorTarget)
  const majors: number[] = []
  const minors: number[] = []
  const first = Math.ceil(start / step) * step
  const count = Math.min(400, Math.ceil((end - first) / step) + 1)
  for (let i = 0; i < count; i++) {
    const major = first + i * step
    if (major > end) break
    if (major >= start) majors.push(major)
  }
  // Minors run on their own ladder-aligned grid so every tick lands on a round
  // time; the first candidate sits one minor step before `start` so a
  // partially visible left-edge minor still renders. A minor never coincides
  // with a major.
  const lower = start - minorsStep
  let minor = Math.ceil(lower / minorsStep) * minorsStep
  while (minor < end && minors.length < 400) {
    if (minor > lower && !majors.includes(minor)) minors.push(minor)
    minor += minorsStep
  }
  return { step, majors, minors }
}

/** Case- and accent-insensitive normalization for search. */
export function searchNormalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** All searchable field values of an event, joined. */
export function searchableText(event: TimelineEvent): string {
  const parts: string[] = [
    event.provider ?? '',
    event.message ?? '',
    event.eventId === undefined ? '' : String(event.eventId),
    event.level ?? '',
    event.channel ?? '',
    event.category?.label ?? '',
    event.category?.id ?? '',
    event.computer ?? '',
    event.origin ?? '',
    event.processId === undefined ? '' : String(event.processId),
    event.threadId === undefined ? '' : String(event.threadId),
    event.markNote ?? '',
  ]
  for (const value of Object.values(event.data ?? {})) parts.push(value)
  return searchNormalize(parts.join('\n'))
}

/** Applies lane, level, query and loaded-corridor filters. Order follows the session. */
export function filterEvents(session: NormalizedSession, view: TimelineView): NormalizedEvent[] {
  const query = searchNormalize(view.query)
  return session.events.filter((entry) => {
    if (view.hiddenLanes.includes(entry.lane)) return false
    if (view.loadedOnly && (entry.t < session.queryRange.start || entry.t > session.queryRange.end)) return false
    if (view.levels.length > 0) {
      const level = entry.event.level
      if (!level || !view.levels.includes(level)) return false
    }
    if (query !== '' && !searchableText(entry.event).includes(query)) return false
    return true
  })
}

/**
 * Chain-clusters events per lane: consecutive markers closer than
 * `thresholdPx` collapse into one cluster. Singles stay count-1 clusters.
 */
export function clusterEvents(
  events: NormalizedEvent[],
  view: TimelineView,
  canvasWidth: number,
  thresholdPx: number,
): EventCluster[] {
  const pxPerMs = canvasWidth > 0 ? canvasWidth / spanOf(view) : 0
  const byLane = new Map<string, NormalizedEvent[]>()
  for (const entry of events) {
    const list = byLane.get(entry.lane)
    if (list) list.push(entry)
    else byLane.set(entry.lane, [entry])
  }
  const clusters: EventCluster[] = []
  for (const [lane, list] of byLane) {
    list.sort((a, b) => a.t - b.t)
    let run: NormalizedEvent[] = [list[0]]
    const flush = (): void => {
      clusters.push({
        id: `cluster:${run[0].event.id}`,
        lane,
        t0: run[0].t,
        t1: run[run.length - 1].t,
        members: run,
        anchor: run[0],
      })
    }
    for (let i = 1; i < list.length; i++) {
      const gapPx = (list[i].t - run[run.length - 1].t) * pxPerMs
      if (gapPx < thresholdPx) run.push(list[i])
      else {
        flush()
        run = [list[i]]
      }
    }
    flush()
  }
  return clusters
}

/** Smallest span chip whose duration covers the current window, or null above 24h. */
export function activeSpanChip(spanMs: number): '15m' | '1h' | '6h' | '24h' | null {
  for (const chip of SPAN_CHIPS) {
    if (chip.ms >= spanMs) return chip.id
  }
  return null
}

/** Zooms around an anchor instant, clamping the span to [10s, 7d]. */
export function zoomAround(
  view: TimelineView,
  factor: number,
  anchorMs: number,
): { start: number; end: number } {
  const span = clampSpan(spanOf(view) * factor)
  const frac = Math.min(1, Math.max(0, timeToFraction(anchorMs, view)))
  const start = anchorMs - frac * span
  return { start, end: start + span }
}

export function panWindow(view: TimelineView, deltaMs: number): { start: number; end: number } {
  return { start: view.start + deltaMs, end: view.end + deltaMs }
}

/** Nudges the window so the playhead stays inside, with a 5% margin. */
export function keepPlayheadVisible(view: TimelineView): { start: number; end: number } | null {
  const span = spanOf(view)
  const margin = span * 0.05
  if (view.playhead < view.start + margin) {
    const start = view.playhead - margin
    return { start, end: start + span }
  }
  if (view.playhead > view.end - margin) {
    const end = view.playhead + margin
    return { start: end - span, end }
  }
  return null
}

export function levelList(): Level[] {
  return ['critical', 'error', 'warning', 'information', 'verbose']
}
