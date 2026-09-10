// Variant B — "storyboard rail": a horizontal scroll-snap rail of 5 frames (problem, design, build,
// launch, result), each a card cropping one of the store's two real captures differently so the rail
// reads as five distinct beats rather than two images repeated. A thin progress line, prev/next
// controls and keyboard ←/→ track which frame is centered — the same IntersectionObserver-driven
// pattern Chapters.tsx uses, not scroll-position math. On top of that: the rail tilts a few degrees in
// 3D as it moves, proportional to drag/scroll velocity, and eases flat the moment motion stops —
// transform-only, and skipped entirely under reduced motion.
import { useEffect, useRef, useState } from 'react'
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { fill, type FeaturedData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const

interface Crop {
  scene: 'home' | 'pdp'
  position: string // Tailwind object-position utility
  zoom: boolean
}
const CROPS: Crop[] = [
  { scene: 'home', position: 'object-top', zoom: false },
  { scene: 'home', position: 'object-center', zoom: true },
  { scene: 'pdp', position: 'object-top', zoom: false },
  { scene: 'pdp', position: 'object-bottom', zoom: true },
  { scene: 'home', position: 'object-bottom', zoom: false },
]

export function StoryboardRailVariant({ data }: { data: FeaturedData }) {
  const { skin, fb, g, store, vars, img, sheetHref } = data
  const reduced = useReducedMotion()
  const total = fb.frames.length
  const [active, setActive] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Velocity -> tilt. A ref tracks the last scrollLeft/timestamp; every 'scroll' event (native wheel,
  // touch swipe, or the pointer-drag handler below — setting scrollLeft dispatches the same event)
  // derives px/s, clamps it, and feeds a spring that eases back to 0 once motion stops.
  const rawTilt = useMotionValue(0)
  const tilt = useSpring(rawTilt, { stiffness: 180, damping: 26 })
  const rotateY = useTransform(tilt, (v) => `${v}deg`)
  const lastScroll = useRef({ x: 0, t: 0 })
  const decayTimer = useRef<number | undefined>(undefined)

  const onRailScroll = () => {
    const rail = railRef.current
    if (!rail || reduced) return
    const now = performance.now()
    const dx = rail.scrollLeft - lastScroll.current.x
    const dt = Math.max(1, now - lastScroll.current.t)
    const v = (dx / dt) * 1000 // px/s
    const clamped = Math.max(-7, Math.min(7, v / 220))
    rawTilt.set(clamped)
    lastScroll.current = { x: rail.scrollLeft, t: now }
    window.clearTimeout(decayTimer.current)
    decayTimer.current = window.setTimeout(() => rawTilt.set(0), 140)
  }

  // Basic pointer-drag-to-scroll for desktop mice only — touch already scrolls natively, and letting
  // this handler also drive `scrollLeft` on a touch pointer would fight the browser's own momentum
  // scroll (double-handled, jumpy).
  const drag = useRef<{ active: boolean; startX: number; startLeft: number }>({ active: false, startX: 0, startLeft: 0 })
  const onPointerDown = (e: React.PointerEvent) => {
    const rail = railRef.current
    if (!rail || e.pointerType !== 'mouse') return
    drag.current = { active: true, startX: e.clientX, startLeft: rail.scrollLeft }
    rail.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const rail = railRef.current
    if (!rail || !drag.current.active) return
    rail.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX)
  }
  const endDrag = () => {
    drag.current.active = false
  }

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ratios = new Map<number, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.idx)
          ratios.set(idx, entry.intersectionRatio)
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
    if (!el || !railRef.current) return
    railRef.current.scrollTo({ left: el.offsetLeft - railRef.current.offsetLeft, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <div className={`h-0.5 flex-1 overflow-hidden rounded-full ${skin.dark ? 'bg-white/15' : 'bg-black/10'}`} role="progressbar" aria-valuenow={active + 1} aria-valuemin={1} aria-valuemax={total} aria-label={fb.eyebrow}>
          <m.div className={`h-full rounded-full ${skin.accentBg}`} animate={{ width: `${((active + 1) / total) * 100}%` }} transition={{ duration: reduced ? 0 : 0.4, ease: EASE }} />
        </div>
        <p className={`shrink-0 text-xs font-medium tabular-nums ${skin.muted}`}>{fill(fb.progressLabel, { n: active + 1, total })}</p>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={fb.prevAria} className={`compact-touch press flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === total - 1} aria-label={fb.nextAria} className={`compact-touch press flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30 ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <p className="sr-only">{fb.railHint}</p>

      {/* `perspective` has to live on an ancestor of the rotated element — set on the same node as the
          rotateY transform it does nothing (no vanishing point), so the tilt would read as a flat
          shear instead of real depth. This wrapper supplies that 3D viewing context for the rail. */}
      <div style={{ perspective: 1200 }}>
        <m.div
          ref={railRef}
          onScroll={onRailScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
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
          aria-label={fb.eyebrow}
          style={{ rotateY, cursor: 'grab' }}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 outline-none no-scrollbar"
        >
        {fb.frames.map((frame, i) => {
          const crop = CROPS[i] ?? CROPS[0]
          return (
            <div
              key={frame.label}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              data-idx={i}
              className={`w-[80%] shrink-0 snap-start overflow-hidden rounded-[22px] border sm:w-[52%] md:w-[34%] ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={img(crop.scene, 'desktop')}
                  alt={`${store.name} — ${crop.scene === 'home' ? g.home : g.pdp}`}
                  width={1280}
                  height={880}
                  loading="lazy"
                  decoding="async"
                  className={`h-full w-full object-cover ${crop.position} ${crop.zoom ? 'scale-125' : ''}`}
                />
                <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${skin.dark ? 'from-black/60' : 'from-black/35'} to-transparent`} aria-hidden="true" />
                <span className={`absolute bottom-2 left-3 font-sf text-xs font-semibold uppercase tracking-[0.14em] text-white`}>{frame.label}</span>
              </div>
              <div className="p-4 md:p-5">
                <p className={`font-sf text-lg font-semibold leading-tight tracking-[-0.02em] md:text-xl ${skin.title}`}>{fill(frame.headline, vars)}</p>
                <p className={`mt-1.5 text-sm leading-snug ${skin.muted}`}>{fill(frame.fact, vars)}</p>
              </div>
            </div>
          )
        })}
        </m.div>
      </div>

      <a href={sheetHref} className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${skin.accent}`}>
        {fb.cta} ›
      </a>
    </div>
  )
}
