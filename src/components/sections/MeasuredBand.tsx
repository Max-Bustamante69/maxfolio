import { useRef, type ReactNode } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { CountUp, scoreColor } from '../gallery/charts'
import { sheetTokens, type Skin } from '../gallery'

const EASE = [0.23, 1, 0.32, 1] as const

interface MeasuredBandProps {
  skin: Skin
}

/** A small right-pointing arrow between the two Lighthouse rings — decorative, the numerals carry the meaning. */
const Arrow = ({ color }: { color: string }) => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke={color} strokeWidth={1.8} aria-hidden="true">
    <path d="M2 8h11m0 0-4-4m4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RING_R = 17
const RING_C = 2 * Math.PI * RING_R

/** One arc: `pct` of a 0-100 scale, drawn once when `show` flips true (or shown static under reduced motion). */
function Ring({ pct, color, track, delay, show, reduced }: { pct: number; color: string; track: string; delay: number; show: boolean; reduced: boolean }) {
  const offset = RING_C - (Math.max(0, Math.min(100, pct)) / 100) * RING_C
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r={RING_R} fill="none" strokeWidth="3.5" stroke={track} />
      {reduced ? (
        <circle cx="20" cy="20" r={RING_R} fill="none" strokeWidth="3.5" strokeLinecap="round" stroke={color} strokeDasharray={RING_C} strokeDashoffset={offset} transform="rotate(-90 20 20)" />
      ) : (
        <m.circle
          cx="20"
          cy="20"
          r={RING_R}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={{ strokeDashoffset: show ? offset : RING_C }}
          transition={{ delay, duration: 0.8, ease: EASE }}
          transform="rotate(-90 20 20)"
        />
      )}
    </svg>
  )
}

/** Two small rings (before, muted → after, band-colored) with an arrow between: the Lighthouse range as a shape, not a sentence. */
function LighthouseRings({ dark, show, reduced, delay = 0 }: { dark: boolean; show: boolean; reduced: boolean; delay?: number }) {
  const track = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
  const before = dark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.28)'
  const after = scoreColor(95)
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <Ring pct={70} color={before} track={track} delay={delay} show={show} reduced={reduced} />
      <Arrow color={dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'} />
      <Ring pct={95} color={after} track={track} delay={delay + 0.12} show={show} reduced={reduced} />
    </div>
  )
}

/** Two stacked bars, indexed at 100 → the range's illustrated floor and ceiling read as one shorter bar. */
function RangeBar({ afterFrom, afterTo, color, dark, show, reduced, delay = 0 }: { afterFrom: number; afterTo: number; color: string; dark: boolean; show: boolean; reduced: boolean; delay?: number }) {
  const track = dark ? 'bg-white/10' : 'bg-black/[0.06]'
  const mid = (afterFrom + afterTo) / 2
  const beforeColor = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)'
  const bars = [
    { w: 100, c: beforeColor },
    { w: mid, c: color },
  ]
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {bars.map((b, i) => (
        <div key={i} className={`h-2 overflow-hidden rounded-full ${track}`}>
          {reduced ? (
            <div className="h-full rounded-full" style={{ width: `${b.w}%`, backgroundColor: b.c }} />
          ) : (
            <m.div
              className="h-full rounded-full"
              style={{ backgroundColor: b.c }}
              initial={{ width: '0%' }}
              animate={{ width: show ? `${b.w}%` : '0%' }}
              transition={{ delay: delay + i * 0.12, duration: 0.8, ease: EASE }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/** A short rising index line (base 100), with an optional soft band for a disclosed floor-to-ceiling range. */
function TinyIndexLine({ to, low, high, color, dark, show, reduced, delay = 0 }: { to: number; low?: number; high?: number; color: string; dark: boolean; show: boolean; reduced: boolean; delay?: number }) {
  const w = 100
  const h = 32
  const pad = 3
  const allVals = [100, to, ...(low !== undefined ? [low] : []), ...(high !== undefined ? [high] : [])]
  const min = Math.min(...allVals) - 1
  const max = Math.max(...allVals) + 1
  const span = max - min || 1
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2)
  const x0 = pad
  const x1 = w - pad
  const linePath = `M${x0},${y(100)} L${x1},${y(to)}`
  const bandPath = low !== undefined && high !== undefined ? `M${x0},${y(high)} L${x1},${y(high)} L${x1},${y(low)} L${x0},${y(100)} Z` : null
  const baselineY = y(100)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
      <line x1={x0} x2={x1} y1={baselineY} y2={baselineY} stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'} strokeWidth={1} strokeDasharray="3 4" />
      {bandPath && <path d={bandPath} fill={color} fillOpacity={dark ? 0.16 : 0.1} stroke="none" />}
      {reduced ? (
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      ) : (
        <m.path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: show ? 1 : 0 }} transition={{ delay, duration: 0.7, ease: EASE }} />
      )}
    </svg>
  )
}

/** One cell: a small graphic, the range numeral (the same string `registry.stats` already carries — never
 *  a fabricated single figure standing in for a disclosed range), then the label. */
function Cell({ children, value, label, valueClassName = '' }: { children: ReactNode; value: ReactNode; label: string; valueClassName?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      {children}
      <div>
        <p className={`text-[1.375rem] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-2xl ${valueClassName}`}>{value}</p>
        <p className="mt-1.5 text-[11px] leading-snug opacity-70">{label}</p>
      </div>
    </div>
  )
}

/**
 * "The work, in numbers" — moved here from under the hero (2026-09-11, owner feedback: the hero read
 * saturated with the photo block/stat band stacked on top of the lead). Same four ranges the stat band
 * carried (lighthouse, load time, conversion, organic), each redrawn as a small graphic instead of a
 * bare numeral; the two count facts (20+ storefronts, 800+ tests) stay off this band since they already
 * live in the hero CTA and the Digitdeck Apps product copy. `storefronts` and `tests` stay in
 * `StatBand`, which other themes still render in full.
 */
export function MeasuredBand({ skin }: MeasuredBandProps) {
  const { strings, registry } = useContent()
  const s = strings.sections.statBand
  const stat = strings.stats
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion() ?? false
  const show = inView || reduced
  const dark = skin.dark
  const { accent } = sheetTokens(skin)
  const byId = Object.fromEntries(registry.stats.map((st) => [st.id, st.value])) as Record<string, string>

  return (
    <section aria-label={s.label} className="mb-10 md:mb-14">
      <div className={`flex items-baseline justify-between gap-4 border-t ${skin.line} pt-4`}>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{s.label}</p>
        <p className={`text-[11px] ${skin.muted}`}>{s.asOf}</p>
      </div>
      <div ref={ref} className={`mt-5 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 ${skin.body}`}>
        <Cell value={byId.lighthouse} label={stat.lighthouse}>
          <LighthouseRings dark={dark} show={show} reduced={reduced} />
        </Cell>
        <Cell value={byId.loadTime} label={stat.loadTime}>
          <RangeBar afterFrom={60} afterTo={70} color={accent} dark={dark} show={show} reduced={reduced} delay={0.06} />
        </Cell>
        <Cell value={byId.conversion} label={stat.conversion}>
          <TinyIndexLine to={115} low={110} high={120} color={accent} dark={dark} show={show} reduced={reduced} delay={0.12} />
        </Cell>
        <Cell
          value={
            show ? (
              <>
                <span className="sr-only">{byId.organic}</span>
                <span aria-hidden="true">
                  <CountUp value={20} prefix="+" suffix="%" duration={0.6} delay={0.25} />
                </span>
              </>
            ) : (
              byId.organic
            )
          }
          label={stat.organic}
        >
          <TinyIndexLine to={120} color={accent} dark={dark} show={show} reduced={reduced} delay={0.18} />
        </Cell>
      </div>
      <p className={`mt-4 text-[11px] leading-snug ${skin.muted}`}>{s.note}</p>
    </section>
  )
}
