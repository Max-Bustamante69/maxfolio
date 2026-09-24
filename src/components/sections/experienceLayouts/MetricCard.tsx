// Round 44/46 — the metric card MetricsAlive.tsx (the Experience section's "Métricas vivas" layout)
// renders per role: an icon, a real CountUp'd number (src/components/gallery/charts.tsx — the same
// primitive MeasuredBand and the case-study Impact block already use), and a small animated shape that reads
// the metric's own kind (range → bar with a low-bound tick, before→after → a Lighthouse-banded ring,
// plain count → an order-of-magnitude dot row). `key`'d by position (see the callers), never by
// metric id, so switching roles ticks the number instead of remounting it — CountUp's own
// `useMotionValue` keeps its current value and animates toward the new `value` prop whenever it
// changes, which only happens if the component instance survives the switch.
import { m, useReducedMotion } from 'framer-motion'
import { CountUp, scoreColor } from '../../gallery/charts'
import { sheetTokens, type Skin } from '../../gallery'
import { parseMetricValue } from './metricValue'
import { MetricIcon, metricIconName } from './icons'

const EASE = [0.23, 1, 0.32, 1] as const
const RING_R = 14
const RING_C = 2 * Math.PI * RING_R

function MetricRing({ pct, color, dark, delay }: { pct: number; color: string; dark: boolean; delay: number }) {
  const reduced = useReducedMotion()
  const track = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.09)'
  const offset = RING_C - (Math.max(0, Math.min(100, pct)) / 100) * RING_C
  return (
    <svg viewBox="0 0 34 34" className="h-8 w-8 shrink-0" aria-hidden="true">
      <circle cx="17" cy="17" r={RING_R} fill="none" strokeWidth="3" stroke={track} />
      <m.circle
        cx="17"
        cy="17"
        r={RING_R}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        stroke={color}
        strokeDasharray={RING_C}
        initial={reduced ? false : { strokeDashoffset: RING_C }}
        animate={{ strokeDashoffset: offset }}
        transition={reduced ? { duration: 0 } : { delay, duration: 0.8, ease: EASE }}
        transform="rotate(-90 17 17)"
      />
    </svg>
  )
}

function MetricBar({ pct, markerPct, color, dark, delay }: { pct: number; markerPct?: number; color: string; dark: boolean; delay: number }) {
  const reduced = useReducedMotion()
  const track = dark ? 'bg-white/10' : 'bg-black/[0.07]'
  return (
    <div className={`relative h-1.5 w-full overflow-hidden rounded-full ${track}`} aria-hidden="true">
      <m.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={reduced ? false : { width: '0%' }}
        animate={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        transition={reduced ? { duration: 0 } : { delay, duration: 0.8, ease: EASE }}
      />
      {markerPct !== undefined && <span className={`absolute top-1/2 h-2.5 w-px -translate-y-1/2 ${dark ? 'bg-white/50' : 'bg-black/40'}`} style={{ left: `${Math.max(0, Math.min(100, markerPct))}%` }} />}
    </div>
  )
}

function MetricDots({ magnitude, color, dark, delay }: { magnitude: number; color: string; dark: boolean; delay: number }) {
  const reduced = useReducedMotion()
  const hollow = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <m.span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: i < magnitude ? color : hollow }}
          initial={reduced ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={reduced ? { duration: 0 } : { delay: delay + i * 0.05, duration: 0.3, ease: EASE }}
        />
      ))}
    </div>
  )
}

export interface MetricCardProps {
  skin: Skin
  id: string
  label: string
  value: string
  delay?: number
  className?: string
}

const numeral = 'text-[1.6rem] font-semibold leading-none tracking-[-0.03em] tabular-nums'

export function MetricCard({ skin, id, label, value, delay = 0, className = '' }: MetricCardProps) {
  const dark = skin.dark
  const accent = sheetTokens(skin).accent
  const parsed = parseMetricValue(value)
  const iconName = metricIconName(id)
  const surface = dark ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-black/[0.02]'

  return (
    <div className={`flex min-w-0 flex-col gap-3 rounded-2xl border p-4 ${surface} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <MetricIcon name={iconName} className={`h-4 w-4 ${skin.muted}`} />
        {parsed.kind === 'count' && parsed.magnitude !== undefined && <MetricDots magnitude={parsed.magnitude} color={accent} dark={dark} delay={delay + 0.35} />}
      </div>

      {parsed.kind === 'arrow' && (
        <div className="flex items-center gap-3">
          <MetricRing pct={parsed.after ?? 0} color={scoreColor(parsed.after ?? 0)} dark={dark} delay={delay} />
          <p className={numeral}>
            <CountUp value={parsed.after ?? 0} suffix={parsed.afterSuffix ?? ''} delay={delay} duration={0.9} />
          </p>
        </div>
      )}
      {parsed.kind === 'rangePct' && (
        <p className={numeral}>
          <CountUp value={parsed.high ?? 0} prefix={parsed.sign} suffix="%" delay={delay} duration={0.9} />
        </p>
      )}
      {parsed.kind === 'signedPct' && (
        <p className={numeral}>
          <CountUp value={parsed.value ?? 0} prefix={parsed.sign} suffix="%" delay={delay} duration={0.9} />
        </p>
      )}
      {parsed.kind === 'money' && (
        <p className={numeral}>
          <CountUp value={parsed.value ?? 0} prefix={parsed.prefix} suffix={parsed.suffix} delay={delay} duration={0.9} />
        </p>
      )}
      {parsed.kind === 'count' && (
        <p className={numeral}>
          <CountUp value={parsed.value ?? 0} suffix={parsed.suffix} delay={delay} duration={0.9} />
        </p>
      )}
      {parsed.kind === 'text' && <p className={numeral}>{parsed.raw}</p>}

      {(parsed.kind === 'arrow' || parsed.kind === 'rangePct') && <p className={`-mt-1.5 text-[11px] tabular-nums ${skin.muted}`}>{parsed.raw}</p>}

      {parsed.kind === 'rangePct' && (
        <MetricBar
          pct={((parsed.high ?? 0) / Math.max((parsed.high ?? 0) * 1.25, 40)) * 100}
          markerPct={((parsed.low ?? 0) / Math.max((parsed.high ?? 0) * 1.25, 40)) * 100}
          color={accent}
          dark={dark}
          delay={delay + 0.15}
        />
      )}
      {parsed.kind === 'signedPct' && <MetricBar pct={((parsed.value ?? 0) / Math.max((parsed.value ?? 0) * 1.6, 30)) * 100} color={accent} dark={dark} delay={delay + 0.15} />}

      <p className={`text-[11px] font-medium leading-tight ${skin.muted}`}>{label}</p>
    </div>
  )
}
