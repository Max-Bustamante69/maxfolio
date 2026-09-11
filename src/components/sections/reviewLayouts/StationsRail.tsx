// Direction D — "stations rail" (axis: journey). The seven groups become seven stations on one
// horizontal route, in the order a run actually visits them: a route line connects the cards, and a
// dot on each lights up in sequence (~500ms apart) as the run "arrives" — no fake per-item results,
// just the fact that the run reached that station. The rail itself is draggable (useDragRail, the
// same mouse-drag-with-inertia + snap every other rail in this codebase uses) so the owner can also
// explore it by hand, independent of the auto-arriving sequence.
import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { useDragRail } from '../../../hooks'
import { EASE, ICON_PATHS, type ReviewData } from './types'

/** One station lights every 500ms once the run starts — the task's own pacing for this direction. */
const STATION_MS = 500

export function StationsRail({ data }: { data: ReviewData }) {
  const { skin, rc, reduced, started } = data
  const total = rc.groups.length
  const [arrived, setArrived] = useState(reduced ? total : 0)
  const [active, setActive] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { handlers, isDragging } = useDragRail(railRef, { centerSnapBelow: 768 })

  // Sequential arrival, one station every STATION_MS, once the section is visible.
  useEffect(() => {
    if (reduced) {
      setArrived(total)
      return
    }
    if (!started || arrived >= total) return
    const t = setTimeout(() => setArrived((s) => Math.min(total, s + 1)), STATION_MS)
    return () => clearTimeout(t)
  }, [started, arrived, reduced, total])

  // Which station is centered, for the counter and the arrow buttons — same IntersectionObserver
  // pattern the storyboard rail uses, independent of the auto-arriving sequence above.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ratios = new Map<number, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.idx)
          ratios.set(idx, Math.round(entry.intersectionRatio * 100) / 100)
        }
        let best = 0
        let bestRatio = 0
        ratios.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = idx
          }
        })
        if (bestRatio > 0) setActive(best)
      },
      { root: rail, threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(total - 1, i))
    const el = cardRefs.current[clamped]
    const rail = railRef.current
    if (!el || !rail) return
    const left = el.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft
    rail.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className={`border-t pt-8 ${skin.line}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className={`text-xs leading-relaxed ${skin.muted}`}>{rc.runCaption}</p>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous station" className={`compact-touch press flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === total - 1} aria-label="Next station" className={`compact-touch press flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Route line, filled up to the last station the run has arrived at. */}
      <div className={`mb-3 h-0.5 overflow-hidden rounded-full ${skin.dark ? 'bg-white/15' : 'bg-black/10'}`} role="progressbar" aria-valuenow={arrived} aria-valuemin={0} aria-valuemax={total} aria-label={rc.eyebrow}>
        <m.div className={`h-full rounded-full ${skin.accentBg}`} animate={{ width: `${(arrived / total) * 100}%` }} transition={{ duration: reduced ? 0 : 0.3, ease: EASE }} />
      </div>

      <div
        ref={railRef}
        data-dragging={isDragging}
        {...handlers}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            goTo(active + 1)
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            goTo(active - 1)
          }
        }}
        tabIndex={0}
        role="group"
        aria-label={rc.eyebrow}
        className="drag-rail -mx-4 flex snap-x snap-mandatory gap-[15px] overflow-x-auto px-4 pb-3 outline-none no-scrollbar"
      >
        {rc.groups.map((group, gi) => {
          const lit = gi < arrived
          return (
            <div
              key={group.label}
              ref={(el) => {
                cardRefs.current[gi] = el
              }}
              data-idx={gi}
              className={`w-[78%] shrink-0 snap-center rounded-[18px] border p-4 sm:p-5 md:w-[240px] md:snap-start ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${lit ? skin.accentBg : skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 ${lit ? 'text-white' : skin.muted}`} aria-hidden="true">
                    <path d={ICON_PATHS[gi]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <m.span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${lit ? skin.accentBg : skin.dark ? 'bg-white/15' : 'bg-black/10'}`}
                  initial={false}
                  animate={{ scale: lit && !reduced ? [1, 1.4, 1] : 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </div>
              <p className={`mt-3 text-sm font-semibold uppercase tracking-[0.08em] ${skin.title}`}>{group.label}</p>
              <p className={`mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${lit ? skin.accent : skin.muted}`}>{lit ? rc.statusDone : rc.statusChecking}</p>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className={`text-[12.5px] leading-snug ${skin.body}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        <div aria-hidden="true" className="w-[70%] shrink-0 md:w-8" />
      </div>

      <p className={`mt-3 text-center text-xs font-medium tabular-nums ${skin.muted}`}>{rc.railCounterLabel.replace('{current}', String(active + 1)).replace('{total}', String(total))}</p>
    </div>
  )
}
