import { useEffect } from 'react'
import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'

const EASE = [0.23, 1, 0.32, 1] as const

interface Palette {
  color: string
  dark: boolean
}

const mutedText = (dark: boolean) => (dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]')
/** Direction colors that clear AA as text: the accent greens/reds are for fills, not type. */
export const goodText = (dark: boolean) => (dark ? 'text-[#5ee082]' : 'text-[#136329]')
export const badText = (dark: boolean) => (dark ? 'text-[#ff8a80]' : 'text-[#b42318]')

/** Counts a number up when it mounts; shows the final value at once under reduced motion.
 *  `duration` defaults to 1s (this component's long-standing site-wide behavior — commerce chips,
 *  telemetry); the Impact block's own draw-ins pass 0.8 explicitly to stay inside its ≤0.8s budget. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', delay = 0, duration = 1, className = '' }: { value: number; decimals?: number; prefix?: string; suffix?: string; delay?: number; duration?: number; className?: string }) {
  const reduced = useReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  // toLocaleString (not toFixed) so a four-digit-plus value counts up with the same thousands
  // separator its static fallback string uses (e.g. "10,000+") instead of losing it mid-animation.
  // Locale is pinned to 'en-US', not `undefined`: the registry's own fact strings ("10,000+",
  // "$45k/yr") are always written in that comma-grouped format regardless of the site's active
  // language, so a viewer whose OS/browser locale groups digits differently (es-CO and many others
  // render 10000 as "10.000") would otherwise see the animated end-state mismatch the static
  // fallback that renders before the count-up's viewport observer fires (verified: this machine's
  // own `undefined` locale already prints "10.000", 2026-09-09 review pass).
  const text = useTransform(mv, (v) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`)
  useEffect(() => {
    if (reduced) {
      mv.set(value)
      return
    }
    const ctrl = animate(mv, value, { duration, delay, ease: EASE })
    return () => ctrl.stop()
  }, [value, delay, duration, reduced, mv])
  return <m.span className={className}>{text}</m.span>
}

const SrTable = ({ caption, rows }: { caption: string; rows: [string, string][] }) => (
  <table className="sr-only">
    <caption>{caption}</caption>
    <tbody>
      {rows.map(([k, v]) => (
        <tr key={k}>
          <th scope="row">{k}</th>
          <td>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

/**
 * Commits per week of a store's build, read from its git history: one bar per week, the busiest week
 * called out. Real counts; the bars grow in from the baseline, transform-only.
 */
export function WeeklyBars({ weeks, weekOf, peakLabel, caption, color, dark, delay = 0 }: { weeks: number[]; weekOf: string; peakLabel: string; caption: string; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  const max = Math.max(1, ...weeks)
  const peak = weeks.indexOf(max)
  const start = new Date(`${weekOf}T12:00:00Z`)
  const labelOf = (i: number) => {
    const d = new Date(start.getTime() + i * 7 * 86400000)
    return d.toISOString().slice(0, 10)
  }
  return (
    <figure className="m-0">
      <div className="flex items-baseline justify-between gap-2">
        <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{caption}</figcaption>
        <span className={`text-[11px] leading-tight ${mutedText(dark)}`}>{peakLabel}</span>
      </div>
      <div className="mt-2 flex h-16 items-end gap-[3px]" role="img" aria-label={`${caption}: ${weeks.join(', ')}`}>
        {weeks.map((n, i) => (
          <m.div
            key={i}
            className="flex-1 rounded-[2px]"
            style={{ height: `${Math.max(4, (n / max) * 100)}%`, backgroundColor: i === peak ? color : dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)', transformOrigin: 'bottom' }}
            initial={reduced ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: delay + i * 0.04, duration: 0.6, ease: EASE }}
            title={`${labelOf(i)}: ${n}`}
          />
        ))}
      </div>
      <SrTable caption={caption} rows={weeks.map((n, i) => [labelOf(i), String(n)] as [string, string])} />
    </figure>
  )
}

export interface CompareRow {
  key: string
  label: string
  storeValue: number
  fleetValue: number
  displayStore: string
  displayFleet: string
}

/**
 * "vs. fleet median" — one row per metric (delivery weeks, catalog size, price midpoint), a bold bar
 * for this store against a muted bar for the fleet median directly beneath it. A metric is omitted
 * upstream (see commerceLines.computeFleetMedians) whenever the fleet doesn't have a real median yet
 * for that currency/measure, so every row shown here compares two real numbers.
 */
export function CompareBars({ rows, thisLabel, fleetLabel, color, dark, delay = 0 }: { rows: CompareRow[]; thisLabel: string; fleetLabel: string; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  if (rows.length === 0) return null
  return (
    <figure className="m-0 space-y-4">
      {rows.map((r, i) => {
        const max = Math.max(r.storeValue, r.fleetValue, 1)
        return (
          <div key={r.key}>
            <p className={`text-[11px] leading-tight ${mutedText(dark)}`}>{r.label}</p>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 flex-1 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
                  <m.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color, width: `${Math.max(4, (r.storeValue / max) * 100)}%`, transformOrigin: 'left' }}
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: delay + i * 0.12, duration: 0.7, ease: EASE }}
                  />
                </div>
                <span className="w-[92px] shrink-0 text-right text-xs font-semibold tabular-nums">{r.displayStore}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${dark ? 'bg-white/[0.06]' : 'bg-black/[0.035]'}`}>
                  <m.div
                    className={`h-full rounded-full ${dark ? 'bg-white/30' : 'bg-black/25'}`}
                    style={{ width: `${Math.max(4, (r.fleetValue / max) * 100)}%`, transformOrigin: 'left' }}
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: delay + i * 0.12 + 0.08, duration: 0.7, ease: EASE }}
                  />
                </div>
                <span className={`w-[92px] shrink-0 text-right text-[11px] tabular-nums ${mutedText(dark)}`}>{r.displayFleet}</span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-4 pt-1">
        <span className="inline-flex items-center gap-1.5 text-[11px]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          {thisLabel}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-[11px] ${mutedText(dark)}`}>
          <span className={`h-2 w-2 shrink-0 rounded-full ${dark ? 'bg-white/30' : 'bg-black/25'}`} aria-hidden="true" />
          {fleetLabel}
        </span>
      </div>
      <SrTable
        caption={`${thisLabel} / ${fleetLabel}`}
        rows={rows.flatMap((r) => [
          [`${r.label} — ${thisLabel}`, r.displayStore],
          [`${r.label} — ${fleetLabel}`, r.displayFleet],
        ] as [string, string][])}
      />
    </figure>
  )
}

const GAUGE_R = 24
const GAUGE_C = 2 * Math.PI * GAUGE_R

/** A single-metric percentage gauge (e.g. share of catalog on sale) — same arc-fill language as the
 *  Lighthouse rings, one accent color instead of a banded score. */
export function Gauge({ value, label, color, dark, delay = 0 }: { value: number; label: string; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  const shown = useTransform(mv, (v) => `${Math.round(v)}%`)
  const dash = useTransform(mv, (v) => GAUGE_C - (Math.max(0, Math.min(100, v)) / 100) * GAUGE_C)
  useEffect(() => {
    if (reduced) {
      mv.set(value)
      return
    }
    const ctrl = animate(mv, value, { duration: 1, delay, ease: EASE })
    return () => ctrl.stop()
  }, [value, delay, reduced, mv])
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 60 60" className="h-14 w-14 shrink-0" aria-hidden="true">
        <circle cx="30" cy="30" r={GAUGE_R} fill="none" strokeWidth="5" stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <m.circle cx="30" cy="30" r={GAUGE_R} fill="none" strokeWidth="5" strokeLinecap="round" stroke={color} strokeDasharray={GAUGE_C} style={{ strokeDashoffset: dash }} transform="rotate(-90 30 30)" />
      </svg>
      <div className="min-w-0">
        <m.p className="text-xl font-semibold leading-none tabular-nums" aria-label={`${label}: ${Math.round(value)}%`}>
          {shown}
        </m.p>
        <p className={`mt-1 text-[11px] leading-tight ${mutedText(dark)}`}>{label}</p>
      </div>
    </div>
  )
}

/** A stepped discount ladder ("10% → 20%") — one bar per step, tallest (last) step in the accent. */
export function DiscountLadder({ steps, unit = '%', label, color, dark, delay = 0 }: { steps: number[]; unit?: string; label: string; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  if (steps.length === 0) return null
  const max = Math.max(1, ...steps)
  return (
    <figure className="m-0">
      <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{label}</figcaption>
      <div className="mt-2 flex items-end gap-2" role="img" aria-label={`${label}: ${steps.map((s) => `${s}${unit}`).join(' → ')}`}>
        {steps.map((s, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-semibold tabular-nums">
              <CountUp value={s} suffix={unit} delay={delay + i * 0.15} />
            </span>
            {/* The bar's percentage height needs a parent with a definite height to resolve against —
                putting the label inside this box (as a sibling of the bar) left the box's own height
                driven by content, which made every percentage height here resolve to 0. Fixed h-16
                box, bar as its only child, mirrors the (working) WeeklyBars pattern above. */}
            <div className="flex h-16 w-full items-end">
              <m.div
                className="w-full rounded-t-[3px]"
                style={{ height: `${Math.max(8, (s / max) * 100)}%`, backgroundColor: i === steps.length - 1 ? color : dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)', transformOrigin: 'bottom' }}
                initial={reduced ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: delay + i * 0.15, duration: 0.5, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      <SrTable caption={label} rows={steps.map((s, i) => [`${i + 1}`, `${s}${unit}`] as [string, string])} />
    </figure>
  )
}

/** A mini line chart of commits per week (real git history) — the stroke draws in on open, the
 *  busiest week gets a dot. Paint-only (stroke-dasharray/offset), no layout thrash. */
export function CommitsLine({ weeks, caption, peakLabel, color, dark, delay = 0 }: { weeks: number[]; caption: string; peakLabel: string; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  if (weeks.length === 0) return null
  const w = 240
  const h = 48
  const pad = 4
  const max = Math.max(1, ...weeks)
  const stepX = weeks.length > 1 ? (w - pad * 2) / (weeks.length - 1) : 0
  const points = weeks.map((n, i) => [pad + i * stepX, pad + (1 - n / max) * (h - pad * 2)] as [number, number])
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const first = points[0]
  const areaPath = `${linePath} L${last[0].toFixed(1)},${h} L${first[0].toFixed(1)},${h} Z`
  const peakIdx = weeks.indexOf(max)
  return (
    <figure className="m-0">
      <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{caption}</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-12 w-full" preserveAspectRatio="none" role="img" aria-label={`${caption}: ${weeks.join(', ')}`}>
        <m.path d={areaPath} fill={color} fillOpacity={dark ? 0.16 : 0.1} stroke="none" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.35, duration: 0.5 }} />
        <m.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay, duration: 0.9, ease: EASE }}
        />
        {points.map(([x, y], i) => i === peakIdx && <circle key={i} cx={x} cy={y} r={2.5} fill={color} />)}
      </svg>
      <p className={`mt-1 text-[11px] leading-tight ${mutedText(dark)}`}>{peakLabel}</p>
      <SrTable caption={caption} rows={weeks.map((n, i) => [`W${i + 1}`, String(n)] as [string, string])} />
    </figure>
  )
}

/** A store's own price band (min → max), with the fleet's currency-matched median marked as a tick
 *  when there are enough peer stores in that currency to make a median meaningful. */
export function PriceRangeBar({
  min,
  max,
  median,
  currency,
  intlLocale,
  minLabel,
  maxLabel,
  medianLabel,
  label,
  color,
  dark,
  delay = 0,
}: {
  min: number
  max: number
  median: number | null
  currency: string
  intlLocale: string
  minLabel: string
  maxLabel: string
  medianLabel: string
  label: string
  delay?: number
} & Palette) {
  const reduced = useReducedMotion()
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(intlLocale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
    } catch {
      return `${Math.round(n).toLocaleString(intlLocale)} ${currency}`
    }
  }
  const domainMax = Math.max(max, median ?? 0) * 1.08 || 1
  const minPct = (min / domainMax) * 100
  const maxPct = (max / domainMax) * 100
  const medianPct = median !== null ? (median / domainMax) * 100 : null
  return (
    <figure className="m-0">
      <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{label}</figcaption>
      <div className="relative mt-3 h-2 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
        <div className="absolute inset-y-0 overflow-hidden rounded-full" style={{ left: `${minPct}%`, width: `${Math.max(2, maxPct - minPct)}%` }}>
          <m.div
            className="h-full w-full rounded-full"
            style={{ backgroundColor: color, transformOrigin: 'left' }}
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay, duration: 0.8, ease: EASE }}
          />
        </div>
        {medianPct !== null && (
          <m.span
            className={`absolute top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-full ${dark ? 'bg-white/70' : 'bg-black/60'}`}
            style={{ left: `${medianPct}%` }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.4 }}
            title={medianLabel}
          />
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
        <span className={mutedText(dark)}>
          {minLabel} {fmt(min)}
        </span>
        {median !== null && (
          <span className={`hidden sm:inline ${mutedText(dark)}`}>
            {medianLabel} {fmt(median)}
          </span>
        )}
        <span className={mutedText(dark)}>
          {maxLabel} {fmt(max)}
        </span>
      </div>
      <SrTable
        caption={label}
        rows={[[minLabel, fmt(min)], ...(median !== null ? [[medianLabel, fmt(median)] as [string, string]] : []), [maxLabel, fmt(max)]] as [string, string][]}
      />
    </figure>
  )
}

/**
 * An indexed line (before = 100) for an illustrative outcome — conversion or revenue-per-visitor.
 * When `band` is given (conversion: the CV's own +10%/+20% floor and ceiling) it's drawn as a soft
 * fill the store's own seeded line always sits inside, so a single trajectory reads as one
 * representation of a known, disclosed range rather than a standalone number. Paint-only animation
 * (opacity + stroke-dash), an sr-only table underneath, headline delta counts up in the good-direction
 * color since every series here is a seeded lift, never a decline.
 */
export function IndexAreaLine({
  points,
  band,
  label,
  deltaPct,
  color,
  dark,
  delay = 0,
}: {
  points: number[]
  band?: { low: number[]; high: number[] }
  label: string
  deltaPct: number
  delay?: number
} & Palette) {
  const reduced = useReducedMotion()
  const w = 240
  const h = 72
  const pad = 6
  const n = points.length
  const allVals = [...points, ...(band ? [...band.low, ...band.high] : []), 100]
  const min = Math.min(...allVals) - 2
  const max = Math.max(...allVals) + 2
  const span = max - min || 1
  const x = (i: number) => pad + (n > 1 ? (i / (n - 1)) * (w - pad * 2) : 0)
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2)
  const lineOf = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const linePath = lineOf(points)
  const bandPath = band
    ? `${lineOf(band.high)} L${x(n - 1).toFixed(1)},${y(band.low[n - 1]).toFixed(1)} ${band.low
        .slice()
        .reverse()
        .map((v, i) => `L${x(n - 1 - i).toFixed(1)},${y(v).toFixed(1)}`)
        .join(' ')} Z`
    : null
  const baselineY = y(100)
  return (
    <figure className="m-0">
      <div className="flex items-baseline justify-between gap-2">
        <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{label}</figcaption>
        <CountUp value={deltaPct} prefix="+" suffix="%" delay={delay + 0.6} duration={0.8} className={`text-xl font-semibold leading-none tabular-nums ${goodText(dark)}`} />
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1.5 h-[62px] w-full" preserveAspectRatio="none" role="img" aria-label={`${label}: ${points[0]} → ${points[n - 1]} (index, base 100)`}>
        <line x1={pad} x2={w - pad} y1={baselineY} y2={baselineY} stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'} strokeWidth={1} strokeDasharray="3 4" />
        {bandPath && (
          <m.path d={bandPath} fill={color} fillOpacity={dark ? 0.14 : 0.09} stroke="none" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.3, duration: 0.5 }} />
        )}
        <m.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay, duration: 0.8, ease: EASE }}
        />
        <m.circle
          cx={x(n - 1)}
          cy={y(points[n - 1])}
          r={3.5}
          fill={color}
          initial={reduced ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.8, duration: 0.3, ease: EASE }}
        />
      </svg>
      <SrTable caption={label} rows={points.map((v, i) => [`W${i + 1}`, String(v)] as [string, string])} />
    </figure>
  )
}

/** Lighthouse's own bands: 90+ green, 50–89 orange, below red — the single source both the score
 *  rings row and the performance dual ring color by by, so a real 90+ reads exactly the same wherever
 *  it appears in the sheet. */
export const scoreColor = (score: number) => (score >= 90 ? '#34c759' : score >= 50 ? '#ff9f0a' : '#ff3b30')

const RINGS_R = 20
const RINGS_C = 2 * Math.PI * RINGS_R

/** A single small Lighthouse-style ring inside ScoreRingsRow — count-up numeral, band-colored arc. */
function MiniRing({ value, label, delay, dark }: { value: number; label: string; delay: number; dark: boolean }) {
  const reduced = useReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  const shown = useTransform(mv, (v) => Math.round(v))
  const dash = useTransform(mv, (v) => RINGS_C - (Math.max(0, Math.min(100, v)) / 100) * RINGS_C)
  useEffect(() => {
    if (reduced) {
      mv.set(value)
      return
    }
    const ctrl = animate(mv, value, { duration: 0.8, delay, ease: EASE })
    return () => ctrl.stop()
  }, [value, delay, reduced, mv])
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" aria-hidden="true">
        <circle cx="24" cy="24" r={RINGS_R} fill="none" strokeWidth="4.5" stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <m.circle cx="24" cy="24" r={RINGS_R} fill="none" strokeWidth="4.5" strokeLinecap="round" stroke={scoreColor(value)} strokeDasharray={RINGS_C} style={{ strokeDashoffset: dash }} transform="rotate(-90 24 24)" />
      </svg>
      <div className="min-w-0">
        <m.p className="text-lg font-semibold leading-none tabular-nums" aria-label={`${label}: ${value}`}>
          {shown}
        </m.p>
        <p className={`mt-0.5 text-[10px] leading-tight ${mutedText(dark)}`}>{label}</p>
      </div>
    </div>
  )
}

export interface RingMetric {
  key: string
  label: string
  value: number
}

/** Score-rings row — Performance, Accessibility, SEO (whatever the caller passes; Best Practices and
 *  any sub-50 score are filtered out upstream), one small animated ring each, real measured values. */
export function ScoreRingsRow({ metrics, caption, dark, delay = 0 }: { metrics: RingMetric[]; caption?: string; dark: boolean; delay?: number }) {
  if (metrics.length === 0) return null
  return (
    <figure className="m-0">
      <div className="flex flex-wrap gap-x-5 gap-y-3" role="img" aria-label={metrics.map((m) => `${m.label}: ${m.value}`).join(', ')}>
        {metrics.map((m, i) => (
          <MiniRing key={m.key} value={m.value} label={m.label} delay={delay + i * 0.1} dark={dark} />
        ))}
      </div>
      {caption && <p className={`mt-2 text-[11px] leading-snug ${mutedText(dark)}`}>{caption}</p>}
      <SrTable caption={caption ?? 'Score rings'} rows={metrics.map((m) => [m.label, String(m.value)] as [string, string])} />
    </figure>
  )
}

const DUAL_OUTER_R = 26
const DUAL_INNER_R = 18
const DUAL_OUTER_C = 2 * Math.PI * DUAL_OUTER_R
const DUAL_INNER_C = 2 * Math.PI * DUAL_INNER_R

/**
 * Performance, before → after: a thin inner arc (the illustrative pre-optimization baseline) inside a
 * bold outer arc (the real measured score, band-colored), replacing the old paired bars. Both arcs
 * draw in together; the numeral is the real "after" score with the delta counting up beside it.
 */
export function PerfDualRing({
  before,
  after,
  label,
  beforeLabel,
  afterLabel,
  dark,
  delay = 0,
}: {
  before: number
  after: number
  label: string
  beforeLabel: string
  afterLabel: string
  dark: boolean
  delay?: number
}) {
  const reduced = useReducedMotion()
  const mvAfter = useMotionValue(reduced ? after : 0)
  const mvBefore = useMotionValue(reduced ? before : 0)
  const shown = useTransform(mvAfter, (v) => Math.round(v))
  const dashOuter = useTransform(mvAfter, (v) => DUAL_OUTER_C - (Math.max(0, Math.min(100, v)) / 100) * DUAL_OUTER_C)
  const dashInner = useTransform(mvBefore, (v) => DUAL_INNER_C - (Math.max(0, Math.min(100, v)) / 100) * DUAL_INNER_C)
  useEffect(() => {
    if (reduced) {
      mvAfter.set(after)
      mvBefore.set(before)
      return
    }
    const c1 = animate(mvAfter, after, { duration: 0.8, delay, ease: EASE })
    const c2 = animate(mvBefore, before, { duration: 0.8, delay, ease: EASE })
    return () => {
      c1.stop()
      c2.stop()
    }
  }, [after, before, delay, reduced, mvAfter, mvBefore])
  const delta = Math.round(after - before)
  return (
    <figure className="m-0" role="img" aria-label={`${label}: ${beforeLabel} ${before}, ${afterLabel} ${after}`}>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
          <circle cx="32" cy="32" r={DUAL_OUTER_R} fill="none" strokeWidth="5" stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
          <m.circle cx="32" cy="32" r={DUAL_OUTER_R} fill="none" strokeWidth="5" strokeLinecap="round" stroke={scoreColor(after)} strokeDasharray={DUAL_OUTER_C} style={{ strokeDashoffset: dashOuter }} transform="rotate(-90 32 32)" />
          <circle cx="32" cy="32" r={DUAL_INNER_R} fill="none" strokeWidth="3" stroke={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
          <m.circle
            cx="32"
            cy="32"
            r={DUAL_INNER_R}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            stroke={dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.32)'}
            strokeDasharray={DUAL_INNER_C}
            style={{ strokeDashoffset: dashInner }}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <m.p className="text-2xl font-semibold leading-none tabular-nums">{shown}</m.p>
            {delta !== 0 && (
              <CountUp value={Math.abs(delta)} prefix={delta > 0 ? '+' : '−'} delay={delay + 0.7} duration={0.8} className={`text-xs font-semibold tabular-nums ${delta > 0 ? goodText(dark) : badText(dark)}`} />
            )}
          </div>
          <p className={`mt-1 text-[11px] leading-tight ${mutedText(dark)}`}>{label}</p>
          <p className={`text-[10px] leading-tight ${mutedText(dark)}`}>
            {beforeLabel} {Math.round(before)} → {afterLabel} {Math.round(after)}
          </p>
        </div>
      </div>
      <SrTable caption={label} rows={[[beforeLabel, String(before)], [afterLabel, String(after)]]} />
    </figure>
  )
}

/** Core Web Vitals thresholds (Google's own): LCP good ≤2.5s/poor >4s, INP good ≤200ms/poor >500ms,
 *  CLS good ≤0.1/poor >0.25 — the same bands the "passes Core Web Vitals" field-data flag is built on. */
const cwvColor = (metric: 'lcp' | 'inp' | 'cls', v: number) =>
  metric === 'lcp' ? (v <= 2.5 ? '#34c759' : v <= 4 ? '#ff9f0a' : '#ff3b30') : metric === 'inp' ? (v <= 200 ? '#34c759' : v <= 500 ? '#ff9f0a' : '#ff3b30') : v <= 0.1 ? '#34c759' : v <= 0.25 ? '#ff9f0a' : '#ff3b30'

export interface CwvData {
  lcp: number // seconds, p75
  inp: number // ms, p75
  cls: number // p75
}

/** Three real-user (CrUX field data) pills — p75 LCP / INP / CLS — colored by the same thresholds the
 *  "passes Core Web Vitals" flag uses. Shown only when the store's origin has enough real-user traffic
 *  for CrUX to report; falls back to the lab LCP gauge (SpeedGauge) otherwise. */
export function CwvStrip({ data, lcpLabel, inpLabel, clsLabel, dark, delay = 0 }: { data: CwvData; lcpLabel: string; inpLabel: string; clsLabel: string; dark: boolean; delay?: number }) {
  const reduced = useReducedMotion()
  const pills = [
    { key: 'lcp', label: lcpLabel, display: `${data.lcp.toFixed(1)}s`, color: cwvColor('lcp', data.lcp) },
    { key: 'inp', label: inpLabel, display: `${Math.round(data.inp)}ms`, color: cwvColor('inp', data.inp) },
    { key: 'cls', label: clsLabel, display: data.cls.toFixed(2), color: cwvColor('cls', data.cls) },
  ]
  return (
    <div className="flex flex-wrap gap-2" role="img" aria-label={pills.map((p) => `${p.label}: ${p.display}`).join(', ')}>
      {pills.map((p, i) => (
        <m.div
          key={p.key}
          className={`min-w-[84px] flex-1 rounded-full px-3 py-2 ${dark ? 'bg-white/5' : 'bg-black/[0.04]'}`}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.08, duration: 0.4, ease: EASE }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />
            <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${mutedText(dark)}`}>{p.label}</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{p.display}</p>
        </m.div>
      ))}
      <SrTable caption={[lcpLabel, inpLabel, clsLabel].join(' / ')} rows={pills.map((p) => [p.label, p.display] as [string, string])} />
    </div>
  )
}

/** Paired before/after bars for a REAL seconds measurement (mobile LCP): "before" is the illustrative
 *  anchor (src/data/illustrative.ts loadTimeSeries — the real "after" divided by a seeded 38–40%),
 *  muted like every other illustrative bar in this file; "after" is the real measured LCP, colored by
 *  the same good/needs-improvement/poor LCP bands SpeedGauge uses below it. The domain is
 *  0..max(before,after)×1.08 (not a fixed 0–100 like the score rings) since these are seconds, not
 *  scores, and the illustrative "before" can run well past any fixed ceiling on a slow store. */
export function LoadTimePairedBar({
  beforeSeconds,
  afterSeconds,
  deltaPct,
  beforeLabel,
  afterLabel,
  label,
  dark,
  delay = 0,
}: {
  beforeSeconds: number
  afterSeconds: number
  deltaPct: number // positive: the illustrative % reduction from before to after, shown as "−N%"
  beforeLabel: string
  afterLabel: string
  label: string
  dark: boolean
  delay?: number
}) {
  const reduced = useReducedMotion()
  const domainMax = Math.max(beforeSeconds, afterSeconds, 0.1) * 1.08
  const color = afterSeconds <= 2.5 ? '#34c759' : afterSeconds <= 4 ? '#ff9f0a' : '#ff3b30'
  const bars = [
    { key: beforeLabel, v: beforeSeconds, c: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)' },
    { key: afterLabel, v: afterSeconds, c: color },
  ]
  return (
    <figure className="m-0">
      <div className="flex items-baseline justify-between gap-2">
        <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{label}</figcaption>
        <CountUp value={deltaPct} prefix="−" suffix="%" delay={delay + 0.5} duration={0.8} className={`text-xs font-semibold tabular-nums ${goodText(dark)}`} />
      </div>
      <div className="mt-1.5 space-y-1.5" role="img" aria-label={`${label}: ${beforeLabel} ${beforeSeconds.toFixed(1)}s, ${afterLabel} ${afterSeconds.toFixed(1)}s`}>
        {bars.map((b, j) => (
          <div key={b.key} className="flex items-center gap-2">
            <span className={`w-14 shrink-0 text-[10px] uppercase tracking-[0.12em] ${mutedText(dark)}`}>{b.key}</span>
            <div className={`h-2.5 flex-1 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
              <m.div
                className="h-full rounded-full"
                style={{ backgroundColor: b.c }}
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${Math.max(2, (b.v / domainMax) * 100)}%` }}
                transition={{ delay: delay + j * 0.12, duration: 0.8, ease: EASE }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">{b.v.toFixed(1)}s</span>
          </div>
        ))}
      </div>
      <SrTable
        caption={label}
        rows={[
          [beforeLabel, `${beforeSeconds.toFixed(1)}s`],
          [afterLabel, `${afterSeconds.toFixed(1)}s`],
        ]}
      />
    </figure>
  )
}

const SPEED_R = 22
const SPEED_C = 2 * Math.PI * SPEED_R

/** A small gauge for one REAL measurement — mobile LCP — against a fixed 0..domainMax scale, colored
 *  by whether it clears the "good" threshold (green), the "needs improvement" band (orange), or
 *  neither (red) — Lighthouse/CrUX's own LCP bands (≤2.5s / ≤4s / above). */
export function SpeedGauge({
  seconds,
  thresholdSeconds = 2.5,
  domainMax = 4.5,
  label,
  targetLabel,
  dark,
  delay = 0,
}: {
  seconds: number
  thresholdSeconds?: number
  domainMax?: number
  label: string
  targetLabel: string
  dark: boolean
  delay?: number
}) {
  const reduced = useReducedMotion()
  const color = seconds <= thresholdSeconds ? '#34c759' : seconds <= thresholdSeconds * 1.6 ? '#ff9f0a' : '#ff3b30'
  const mv = useMotionValue(reduced ? seconds : 0)
  const shown = useTransform(mv, (v) => `${v.toFixed(1)}s`)
  const dash = useTransform(mv, (v) => SPEED_C - (Math.max(0, Math.min(domainMax, v)) / domainMax) * SPEED_C)
  useEffect(() => {
    if (reduced) {
      mv.set(seconds)
      return
    }
    const ctrl = animate(mv, seconds, { duration: 0.8, delay, ease: EASE })
    return () => ctrl.stop()
  }, [seconds, delay, reduced, mv])
  return (
    <div className="flex items-center gap-3" role="img" aria-label={`${label}: ${seconds}s`}>
      <svg viewBox="0 0 56 56" className="h-14 w-14 shrink-0" aria-hidden="true">
        <circle cx="28" cy="28" r={SPEED_R} fill="none" strokeWidth="5" stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <m.circle cx="28" cy="28" r={SPEED_R} fill="none" strokeWidth="5" strokeLinecap="round" stroke={color} strokeDasharray={SPEED_C} style={{ strokeDashoffset: dash }} transform="rotate(-90 28 28)" />
      </svg>
      <div className="min-w-0">
        <m.p className="text-xl font-semibold leading-none tabular-nums">{shown}</m.p>
        <p className={`mt-1 text-[11px] leading-tight ${mutedText(dark)}`}>{label}</p>
        <p className={`text-[11px] leading-tight ${mutedText(dark)}`}>{targetLabel}</p>
      </div>
    </div>
  )
}

/** A short ledger of codebase volumes (sections, lines), each bar scaled to the largest, counted up. */
export function VolumeBars({ rows, color, dark, delay = 0 }: { rows: { label: string; value: number }[]; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <figure className="m-0 space-y-2">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-2">
          <div className={`h-2 flex-1 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
            <m.div className="h-full rounded-full" style={{ backgroundColor: color, width: `${(r.value / max) * 100}%`, transformOrigin: 'left' }} initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: delay + i * 0.12, duration: 0.8, ease: EASE }} />
          </div>
          <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums">
            <CountUp value={r.value} delay={delay + i * 0.12} />
          </span>
          <span className={`w-28 shrink-0 text-[11px] leading-tight sm:w-36 ${mutedText(dark)}`}>{r.label}</span>
        </div>
      ))}
      <SrTable caption={rows.map((r) => r.label).join(' / ')} rows={rows.map((r) => [r.label, String(r.value)] as [string, string])} />
    </figure>
  )
}
