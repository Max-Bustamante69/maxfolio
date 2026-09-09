import { useMemo, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface StackByYearProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const
const YEARS = [2022, 2023, 2024, 2025, 2026]
const MAX_TAGS = 8
const yearOf = (ym: string) => Number(ym.slice(0, 4))

interface RankPoint {
  year: number
  rank: number
  count: number
}

/**
 * Every stack tag used by a storefront, client project, product or side project, counted onto the
 * year(s) its build touched — a store spanning two years counts in both. Real occurrences, not a
 * survey. Returns, per tag, its rank each year it had at least one occurrence (undefined otherwise).
 */
function useStackByYear() {
  const { registry } = useContent()
  return useMemo(() => {
    const counts: Record<number, Record<string, number>> = {}
    YEARS.forEach((y) => (counts[y] = {}))
    const add = (y: number, tags: readonly string[]) => {
      if (!counts[y]) return
      tags.forEach((t) => (counts[y][t] = (counts[y][t] ?? 0) + 1))
    }
    registry.stores.forEach((s) => {
      for (let y = yearOf(s.timeline.start); y <= yearOf(s.timeline.end); y++) add(y, s.stack)
    })
    registry.roleWork.forEach((w) => {
      for (let y = yearOf(w.timeline.start); y <= yearOf(w.timeline.end); y++) add(y, w.stack)
    })
    registry.products.forEach((p) => add(p.year, p.stack))
    registry.personalProjects.forEach((p) => add(p.year, p.stack))

    const totals: Record<string, number> = {}
    YEARS.forEach((y) => Object.entries(counts[y]).forEach(([tag, n]) => (totals[tag] = (totals[tag] ?? 0) + n)))
    const topTags = Object.entries(totals)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_TAGS)
      .map(([tag]) => tag)

    const byTag = new Map<string, RankPoint[]>()
    YEARS.forEach((y) => {
      const ranked = topTags
        .map((tag) => ({ tag, count: counts[y][tag] ?? 0 }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      ranked.forEach((r, i) => {
        const list = byTag.get(r.tag) ?? []
        list.push({ year: y, rank: i + 1, count: r.count })
        byTag.set(r.tag, list)
      })
    })

    return { topTags, byTag, counts }
  }, [registry])
}

const OPACITY = ['opacity-100', 'opacity-[0.86]', 'opacity-[0.74]', 'opacity-[0.64]', 'opacity-[0.54]', 'opacity-[0.45]', 'opacity-[0.37]', 'opacity-30']

/** Splits a tag's per-year rank points into runs of consecutive years, so an absent middle year breaks the line rather than skipping over it. */
function toRuns(points: RankPoint[]): RankPoint[][] {
  const sorted = [...points].sort((a, b) => a.year - b.year)
  const runs: RankPoint[][] = []
  sorted.forEach((p) => {
    const last = runs[runs.length - 1]
    if (last && p.year === last[last.length - 1].year + 1) last.push(p)
    else runs.push([p])
  })
  return runs
}

/**
 * A bump chart: the top technologies across the whole body of work, ranked year by year as an
 * SVG that draws itself in on scroll. Rank is the only axis — colors are just an opacity ladder by
 * overall usage, so every line carries its own text label rather than leaning on a legend. Phones
 * get the same ranks as a scrubbable list, one year at a time.
 */
export function StackByYear({ skin, heading }: StackByYearProps) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const sy = strings.sections.stackByYear
  const { topTags, byTag, counts } = useStackByYear()
  const [picked, setPicked] = useState(YEARS[YEARS.length - 1])

  const ROWS = topTags.length
  const W = 640
  const H = 60 + ROWS * 34
  const padL = 14
  const padR = 14
  const padT = 20
  const padB = 20
  const colW = (W - padL - padR) / (YEARS.length - 1)
  const rowH = (H - padT - padB) / Math.max(1, ROWS)
  const xOf = (year: number) => padL + YEARS.indexOf(year) * colW
  const yOf = (rank: number) => padT + (rank - 1) * rowH + rowH / 2

  const tableRows = YEARS.map((y) => ({
    year: y,
    ranked: topTags
      .map((tag) => ({ tag, count: counts[y][tag] ?? 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count),
  }))

  return (
    <section id="stack-by-year" className="scroll-mt-20">
      {heading(sy.eyebrow, sy.title, sy.titleAccent, sy.lead)}

      {wide ? (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label={`${sy.eyebrow}: ${tableRows.map((r) => `${r.year} — ${r.ranked.map((x) => x.tag).join(', ')}`).join('; ')}`}>
            {YEARS.map((y) => (
              <text key={y} x={xOf(y)} y={H - 4} textAnchor="middle" className={skin.muted} style={{ fontSize: 11, fill: 'currentColor' }}>
                {y}
              </text>
            ))}
            {topTags.map((tag, ti) => {
              const points = byTag.get(tag) ?? []
              const runs = toRuns(points)
              const op = OPACITY[Math.min(ti, OPACITY.length - 1)]
              const first = points[0]
              const last = points[points.length - 1]
              return (
                <g key={tag} className={op}>
                  {runs.map((run, ri) => {
                    const d = run.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.year)} ${yOf(p.rank)}`).join(' ')
                    return (
                      <g key={ri}>
                        <m.path
                          d={d}
                          fill="none"
                          className={skin.accentBg.replace('bg-', 'stroke-')}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={reduced ? false : { pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ duration: 0.9, delay: 0.1 + ti * 0.06, ease: EASE }}
                        >
                          <title>{`${tag}: ${run.map((p) => `${p.year} #${p.rank}`).join(', ')}`}</title>
                        </m.path>
                        {run.map((p) => (
                          <circle key={p.year} cx={xOf(p.year)} cy={yOf(p.rank)} r={3} className={skin.accentBg.replace('bg-', 'fill-')} />
                        ))}
                      </g>
                    )
                  })}
                  {/* labels at both ends of the whole series, not per run */}
                  <text x={xOf(first.year) - 6} y={yOf(first.rank)} textAnchor="end" dominantBaseline="middle" className={skin.title} style={{ fontSize: 11, fill: 'currentColor', fontWeight: 600 }}>
                    {tag}
                  </text>
                  {last.year !== first.year && (
                    <text x={xOf(last.year) + 6} y={yOf(last.rank)} textAnchor="start" dominantBaseline="middle" className={skin.title} style={{ fontSize: 11, fill: 'currentColor', fontWeight: 600 }}>
                      {tag}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      ) : (
        <div>
          <div className="-mx-4 overflow-x-auto px-4 no-scrollbar" role="tablist" aria-label={sy.eyebrow}>
            <div className={`flex gap-1 border-b ${skin.line}`}>
              {YEARS.map((y) => {
                const active = picked === y
                return (
                  <button
                    key={y}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPicked(y)}
                    className={`press relative shrink-0 px-3 pb-3 pt-2 text-lg font-semibold tabular-nums tracking-[-0.02em] transition-colors duration-150 first:pl-0 ${active ? '' : skin.muted}`}
                  >
                    {active && <m.span layoutId="stack-year-marker" className={`absolute bottom-0 left-0 h-0.5 w-full ${skin.accentBg}`} transition={reduced ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.1 }} />}
                    {y}
                  </button>
                )
              })}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.ol key={picked} className="pt-5" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.28, ease: EASE }}>
              {(tableRows.find((r) => r.year === picked)?.ranked ?? []).map((r, i) => (
                <li key={r.tag} className={`flex items-center justify-between gap-4 border-b py-2.5 ${skin.line}`}>
                  <span className="flex items-center gap-3">
                    <span className={`${skin.muted} w-5 text-right text-xs font-semibold tabular-nums`}>{i + 1}</span>
                    <span className="text-base font-medium">{r.tag}</span>
                  </span>
                  <span className={`${skin.muted} text-xs tabular-nums`}>
                    {r.count} {sy.countUnit}
                  </span>
                </li>
              ))}
            </m.ol>
          </AnimatePresence>
        </div>
      )}

      <table className="sr-only">
        <caption>{sy.eyebrow}</caption>
        <tbody>
          {tableRows.map((r) => (
            <tr key={r.year}>
              <th scope="row">{r.year}</th>
              {r.ranked.map((x, i) => (
                <td key={x.tag}>{sy.rankAria.replace('{rank}', String(i + 1)).replace('{year}', String(r.year)).replace('{tag}', x.tag).replace('{n}', String(x.count))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
