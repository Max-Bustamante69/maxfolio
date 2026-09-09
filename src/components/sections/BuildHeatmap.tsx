import { useMemo, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'
import { telemetry } from '../../data/telemetry'

const EASE = [0.23, 1, 0.32, 1] as const
const WEEKS_IN_YEAR = 52
const YEAR_START = new Date('2026-01-01T00:00:00Z').getTime()

/** Monday-of-the-week index (0-51) a telemetry `weekOf` date falls into, counted from 2026-01-01. */
function weekIndex(weekOf: string): number {
  const t = new Date(`${weekOf}T00:00:00Z`).getTime()
  return Math.floor((t - YEAR_START) / (7 * 86400000))
}

/**
 * Every store's weekly commit counts, summed onto one 52-slot row for 2026 — the real week each
 * fell in, not a synthetic spread. `total` is derived from `cells` (not a separate running sum of
 * every telemetry week regardless of year), so the headline can never drift from what the row
 * actually draws if a store's telemetry ever extends outside the 2026 window.
 */
function buildYearRow(): { cells: number[]; total: number } {
  const cells = new Array<number>(WEEKS_IN_YEAR).fill(0)
  for (const t of Object.values(telemetry)) {
    const base = weekIndex(t.weekOf)
    t.weeks.forEach((n, i) => {
      const idx = base + i
      if (idx >= 0 && idx < WEEKS_IN_YEAR) cells[idx] += n
    })
  }
  const total = cells.reduce((sum, n) => sum + n, 0)
  return { cells, total }
}

const mondayOf = (idx: number) => new Date(YEAR_START + idx * 7 * 86400000).toISOString().slice(0, 10)

/** 5-step bucket by share of the row's max, so one runaway week never washes out the rest. */
function bucket(n: number, max: number): number {
  if (n <= 0) return 0
  const share = n / max
  if (share <= 0.15) return 1
  if (share <= 0.35) return 2
  if (share <= 0.65) return 3
  return 4
}

/**
 * The fleet's build activity as a calendar-heatmap row: every store's weekly commits, summed by
 * week of 2026 into one strip. A real receipt of "shipped every week," not a decoration — the
 * headline count is the same sum the cells draw. Phones scrub between the two halves of the year.
 */
export function BuildHeatmap({ skin }: { skin: Skin }) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 640px)', true)
  const bh = strings.sections.buildHeatmap
  const [half, setHalf] = useState<0 | 1>(0)
  const { cells, total } = useMemo(buildYearRow, [])
  const max = Math.max(1, ...cells)
  const [headlinePre, headlinePost] = bh.headline.split('{n}')

  const OPACITY = ['opacity-0', 'opacity-30', 'opacity-[0.55]', 'opacity-[0.78]', 'opacity-100']
  const fillFor = (b: number) => {
    if (b === 0) return skin.dark ? 'bg-white/[0.06]' : 'bg-black/[0.05]'
    return `${skin.accentBg} ${OPACITY[b]}`
  }

  const Cell = ({ i }: { i: number }) => {
    const n = cells[i]
    const label = bh.cellAria.replace('{date}', mondayOf(i)).replace('{n}', String(n))
    return (
      <m.div
        role="img"
        aria-label={label}
        title={label}
        className={`aspect-square min-w-[8px] flex-1 rounded-[2px] ${fillFor(bucket(n, max))}`}
        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.3, delay: 0.15 + i * 0.008, ease: EASE }}
      />
    )
  }

  return (
    <figure className="m-0 mt-10 md:mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{bh.label}</p>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
        {headlinePre}
        <CountUp value={total} delay={0.1} />
        {headlinePost}
      </p>

      {wide ? (
        <div className="mt-4 flex gap-[3px]" aria-hidden="false">
          {cells.map((_, i) => (
            <Cell key={i} i={i} />
          ))}
        </div>
      ) : (
        <div>
          <div className="mt-4 flex gap-[3px]">
            {cells.slice(half * 26, half * 26 + 26).map((_, j) => (
              <Cell key={half * 26 + j} i={half * 26 + j} />
            ))}
          </div>
          <div className="mt-3 flex gap-2" role="tablist" aria-label={bh.label}>
            {([0, 1] as const).map((h) => (
              <button
                key={h}
                type="button"
                role="tab"
                aria-selected={half === h}
                onClick={() => setHalf(h)}
                className={`${half === h ? skin.chipOn : skin.chip} compact-touch transition-colors`}
              >
                {h === 0 ? bh.half1 : bh.half2}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px]" aria-hidden="true">
        <span className={skin.muted}>{bh.legendLow}</span>
        {[0, 1, 2, 3, 4].map((b) => (
          <span key={b} className={`h-2.5 w-2.5 rounded-[2px] ${fillFor(b)}`} />
        ))}
        <span className={skin.muted}>{bh.legendHigh}</span>
      </div>
    </figure>
  )
}
