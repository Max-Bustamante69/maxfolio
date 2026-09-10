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

/** Counts a number up when it mounts; shows the final value at once under reduced motion. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', delay = 0, className = '' }: { value: number; decimals?: number; prefix?: string; suffix?: string; delay?: number; className?: string }) {
  const reduced = useReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  const text = useTransform(mv, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)
  useEffect(() => {
    if (reduced) {
      mv.set(value)
      return
    }
    const ctrl = animate(mv, value, { duration: 1, delay, ease: EASE })
    return () => ctrl.stop()
  }, [value, delay, reduced, mv])
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
