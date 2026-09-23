import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent, useDragRail } from '../../hooks'
import { RevealText } from '../common'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { WORK_KINDS, timeline, workCount, workTotal, type WorkKind } from '../../data/timeline'

interface ChaptersProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

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

/** Up to 3 real, named things that touched a year — stores first (the most concrete build), then roles, then products. */
function useHighlights() {
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
  }, [registry, strings])
}

/**
 * "Chapters": the same per-year records as Years.tsx (registry-derived, nothing hand-typed), shown as
 * a horizontal scroll-snap rail of five year cards instead of an editorial list or a Gantt ribbon.
 * Every card is visible at rest — nothing here is gated behind whileInView — and a thin progress line
 * plus prev/next controls track which card is centered, driven by IntersectionObserver, not scroll math.
 */
export function Chapters({ skin, heading }: ChaptersProps) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const c = strings.sections.chapters
  const y = strings.sections.years
  const highlights = useHighlights()
  // Newest first: the current year is the most important card, the rail moves back in time.
  const years = [...timeline].reverse()
  const cardCount = years.length
  const [active, setActive] = useState(0)
  // Reachable rest positions — NOT one per card. Desktop shows several whole cards at once
  // (`lg:w-[calc((100%-2rem)/3.15)]`), so once the tail cards' own frame-line targets exceed the
  // rail's actual max scroll (`scrollWidth - clientWidth`), they all clamp to the SAME position —
  // the one where the last card's right edge sits flush with the frame's right edge. Counting one
  // position per card there would claim reachable positions (e.g. "5/5") that don't visually exist;
  // this list is the deduped, clamped set of positions the rail can really rest at. Mobile normally
  // keeps one position per card (each centers individually via `snap-center`).
  const [positions, setPositions] = useState<number[]>(() => years.map((_, i) => i))
  const total = positions.length || cardCount
  const railRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { handlers: dragHandlers, isDragging } = useDragRail(railRef, { centerSnapBelow: 768 })

  const kindFill: Record<WorkKind, string> = { stores: skin.accentBg, work: `${skin.accentBg} opacity-70`, products: `${skin.accentBg} opacity-45`, personal: `${skin.accentBg} opacity-25` }
  const kindLabel: Record<WorkKind, string> = { stores: y.shipped, work: y.work, products: y.products, personal: y.side }

  // Same viewport-relative measurement useDragRail's own `slideTargets` uses (see its note on why
  // never offsetLeft/offsetParent), plus the clamp+dedupe that turns raw per-card targets into the
  // actual reachable position list.
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

  // `active` tracks which entry of `positions` the rail currently rests nearest to — driven directly
  // by `scrollLeft`, not by IntersectionObserver ratios. Ratios were tried first and measured
  // unreliable here specifically because desktop shows ~3 cards at once: the card common to two
  // consecutive positions (e.g. card 2 of 5, visible in both "cards 1-3" and "cards 2-4") can sit at
  // ratio 1 in both, so a real position change sometimes crosses no observed threshold for THAT card
  // and the observer's last snapshot still picks it as "best" — landing `active` on the wrong
  // (already-passed) position after a prev/next click. Reading `scrollLeft` against the known
  // `positions` list has no such ambiguity: whatever the rail is doing (drag, flick, native touch
  // scroll, or a `goTo` smooth-scroll), the nearest position to the CURRENT scroll offset is always
  // the unambiguous right answer, including mid-gesture.
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

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(total - 1, i))
    const target = positions[clamped]
    const rail = railRef.current
    if (target === undefined || !rail) return
    rail.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section id="chapters" className="scroll-mt-20">
      {heading(c.eyebrow, c.title, c.titleAccent, c.lead)}

      <div className="mb-5 flex items-center gap-4">
        <div className={`h-0.5 flex-1 overflow-hidden rounded-full ${skin.dark ? 'bg-white/15' : 'bg-black/10'}`} role="progressbar" aria-valuenow={active + 1} aria-valuemin={1} aria-valuemax={total} aria-label={c.eyebrow}>
          <m.div className={`h-full rounded-full ${skin.accentBg}`} animate={{ width: `${((active + 1) / total) * 100}%` }} transition={{ duration: reduced ? 0 : 0.4, ease: EASE }} />
        </div>
        <p className={`shrink-0 text-xs font-medium tabular-nums ${skin.muted}`}>{c.chapterOf.replace('{n}', String(active + 1)).replace('{total}', String(total))}</p>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label={c.prevAria}
            className={`compact-touch press flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active === total - 1}
            aria-label={c.nextAria}
            className={`compact-touch press flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        data-dd-component="chapters-rail"
        data-dragging={isDragging}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            goTo(active + 1)
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            goTo(active - 1)
          }
        }}
        {...dragHandlers}
        tabIndex={0}
        role="group"
        aria-label={c.eyebrow}
        className="drag-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 outline-none no-scrollbar"
      >
        {years.map((entry, i) => {
          const filled = WORK_KINDS.flatMap((k) => Array.from({ length: workCount(entry, k) }, (_, u) => ({ k, u })))
          const items = highlights.get(entry.year) ?? []
          return (
            <div
              key={entry.year}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              data-idx={i}
              className={`w-[80%] shrink-0 snap-center rounded-[22px] border p-6 md:w-[46%] md:snap-start md:p-8 lg:w-[calc((100%-2rem)/3.15)] ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
            >
              <p className={`${skin.headingFont} text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums md:text-7xl`}>
                <RevealText text={String(entry.year)} trigger="load" />
              </p>
              {y.eras[String(entry.year)] && <p className={`${skin.accent} mt-2 text-sm font-medium`}>{y.eras[String(entry.year)]}</p>}

              {/* Mini unit chart: same real counts as Years.tsx, one block per shipped thing, capped visually at the busiest year's total so bar length is comparable card to card. */}
              <div
                className="mt-5 flex h-2.5 flex-wrap content-start gap-[2px]"
                role="img"
                aria-label={`${workTotal(entry)} ${y.perYear}: ${WORK_KINDS.filter((k) => workCount(entry, k) > 0)
                  .map((k) => `${kindLabel[k]} ${workCount(entry, k)}`)
                  .join(', ')}`}
              >
                {filled.length > 0 ? (
                  filled.map(({ k, u }) => <span key={`${k}-${u}`} className={`inline-block h-2.5 w-1 shrink-0 rounded-[1px] ${kindFill[k]}`} />)
                ) : (
                  <span className={`text-xs ${skin.muted}`}>—</span>
                )}
              </div>

              {items.length > 0 && (
                <div className="mt-5">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${skin.muted}`}>{c.highlightsLabel}</p>
                  <ul className="mt-2 space-y-1">
                    {items.map((h) => (
                      <li key={h} className="text-sm leading-snug">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
