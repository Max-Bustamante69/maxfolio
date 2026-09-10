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
