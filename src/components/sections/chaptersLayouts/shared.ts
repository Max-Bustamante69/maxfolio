import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useContent } from '../../../hooks'
import { timeline, WORK_KINDS, type WorkKind } from '../../../data/timeline'
import type { Skin } from '../../gallery'

export const EASE = [0.23, 1, 0.32, 1] as const

/** Up to 3 real, named things that touched a year — stores first (the most concrete build), then
 *  roles, then products. Identical rule to Chapters.tsx's own (moved here so the default rail and
 *  every `?proposal=chapters-*` direction read one definition instead of three copies). */
export function useHighlights() {
  const { strings, registry } = useContent()
  return useMemo(() => {
    const out = new Map<number, string[]>()
    for (const entry of timeline) {
      const items: string[] = []
      for (const s of entry.stores) {
        if (items.length >= 3) break
        items.push(s.name)
      }
      for (const p of entry.positions) {
        if (items.length >= 3) break
        items.push(`${strings.experience[p.id].title} · ${p.company}`)
      }
      for (const p of entry.products) {
        if (items.length >= 3) break
        items.push(p.name)
      }
      out.set(entry.year, items)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, strings])
}

/** Same fill/label maps the default rail and Years.tsx use for the per-year unit chart — one accent,
 *  four opacity strengths, so a block reads as "the same accent, this kind of work" everywhere it appears. */
export function useKindMaps(skin: Skin) {
  const { strings } = useContent()
  const y = strings.sections.years
  const kindFill: Record<WorkKind, string> = { stores: skin.accentBg, work: `${skin.accentBg} opacity-70`, products: `${skin.accentBg} opacity-45`, personal: `${skin.accentBg} opacity-25` }
  const kindLabel: Record<WorkKind, string> = { stores: y.shipped, work: y.work, products: y.products, personal: y.side }
  return { kindFill, kindLabel }
}

export const WORK_KIND_LIST = WORK_KINDS

/** Reads `?proposal=<target>-<id>` once on mount, the same param `?featured=` used before it — never
 *  re-read after mount (a URL edited mid-visit doesn't rewrite a mounted section), and absent by
 *  default so production renders exactly what it renders today. */
export function readProposal(target: string): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('proposal')
  if (!raw) return null
  const prefix = `${target}-`
  return raw.startsWith(prefix) ? raw.slice(prefix.length) : null
}

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
  }
  return [h, s * 100, l * 100]
}

/**
 * Per-year identity color, derived — never hand-picked — from the skin's own accent: parse the
 * accent's hex out of its Tailwind class, convert to HSL, and step the hue back by a fixed amount per
 * year of distance from the newest ("now" keeps the site's real accent color; each year further back
 * drifts a further, deterministic step). Saturation/lightness stay the skin's own, so every year still
 * reads as a variation of the same identity, not five arbitrary colors.
 */
export function yearAccentColor(skin: Skin, index: number, hueStep = 24): string {
  const match = skin.accent.match(/#([0-9a-fA-F]{3,6})/)
  const [h, s, l] = match ? hexToHsl(match[0]) : [210, 70, 50]
  const hue = ((h - index * hueStep) % 360 + 360) % 360
  return `hsl(${hue.toFixed(1)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`
}

function nearestPositionIndex(positions: number[], scrollLeft: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < positions.length; i++) {
    const d = Math.abs(positions[i] - scrollLeft)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

export interface ChaptersRailApi {
  railRef: RefObject<HTMLDivElement | null>
  cardRefs: RefObject<(HTMLElement | null)[]>
  positions: number[]
  active: number
  total: number
  goTo: (i: number) => void
}

/**
 * The default rail's own reachable-position + active-index machinery (Chapters.tsx's original
 * comments explain the "why" in full), extracted so every `?proposal=chapters-*` direction that keeps
 * a draggable rail (poster direction) reuses the exact same clamp-to-the-last-card fix instead of a
 * second copy that could drift from it.
 */
export function useChaptersRail(count: number): ChaptersRailApi {
  const reduced = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [positions, setPositions] = useState<number[]>(() => Array.from({ length: count }, (_, i) => i))
  const [active, setActive] = useState(0)
  const total = positions.length || count

  const measurePositions = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const centered = window.innerWidth < 768
    const railRect = rail.getBoundingClientRect()
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth)
    const raw = cardRefs.current.map((el) => {
      if (!el) return 0
      const base = el.getBoundingClientRect().left - railRect.left + rail.scrollLeft
      const target = centered ? base - (rail.clientWidth - el.offsetWidth) / 2 : base
      return Math.max(0, Math.min(max, target))
    })
    const deduped: number[] = []
    for (const t of raw) {
      const rounded = Math.round(t)
      const lastIdx = deduped.length - 1
      if (lastIdx < 0 || Math.abs(deduped[lastIdx] - rounded) >= 2) deduped.push(rounded)
    }
    setPositions(deduped)
  }, [])

  useLayoutEffect(() => {
    measurePositions()
    const rail = railRef.current
    if (!rail || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measurePositions())
    ro.observe(rail)
    return () => ro.disconnect()
  }, [measurePositions])

  useEffect(() => {
    const rail = railRef.current
    if (!rail || positions.length === 0) return
    let raf = 0
    const sync = () => {
      raf = 0
      setActive(nearestPositionIndex(positions, rail.scrollLeft))
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(sync)
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    sync()
    return () => {
      rail.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [positions])

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(total - 1, i))
      const target = positions[clamped]
      const rail = railRef.current
      if (target === undefined || !rail) return
      rail.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' })
    },
    [positions, total, reduced],
  )

  return { railRef, cardRefs, positions, active, total, goTo }
}
