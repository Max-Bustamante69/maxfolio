import { useEffect, useId } from 'react'
import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { ResultMetric } from '../../data/results'

const EASE = [0.23, 1, 0.32, 1] as const

export interface ChartLabels {
  metric: Record<string, string>
  before: string
  after: string
}

interface Palette {
  color: string
  dark: boolean
}

const mutedText = (dark: boolean) => (dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]')
const isGood = (mm: ResultMetric) => (mm.invert ? mm.after <= mm.before : mm.after >= mm.before)
const deltaPct = (mm: ResultMetric) => (mm.before === 0 ? null : Math.round(((mm.after - mm.before) / mm.before) * 100))
const fmt = (mm: ResultMetric, v: number) =>
  mm.unit === 's' ? `${v.toFixed(1)} s` : mm.unit === '%' ? `${Math.round(v)}%` : mm.unit === 'h' ? `${Math.round(v)} h` : mm.unit === 'n' ? Math.round(v).toLocaleString() : `${Math.round(v)}`

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

const Delta = ({ metric, delay }: { metric: ResultMetric; delay: number }) => {
  const d = deltaPct(metric)
  if (d === null) return null
  const up = d >= 0
  return <CountUp value={Math.abs(d)} prefix={up ? '+' : '−'} suffix="%" delay={delay} className={`text-lg font-semibold tabular-nums ${isGood(metric) ? 'text-[#34c759]' : 'text-[#ff3b30]'}`} />
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
 * Indexed line (before = 100): the baseline stays flat at 100, the series draws itself in, the end
 * value counts up. Pure SVG, animates stroke-dashoffset + opacity only.
 */
export function IndexLine({ metric, color, dark, labels, delay = 0 }: { metric: ResultMetric; labels: ChartLabels; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  const id = useId()
  const series = metric.series ?? [metric.before, metric.after]
  const W = 240
  const H = 96
  const pad = 8
  const min = Math.min(100, ...series) - 6
  const max = Math.max(100, ...series) + 6
  const x = (i: number) => pad + (i / (series.length - 1)) * (W - pad * 2)
  const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2)
  const d = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${d} L ${x(series.length - 1).toFixed(1)} ${H - pad} L ${x(0).toFixed(1)} ${H - pad} Z`
  const track = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const label = labels.metric[metric.id] ?? metric.id
  return (
    <figure className="m-0">
      <div className="flex items-baseline justify-between gap-2">
        <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{label}</figcaption>
        <Delta metric={metric} delay={delay} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-24 w-full" role="img" aria-label={`${label}: ${metric.before} → ${metric.after} (index, base 100)`}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad} x2={W - pad} y1={y(100)} y2={y(100)} stroke={track} strokeWidth="1" strokeDasharray="3 4" />
        <m.path d={area} fill={`url(#${id}-fill)`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.6, duration: 0.6 }} />
        <m.path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 1.1, ease: EASE }} />
        <m.circle cx={x(series.length - 1)} cy={y(series[series.length - 1])} r="4" fill={color} initial={reduced ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: delay + 1, duration: 0.3, ease: EASE }} />
      </svg>
      <SrTable caption={label} rows={series.map((v, i) => [String(i + 1), String(v)])} />
    </figure>
  )
}

/**
 * Slope chart: two columns (before / after), one line per metric, colored by whether the move is
 * the good direction. Reads a whole "what moved" story in one glance.
 */
export function SlopeChart({ metrics, color, dark, labels, delay = 0 }: { metrics: ResultMetric[]; labels: ChartLabels; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  const W = 240
  const H = 24 + metrics.length * 34
  const left = 64
  const right = W - 64
  const values = metrics.flatMap((mm) => [mm.before, mm.after])
  const min = Math.min(...values) - 8
  const max = Math.max(...values) + 8
  const y = (v: number) => 14 + (1 - (v - min) / (max - min)) * (H - 28)
  const bad = '#ff3b30'
  return (
    <figure className="m-0">
      <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{metrics.map((mm) => labels.metric[mm.id] ?? mm.id).join(' · ')}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" style={{ height: H }} role="img" aria-label={metrics.map((mm) => `${labels.metric[mm.id] ?? mm.id}: ${fmt(mm, mm.before)} → ${fmt(mm, mm.after)}`).join('; ')}>
        <text x={left} y={H - 2} textAnchor="end" className="fill-current" style={{ fontSize: 9, letterSpacing: '0.1em', opacity: 0.55 }}>
          {labels.before.toUpperCase()}
        </text>
        <text x={right} y={H - 2} textAnchor="start" className="fill-current" style={{ fontSize: 9, letterSpacing: '0.1em', opacity: 0.55 }}>
          {labels.after.toUpperCase()}
        </text>
        {metrics.map((mm, i) => {
          const c = isGood(mm) ? color : bad
          return (
            <g key={mm.id}>
              <m.line x1={left} y1={y(mm.before)} x2={right} y2={y(mm.after)} stroke={c} strokeWidth="2.5" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: delay + i * 0.12, duration: 0.9, ease: EASE }} />
              <circle cx={left} cy={y(mm.before)} r="3.5" fill={dark ? '#a1a1a6' : '#6e6e73'} />
              <m.circle cx={right} cy={y(mm.after)} r="4" fill={c} initial={reduced ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + i * 0.12 + 0.8, duration: 0.3 }} />
              <text x={left - 8} y={y(mm.before) + 3.5} textAnchor="end" className="fill-current" style={{ fontSize: 10, opacity: 0.7 }}>
                {fmt(mm, mm.before)}
              </text>
              <text x={right + 8} y={y(mm.after) + 3.5} className="fill-current" style={{ fontSize: 10, fontWeight: 600 }}>
                {fmt(mm, mm.after)}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {metrics.map((mm, i) => (
          <span key={mm.id} className={`text-[11px] ${mutedText(dark)}`}>
            {labels.metric[mm.id] ?? mm.id} <Delta metric={mm} delay={delay + i * 0.12} />
          </span>
        ))}
      </div>
      <SrTable caption={labels.before + ' / ' + labels.after} rows={metrics.map((mm) => [labels.metric[mm.id] ?? mm.id, `${fmt(mm, mm.before)} → ${fmt(mm, mm.after)}`])} />
    </figure>
  )
}

/** Radial gauge for a share (0–100%): the arc fills, the number counts up. */
export function Gauge({ metric, color, dark, labels, delay = 0 }: { metric: ResultMetric; labels: ChartLabels; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  const R = 26
  const C = 2 * Math.PI * R
  const mv = useMotionValue(reduced ? metric.after : 0)
  const dash = useTransform(mv, (v) => C - (Math.max(0, Math.min(100, v)) / 100) * C)
  useEffect(() => {
    if (reduced) {
      mv.set(metric.after)
      return
    }
    const ctrl = animate(mv, metric.after, { duration: 1.1, delay, ease: EASE })
    return () => ctrl.stop()
  }, [metric.after, delay, reduced, mv])
  const label = labels.metric[metric.id] ?? metric.id
  return (
    <figure className="m-0 flex items-center gap-3" role="img" aria-label={`${label}: ${fmt(metric, metric.after)}${metric.before ? ` (${labels.before.toLowerCase()} ${fmt(metric, metric.before)})` : ''}`}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden="true">
        <circle cx="32" cy="32" r={R} fill="none" strokeWidth="6" stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
        <m.circle cx="32" cy="32" r={R} fill="none" strokeWidth="6" strokeLinecap="round" stroke={color} strokeDasharray={C} style={{ strokeDashoffset: dash }} transform="rotate(-90 32 32)" />
      </svg>
      <div className="min-w-0">
        <CountUp value={metric.after} suffix="%" delay={delay} className="text-2xl font-semibold leading-none tabular-nums" />
        <figcaption className={`mt-1 text-[11px] leading-tight ${mutedText(dark)}`}>
          {label}
          {metric.before > 0 && <span className="opacity-70"> · {labels.before.toLowerCase()} {fmt(metric, metric.before)}</span>}
        </figcaption>
      </div>
    </figure>
  )
}

/** Paired bars per metric (seconds, hours, counts): before muted, after in the accent, both growing from zero. */
export function MetricBars({ metrics, color, dark, labels, delay = 0 }: { metrics: ResultMetric[]; labels: ChartLabels; delay?: number } & Palette) {
  const reduced = useReducedMotion()
  return (
    <figure className="m-0 space-y-3">
      {metrics.map((mm, i) => {
        const max = Math.max(mm.before, mm.after) * 1.15 || 1
        const rows = [
          { key: labels.before, v: mm.before, c: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)' },
          { key: labels.after, v: mm.after, c: isGood(mm) ? color : '#ff3b30' },
        ]
        const label = labels.metric[mm.id] ?? mm.id
        return (
          <div key={mm.id}>
            <div className="flex items-baseline justify-between gap-2">
              <figcaption className={`text-[11px] leading-tight ${mutedText(dark)}`}>{label}</figcaption>
              <Delta metric={mm} delay={delay + i * 0.15} />
            </div>
            <div className="mt-1.5 space-y-1.5" role="img" aria-label={`${label}: ${labels.before} ${fmt(mm, mm.before)}, ${labels.after} ${fmt(mm, mm.after)}`}>
              {rows.map((r, j) => (
                <div key={r.key} className="flex items-center gap-2">
                  <span className={`w-12 shrink-0 text-[10px] uppercase tracking-[0.12em] ${mutedText(dark)}`}>{r.key}</span>
                  <div className={`h-2.5 flex-1 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
                    <m.div className="h-full rounded-full" style={{ backgroundColor: r.c }} initial={reduced ? false : { width: 0 }} animate={{ width: `${(r.v / max) * 100}%` }} transition={{ delay: delay + i * 0.15 + j * 0.12, duration: 0.9, ease: EASE }} />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums">{fmt(mm, r.v)}</span>
                </div>
              ))}
            </div>
            <SrTable caption={label} rows={rows.map((r) => [r.key, fmt(mm, r.v)])} />
          </div>
        )
      })}
    </figure>
  )
}
