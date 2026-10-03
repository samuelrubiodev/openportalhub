// Thin React wrapper. Only this file may import React. The widget mounts
// once into a single div and is then driven through updateOptions/update,
// so callback identity changes never remount it. useTimelineFit below is
// the measured draw policy for hosts that embed the widget in a sized hero.

import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type RefObject } from 'react'
import { mountTimeline } from './timeline'
import type { Density, Theme, TimelineEvent, TimelineInstance, TimelineSession } from './types'

export interface EventTimelineUIProps {
  lang?: 'es' | 'en'
  preset?: 'reference-session'
  session?: TimelineSession
  interactive?: boolean
  density?: Density
  theme?: Theme
  className?: string
  style?: CSSProperties
  onSelectEvent?: (event: TimelineEvent | null) => void
  onAction?: (action: string) => void
}

export default function EventTimelineUI(props: EventTimelineUIProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<TimelineInstance | null>(null)
  const latest = useRef(props)
  latest.current = props

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    const initial = latest.current
    const instance = mountTimeline(host, {
      lang: initial.lang,
      preset: initial.preset,
      session: initial.session,
      interactive: initial.interactive,
      density: initial.density,
      theme: initial.theme,
      onSelect: initial.onSelectEvent,
      onAction: initial.onAction,
    })
    instanceRef.current = instance
    return () => {
      instance.destroy()
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const instance = instanceRef.current
    if (instance === null) return
    const current = latest.current
    instance.updateOptions({
      lang: current.lang,
      preset: current.preset,
      interactive: current.interactive,
      density: current.density,
      theme: current.theme,
      onSelect: current.onSelectEvent,
      onAction: current.onAction,
    })
    if (current.session !== undefined) instance.update(current.session)
  })

  return <div ref={hostRef} className={props.className} style={props.style} />
}

/* Decides how a host draws the real Event Timeline window. Every decision is
   measured from the DOM — never viewport media queries: the widget's height
   follows its width (104.3em : 60.3em, base font 0.9586cqi clamped to
   [8.5px, 15px]), so the inline space measured around the widget box plus the
   room left in the hero decide between the interactive window at natural
   scale and the poster drawn at the 1377x796 reference size and scaled down. */

const REFERENCE_WIDTH = 1377   // container width that yields the shipped 13.2px base scale
const REFERENCE_HEIGHT = 796   // 60.3em at that base scale
const REFERENCE_BASE_FONT = 13.2
const BASE_FONT_RATIO = 0.9586 / 100  // 0.9586cqi, from src/styles.ts
const MIN_BASE_FONT = 8.5
const MAX_BASE_FONT = 15
const SAFETY_MARGIN = 16       // px of slack for footer/label wrapping before trusting the height

/* Without container-query units the widget falls back to a fixed 13.2px base
   (src/styles.ts), so its width does not track its container and the
   interactive branch would overflow. The poster pins the widget to the exact
   1377x796 reference box, which matches that fallback, so it stays correct. */
const SUPPORTS_CONTAINER_QUERIES =
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('container-type: inline-size')

export interface TimelineFit {
  interactive: boolean
  scale: number
}

export function useTimelineFit<H extends HTMLElement, C extends HTMLElement, B extends HTMLElement>(
  holderRef: RefObject<H | null>,
  columnRef: RefObject<C | null>,
  boxRef: RefObject<B | null>,
): TimelineFit | null {
  const [fit, setFit] = useState<TimelineFit | null>(null)
  const fitRef = useRef<TimelineFit | null>(null)

  useEffect(() => {
    const measure = () => {
      const column = columnRef.current
      const holder = holderRef.current
      if (column === null || holder === null) return
      const box = boxRef.current
      // The inline space is measured from the column, not from the box's
      // parent: the measured scale drives a host's framing box, so measuring
      // that framing box would feed the result back into its own measurement;
      // the column's width is set by the layout and is independent of the
      // widget.
      const availableWidth = column.clientWidth
      if (availableWidth === 0) return // first paint / hidden: keep the previous decision
      const style = getComputedStyle(holder)
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      // Everything in the column that is not the widget box: the caption and
      // its margin, a framing card's body and border. Measured, not assumed.
      // The box's laid-out height is the widget's rendered height, read from
      // its content box (clientHeight, not offsetHeight) so a host's 1px border
      // around the box stays part of the chrome instead of being handed to the
      // widget, and so the fit does not overflow the budget by that border.
      // clientHeight rather than getBoundingClientRect(): the poster wrapper's
      // layout height is transform-free, so it is stable across the scale
      // changes it feeds.
      const chrome = box === null
        ? column.clientHeight
        : Math.max(0, column.clientHeight - box.clientHeight)
      // The hero bounds the height itself only in its fixed-height desktop
      // branch. Every auto-height branch (mobile, and any viewport under 600px
      // tall) sets max-height: none, and there the hero's own declared
      // min-height (calc(100vh - 56px), so the topbar is already discounted)
      // is the budget: fitting the window inside it is what keeps the hero from
      // growing past the viewport. Budgeting the viewport directly would
      // re-introduce the topbar's height as scroll. Reading a CSS constant
      // instead of the holder's own height keeps the measure -> render ->
      // re-measure loop stable, because the holder's height depends on it.
      const declaredMinHeight = Number.parseFloat(style.minHeight)
      const heightBudget = style.maxHeight === 'none'
        ? (Number.isFinite(declaredMinHeight) ? declaredMinHeight : window.innerHeight)
        : holder.clientHeight
      const availableHeight = Math.max(0, heightBudget - padding - chrome)
      const baseFont = Math.min(MAX_BASE_FONT, Math.max(MIN_BASE_FONT, availableWidth * BASE_FONT_RATIO))
      const naturalHeight = REFERENCE_HEIGHT * (baseFont / REFERENCE_BASE_FONT)
      const interactive =
        SUPPORTS_CONTAINER_QUERIES &&
        availableWidth > MIN_BASE_FONT / BASE_FONT_RATIO &&
        naturalHeight + SAFETY_MARGIN <= availableHeight
      const scale = Math.min(1, availableWidth / REFERENCE_WIDTH, availableHeight / REFERENCE_HEIGHT)

      // Avoid redundant renders: keep the previous object when nothing moved.
      const previous = fitRef.current
      if (previous !== null && previous.interactive === interactive && Math.abs(scale - previous.scale) < 0.001) return
      const next: TimelineFit = { interactive, scale }
      fitRef.current = next
      setFit(next)
    }

    const observer = new ResizeObserver(measure)
    if (holderRef.current !== null) observer.observe(holderRef.current)
    if (columnRef.current !== null) observer.observe(columnRef.current)
    measure()
    return () => observer.disconnect()
  }, [holderRef, columnRef, boxRef])

  return fit
}
