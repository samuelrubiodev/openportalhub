// Offset-aware time helpers. Pure functions, no DOM, no globals.

export interface WallClock {
  year: number
  /** 1-based month (1 = January). */
  month: number
  day: number
  hour: number
  minute: number
  second: number
  ms: number
}

export interface DateTimeOptions {
  /** Include the `YYYY-MM-DD` part (default true). */
  date?: boolean
  /** Include the `HH:MM[:SS[.mmm]]` part (default true). */
  time?: boolean
  /** Include `:SS` (default true). */
  seconds?: boolean
  /** Include `.mmm` (default false). */
  ms?: boolean
}

const pad2 = (n: number): string => String(n).padStart(2, '0')
const pad3 = (n: number): string => String(n).padStart(3, '0')

/** Parses an ISO 8601 instant (offset required for correctness); returns epoch ms, or NaN when invalid. */
export function parseTime(iso: string): number {
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? NaN : ms
}

/** Splits an epoch instant into wall-clock parts at the given offset (minutes east of UTC). */
export function wallClock(ms: number, offsetMinutes: number): WallClock {
  const d = new Date(ms + offsetMinutes * 60000)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
  }
}

/** Formats `YYYY-MM-DD HH:MM[:SS[.mmm]]` in wall-clock time at the given offset. */
export function formatDateTime(ms: number, offsetMinutes: number, opts: DateTimeOptions = {}): string {
  const { date = true, time = true, seconds = true, ms: showMs = false } = opts
  const w = wallClock(ms, offsetMinutes)
  const timeText = `${pad2(w.hour)}:${pad2(w.minute)}${seconds ? `:${pad2(w.second)}` : ''}${showMs ? `.${pad3(w.ms)}` : ''}`
  const parts: string[] = []
  if (date) parts.push(`${w.year}-${pad2(w.month)}-${pad2(w.day)}`)
  if (time) parts.push(timeText)
  return parts.join(' ')
}

/** `HH:MM` wall-clock label, used for ruler ticks. */
export function formatClock(ms: number, offsetMinutes: number): string {
  return formatDateTime(ms, offsetMinutes, { date: false, seconds: false })
}

/** `HH:MM:SS.mmm` wall-clock label, used for the playhead chip and detail rows. */
export function formatTimeMs(ms: number, offsetMinutes: number): string {
  return formatDateTime(ms, offsetMinutes, { date: false, seconds: true, ms: true })
}

/** Compact human duration like `6m 46s`, `1h 05m`, `2d 03h`. */
export function formatDuration(ms: number): string {
  const total = Math.round(Math.abs(ms) / 1000)
  const sign = ms < 0 ? '-' : ''
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (days > 0) return `${sign}${days}d ${pad2(hours)}h`
  if (hours > 0) return `${sign}${hours}h ${pad2(minutes)}m`
  if (minutes > 0) return `${sign}${minutes}m ${pad2(seconds)}s`
  return `${sign}${seconds}s`
}

/** .NET round-trip style UTC stamp: `2026-09-24T17:56:56.0000000+00:00`. */
export function formatUtcDotNet(ms: number): string {
  const w = wallClock(ms, 0)
  return `${w.year}-${pad2(w.month)}-${pad2(w.day)}T${pad2(w.hour)}:${pad2(w.minute)}:${pad2(w.second)}.${pad3(w.ms)}0000+00:00`
}

/** Minutes since local midnight at the given offset (0–1439). */
export function minuteOfDay(ms: number, offsetMinutes: number): number {
  const w = wallClock(ms, offsetMinutes)
  return w.hour * 60 + w.minute
}

/** `UTC+02:00` style label from a minute offset. */
export function formatOffsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+'
  const abs = Math.abs(Math.round(offsetMinutes))
  return `UTC${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
}

/**
 * Parses `YYYY-MM-DD HH:MM[:SS[.mmm]]` as wall-clock time at the given offset.
 * Returns epoch ms, or null when the text does not match.
 */
export function parseWallClock(text: string, offsetMinutes: number): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?$/.exec(text.trim())
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const hour = Number(m[4])
  const minute = Number(m[5])
  const second = m[6] ? Number(m[6]) : 0
  const ms = m[7] ? Number(m[7].padEnd(3, '0')) : 0
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 60) return null
  const epoch = Date.UTC(year, month - 1, day, hour, minute, second, ms)
  if (wallClock(epoch, offsetMinutes).day !== day) return null // reject rollovers (Feb 30...)
  return epoch - offsetMinutes * 60000
}
