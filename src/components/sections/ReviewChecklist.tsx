import { useEffect, useMemo, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { LaptopFrame, PhoneFrame, type Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface ReviewChecklistProps {
  skin: Skin
  heading: SectionHeading
  onCta: () => void
}

/** The real floor confirmed against @digitdeck/qa on disk (2026-09-09): 27 convention assertions
 *  (packages/qa/conventions/assertions/**\/*.mjs, excluding __tests__) + 15 fixpack guards
 *  (packages/qa/guards/*.guard.mjs) + 6 behavioral areas in packages/qa/deep-qa.mjs's own README
 *  table = 48. Never claimed as "48+" here — only the floor the task instructions allow. */
const CHECK_COUNT = 40

const EASE = [0.23, 1, 0.32, 1] as const
/** One item every 90ms — 26 real items finish well inside the 4s the proof pass holds at "complete". */
const STEP_MS = 90

/** The real capture the run plays against: The Gummy Box, in `public/gallery/the-gummy-box/`. */
const SHOT = { desktop: '/gallery/the-gummy-box/home-desktop.webp', mobile: '/gallery/the-gummy-box/home-mobile.webp' }

/** One hotspot per group, placed over the plausible home-page area that group's checks touch —
 *  illustrative positioning (percent of the frame), not a pixel-measured read of this specific
 *  screenshot. Order matches `strings.sections.reviewChecklist.groups` exactly (parity-checked
 *  across locales), so groups are addressed by index, never by label text. */
const HOTSPOTS = [
  { x: 82, y: 6 }, // Commerce — header cart icon
  { x: 30, y: 46 }, // Content — a product card in the grid
  { x: 50, y: 94 }, // Data — footer
  { x: 50, y: 46 }, // Geometry — the grid itself
  { x: 50, y: 62 }, // Motion — a carousel row
  { x: 18, y: 6 }, // Navigation — the menu
  { x: 50, y: 3 }, // Overlays — the header band
] as const

/** One inline line-icon path per group, fixed order matching `rc.groups` (parity-checked across
 *  locales, so groups are addressed by index, never by label text). Plain path data, no icon library. */
const ICON_PATHS = [
  'M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Zm2-3a4 4 0 0 1 8 0', // Commerce — bag
  'M5 4h10l4 4v12H5V4Zm10 0v4h4M9 12h6M9 16h6', // Content — a folded card
  'M4 19V10m6.5 9V5M17 19v-6', // Data — bars
  'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z', // Geometry — grid
  'M8 6v12l10-6-10-6Z', // Motion — play
  'M4 6h16M4 12h16M4 18h16', // Navigation — menu
  'M12 4l8 4-8 4-8-4 8-4Zm-8 8 8 4 8-4M4 16l8 4 8-4', // Overlays — stacked layers
] as const

function GroupIcon({ index, className }: { index: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={ICON_PATHS[index]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckMark({ done, reduced }: { done: boolean; reduced: boolean }) {
  return (
    <m.svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
      initial={false}
      animate={{ opacity: done ? 1 : 0.22, scale: done ? 1 : 0.85 }}
      transition={{ duration: reduced ? 0 : 0.22, ease: EASE }}
    >
      <circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" strokeWidth={1.3} opacity={done ? 1 : 0.4} />
      <path d="M4.8 8.3l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={done ? 1 : 0} />
    </m.svg>
  )
}

/**
 * What the free 20-minute review actually runs: a real home-page capture with a scanning line and
 * per-group hotspots, seven assertion-group tiles with a progress meter and per-item check marks. It
 * never claims a live result read off a visitor's own store, only a replay of the check list (the
 * caption under the visual says so).
 */
export function ReviewChecklist({ skin, heading, onCta }: ReviewChecklistProps) {
  const { strings } = useContent()
  const rc = strings.sections.reviewChecklist
  const reduced = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)
  const [runStep, setRunStep] = useState(0)

  const flat = useMemo(() => rc.groups.flatMap((g, gi) => g.items.map((item, ii) => ({ gi, ii, item }))), [rc.groups])
  const total = flat.length
  const cumulative = useMemo(() => {
    const out: number[] = []
    let acc = 0
    for (const g of rc.groups) {
      out.push(acc)
      acc += g.items.length
    }
    return out
  }, [rc.groups])

  // Starts the run once, the first time the section is at least 30% visible. Reduced motion or a
  // browser without IntersectionObserver renders the complete state on first paint instead.
  useEffect(() => {
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setRunStep(total)
      setStarted(true)
      return
    }
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, total])

  // Steps one item every STEP_MS once started, then stops at `total` and holds.
  useEffect(() => {
    if (!started || reduced || runStep >= total) return
    const t = setTimeout(() => setRunStep((s) => Math.min(total, s + 1)), STEP_MS)
    return () => clearTimeout(t)
  }, [started, runStep, reduced, total])

  const complete = runStep >= total
  const currentGroup = complete ? -1 : (flat[runStep]?.gi ?? -1)
  const scanPct = total > 0 ? (runStep / total) * 100 : 0

  return (
    <section id="review-checklist" ref={sectionRef} className="scroll-mt-20">
      {heading(rc.eyebrow, rc.title, rc.titleAccent, rc.lead)}

      <p className={`mb-8 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>{rc.countLabel.replace('{n}', String(CHECK_COUNT))}</p>

      <div className={`grid gap-6 border-t pt-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 ${skin.line}`}>
        {/* Left: the real capture, a scanning line, and one hotspot per group. */}
        <div className="mx-auto w-full max-w-[360px] md:max-w-none">
          <div className="relative">
            <div className="hidden md:block">
              <LaptopFrame>
                <img src={SHOT.desktop} alt={rc.screenshotAlt} className="h-full w-full object-cover object-top" width={1280} height={800} loading="lazy" decoding="async" />
                {HOTSPOTS.map((h, gi) => (
                  <Hotspot key={gi} h={h} active={currentGroup === gi} done={cumulative[gi] + rc.groups[gi].items.length <= runStep} label={rc.hotspotAria.replace('{group}', rc.groups[gi].label)} skin={skin} reduced={reduced} />
                ))}
                <ScanLine pct={scanPct} visible={started && !complete} reduced={reduced} skin={skin} />
              </LaptopFrame>
            </div>
            <div className="md:hidden">
              <PhoneFrame className="mx-auto w-[62%]">
                <img src={SHOT.mobile} alt={rc.screenshotAlt} className="h-full w-full object-cover object-top" width={430} height={880} loading="lazy" decoding="async" />
                {HOTSPOTS.map((h, gi) => (
                  <Hotspot key={gi} h={h} active={currentGroup === gi} done={cumulative[gi] + rc.groups[gi].items.length <= runStep} label={rc.hotspotAria.replace('{group}', rc.groups[gi].label)} skin={skin} reduced={reduced} />
                ))}
                <ScanLine pct={scanPct} visible={started && !complete} reduced={reduced} skin={skin} />
              </PhoneFrame>
            </div>
          </div>
          <p className={`mt-4 text-center text-xs leading-relaxed md:text-left ${skin.muted}`}>{rc.runCaption}</p>
        </div>

        {/* Right: the 7 assertion groups, each a tile with an icon, item count, a progress meter and per-item checks. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2">
          {rc.groups.map((group, gi) => {
            const done = Math.min(Math.max(runStep - cumulative[gi], 0), group.items.length)
            const pct = group.items.length > 0 ? (done / group.items.length) * 100 : 0
            const groupComplete = done === group.items.length
            return (
              <div key={group.label} className={`rounded-[18px] border p-4 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
                <div className="flex items-center gap-2">
                  <GroupIcon index={gi} className={`h-4 w-4 shrink-0 ${skin.accent}`} />
                  <p className={`min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.accent}`}>{group.label}</p>
                  <span className={`shrink-0 text-[11px] tabular-nums ${skin.muted}`}>{group.items.length}</span>
                </div>

                <div className={`mt-3 h-1 overflow-hidden rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/[0.07]'}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-valuetext={rc.progressAria.replace('{done}', String(done)).replace('{total}', String(group.items.length))} aria-label={group.label}>
                  <m.div className={`h-full rounded-full ${skin.accentBg}`} initial={false} animate={{ width: `${pct}%` }} transition={{ duration: reduced ? 0 : 0.2, ease: EASE }} />
                </div>

                <p className={`mt-2 text-[10px] font-medium uppercase tracking-[0.1em] ${groupComplete ? skin.accent : skin.muted}`}>{groupComplete ? rc.statusDone : rc.statusChecking}</p>

                <ul className="mt-3 space-y-1.5">
                  {group.items.map((item, ii) => {
                    const idx = cumulative[gi] + ii
                    return (
                      <li key={item} className="flex items-start gap-2 text-[13px] leading-snug">
                        <span className={idx < runStep ? skin.accent : skin.muted}>
                          <CheckMark done={idx < runStep} reduced={reduced} />
                        </span>
                        <span>{item}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      <button type="button" onClick={onCta} className="press mt-10 inline-flex items-center justify-center rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-apple-blueHover">
        {rc.cta}
      </button>
    </section>
  )
}

function Hotspot({ h, active, done, label, skin, reduced }: { h: { x: number; y: number }; active: boolean; done: boolean; label: string; skin: Skin; reduced: boolean }) {
  const lit = active || done
  const colorClass = lit ? skin.accent : skin.muted
  return (
    <m.span
      role="img"
      aria-label={label}
      className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ${skin.dark ? 'ring-white/70' : 'ring-white'} ${colorClass}`}
      style={{ left: `${h.x}%`, top: `${h.y}%`, backgroundColor: 'currentColor' }}
      initial={false}
      animate={{ opacity: lit ? 1 : 0.3, scale: active && !reduced ? [1, 1.25, 1] : 1 }}
      transition={active && !reduced ? { duration: 0.6, repeat: Infinity, ease: EASE } : { duration: reduced ? 0 : 0.2 }}
    />
  )
}

function ScanLine({ pct, visible, reduced, skin }: { pct: number; visible: boolean; reduced: boolean; skin: Skin }) {
  if (reduced) return null
  return (
    <m.span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-px ${skin.accentBg}`}
      style={{ boxShadow: skin.dark ? '0 0 8px 1px rgba(41,151,255,0.7)' : '0 0 8px 1px rgba(0,113,227,0.5)' }}
      initial={false}
      animate={{ top: `${pct}%`, opacity: visible ? 0.9 : 0 }}
      transition={{ duration: 0.09, ease: 'linear' }}
    />
  )
}
