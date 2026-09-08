import { useEffect, useId } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { ResultMetric } from '../../data/results'

const EASE = [0.23, 1, 0.32, 1] as const

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
  return <motion.span className={className}>{text}</motion.span>
}

interface LineProps {
  metric: ResultMetric
  color: string
  dark: boolean
  label: string
  delay?: number
}

/**
 * Indexed line (before = 100): the baseline stays flat at 100, the series draws itself in, the end
 * value counts up. Pure SVG, animates stroke-dashoffset + opacity only.
 */
export function IndexLine({ metric, color, dark, label, delay = 0 }: LineProps) {
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
  const delta = Math.round(metric.after - metric.before)
  const up = delta >= 0
  const good = metric.id === 'checkout' ? !up : up
  const track = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  return (
    <figure className="m-0">
      <div className="flex items-baseline justify-between gap-2">
        <figcaption className={`text-[11px] leading-tight ${dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{label}</figcaption>
        <CountUp value={Math.abs(delta)} prefix={up ? '+' : '−'} suffix="%" delay={delay} className={`text-lg font-semibold tabular-nums ${good ? 'text-[#34c759]' : 'text-[#ff3b30]'}`} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-24 w-full" role="img" aria-label={`${label}: ${metric.before} → ${metric.after} (index, base 100)`}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad} x2={W - pad} y1={y(100)} y2={y(100)} stroke={track} strokeWidth="1" strokeDasharray="3 4" />
        <motion.path d={area} fill={`url(#${id}-fill)`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.6, duration: 0.6 }} />
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay, duration: 1.1, ease: EASE }}
        />
        <motion.circle cx={x(series.length - 1)} cy={y(series[series.length - 1])} r="4" fill={color} initial={reduced ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: delay + 1, duration: 0.3, ease: EASE }} />
      </svg>
    </figure>
  )
}

interface BarsProps {
  metric: ResultMetric
  color: string
  dark: boolean
  label: string
  beforeLabel: string
  afterLabel: string
  delay?: number
}

/** Before → after as two bars growing from zero (seconds for LCP; index otherwise). */
export function DeltaBars({ metric, color, dark, label, beforeLabel, afterLabel, delay = 0 }: BarsProps) {
  const reduced = useReducedMotion()
  const max = Math.max(metric.before, metric.after) * 1.15
  const rows = [
    { key: beforeLabel, v: metric.before, c: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)' },
    { key: afterLabel, v: metric.after, c: color },
  ]
  const fmt = (v: number) => (metric.unit === 's' ? `${v.toFixed(1)} s` : `${Math.round(v)}`)
  return (
    <figure className="m-0">
      <figcaption className={`text-[11px] leading-tight ${dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{label}</figcaption>
      <div className="mt-2 space-y-2" role="img" aria-label={`${label}: ${beforeLabel} ${fmt(metric.before)}, ${afterLabel} ${fmt(metric.after)}`}>
        {rows.map((r, i) => (
          <div key={r.key} className="flex items-center gap-2">
            <span className={`w-12 shrink-0 text-[10px] uppercase tracking-[0.12em] ${dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{r.key}</span>
            <div className={`h-2.5 flex-1 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: r.c }}
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${(r.v / max) * 100}%` }}
                transition={{ delay: delay + i * 0.15, duration: 0.9, ease: EASE }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums">{fmt(r.v)}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}
