import { useMemo, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { timeline } from '../../data/timeline'
import type { ExperienceId } from '../../data/registry'

interface BuildTimelineProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const
const AXIS_START_YEAR = 2022
const AXIS_END_YEAR = 2026
const YEARS = Array.from({ length: AXIS_END_YEAR - AXIS_START_YEAR + 1 }, (_, i) => AXIS_START_YEAR + i)
const TOTAL_MONTHS = YEARS.length * 12 // 60: Jan 2022 .. Dec 2026
const NOW = '2026-09'
const monthIndex = (ym: string) => {
  const [y, mo] = ym.split('-').map(Number)
  return (y - AXIS_START_YEAR) * 12 + (mo - 1)
}
const NOW_IDX = monthIndex(NOW)

interface EmployerLine {
  company: string
  segments: { id: ExperienceId; start: number; end: number; current: boolean }[]
}

/** Every experience entry grouped onto one line per employer — Digitdeck's two stints share a row. */
function useEmployerLines(): EmployerLine[] {
  const { registry } = useContent()
  return useMemo(() => {
    const byCompany = new Map<string, EmployerLine['segments']>()
    registry.experience.forEach((e) => {
      const segs = byCompany.get(e.company) ?? []
      segs.push({ id: e.id, start: monthIndex(e.start), end: (e.end ? monthIndex(e.end) : NOW_IDX) + 1, current: e.end === null })
      byCompany.set(e.company, segs)
    })
    return Array.from(byCompany.entries())
      .map(([company, segments]) => ({ company, segments: segments.sort((a, b) => a.start - b.start) }))
      .sort((a, b) => a.segments[0].start - b.segments[0].start)
  }, [registry])
}

/** One block per year: every storefront whose build window touches it — the same predicate `timeline.ts` already applied, not re-derived. */
function useYearBlocks() {
  return useMemo(
    () =>
      YEARS.map((year) => ({
        year,
        stores: (timeline.find((e) => e.year === year)?.stores ?? []).map((s) => ({
          slug: s.slug,
          name: s.name,
          start: monthIndex(s.timeline.start),
          end: monthIndex(s.timeline.end) + 1,
        })),
      })),
    [],
  )
}

const EMPLOYER_ROW_H = 24
const ROW_GAP = 6
const YEAR_BAR_H = 3
const YEAR_BAR_GAP = 1.5
const YEAR_BLOCK_PAD = 10
const MARK_ROW_H = 22

type Row =
  | { kind: 'employer'; height: number; line: EmployerLine }
  | { kind: 'year'; height: number; year: number; stores: { slug: string; name: string; start: number; end: number }[] }
  | { kind: 'products' }
  | { kind: 'personal' }

/**
 * Apple's replacement for the shared Years.tsx: the same registry as a real Gantt ribbon instead of
 * editorial rows. One lane per employer (roles as long bars, company + title), storefront builds
 * stacked underneath grouped by year (one thin bar per build window), products and side projects as
 * dots at their year. The axis turns vertical on phones — same geometry as CareerSubway's flip, one
 * more axis of data stacked onto it.
 */
export function BuildTimeline({ skin, heading }: BuildTimelineProps) {
  const { strings, registry, formatPeriod } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const bt = strings.sections.buildTimeline
  const lines = useEmployerLines()
  const yearBlocks = useYearBlocks()
  const containerRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null)

  const rows: Row[] = useMemo(() => {
    const out: Row[] = []
    lines.forEach((line) => out.push({ kind: 'employer', height: EMPLOYER_ROW_H, line }))
    yearBlocks.forEach(({ year, stores }) => out.push({ kind: 'year', height: Math.max(EMPLOYER_ROW_H * 0.6, stores.length * (YEAR_BAR_H + YEAR_BAR_GAP) + YEAR_BLOCK_PAD), year, stores }))
    out.push({ kind: 'products' }, { kind: 'personal' })
    return out
  }, [lines, yearBlocks])

  const rowTop: number[] = []
  {
    let y = 0
    for (const r of rows) {
      rowTop.push(y)
      y += (r.kind === 'employer' || r.kind === 'year' ? r.height : MARK_ROW_H) + ROW_GAP
    }
  }
  const rowH = (r: Row) => (r.kind === 'employer' || r.kind === 'year' ? r.height : MARK_ROW_H)
  const rowCenter = (i: number) => rowTop[i] + rowH(rows[i]) / 2
  const rowDim = (rowTop[rowTop.length - 1] ?? 0) + rowH(rows[rows.length - 1]) - ROW_GAP + 24

  const padStart = wide ? 132 : 30
  const padEnd = wide ? 28 : 16
  const timeDim = wide ? 760 : 640
  const W = wide ? timeDim : rowDim + 36
  const H = wide ? rowDim + 18 : timeDim

  const scaleTime = (t: number) => padStart + (t / TOTAL_MONTHS) * (timeDim - padStart - padEnd)
  const pt = (t: number, r: number): [number, number] => (wide ? [scaleTime(t), r] : [r, scaleTime(t)])

  const spreadByYear = <T extends { year: number }>(items: T[]) =>
    items.map((p) => {
      const sameYear = items.filter((x) => x.year === p.year)
      const idx = sameYear.indexOf(p)
      const spread = sameYear.length > 1 ? (idx / (sameYear.length - 1)) * 10 - 5 : 0
      return { ...p, t: monthIndex(`${p.year}-06`) + spread }
    })
  const productDots = spreadByYear(registry.products)
  const personalDots = spreadByYear(registry.personalProjects)

  const showTip = (e: { currentTarget: Element }, text: string) => {
    const cRect = containerRef.current?.getBoundingClientRect()
    const tRect = e.currentTarget.getBoundingClientRect()
    if (!cRect) return
    setTip({ x: tRect.left - cRect.left + tRect.width / 2, y: tRect.top - cRect.top, text })
  }
  const hideTip = () => setTip(null)

  // SVG paint (stroke/fill) as an inline color, not a Tailwind class built from `skin.accentBg` at
  // runtime: Tailwind's JIT scanner reads source text, so a class only ever assembled via string
  // concat (`.replace('bg-','stroke-')`) never gets generated and silently renders `stroke:none`.
  // `accentBg` is always `bg-[#hex]` for every skin this component ships with (Apple); `currentColor`
  // is the safe fallback if that ever changes.
  const accentColor = skin.accentBg.match(/\[(#[0-9a-fA-F]{3,8})\]/)?.[1] ?? 'currentColor'
  const barFillStyle = { fill: accentColor }
  const barStrokeStyle = { stroke: accentColor }

  // The a11y summary + hidden table mirror the exact records the bars draw — never a separate description.
  const roleAria = (title: string, company: string, period: string) => bt.roleAria.replace('{title}', title).replace('{company}', company).replace('{period}', period)
  const buildAria = (name: string, period: string) => bt.buildAria.replace('{name}', name).replace('{period}', period)
  const dotAria = (name: string, year: number) => bt.dotAria.replace('{name}', name).replace('{year}', String(year))

  const summary = [
    ...lines.flatMap((l) => l.segments.map((s) => roleAria(strings.experience[s.id].title, l.company, formatPeriod(registry.experience.find((e) => e.id === s.id)!.start, registry.experience.find((e) => e.id === s.id)!.end)))),
    ...yearBlocks.flatMap((b) => b.stores.map((s) => buildAria(s.name, String(b.year)))),
    ...registry.products.map((p) => dotAria(p.name, p.year)),
    ...registry.personalProjects.map((p) => dotAria(p.name, p.year)),
  ].join('; ')

  return (
    <section id="years" className="scroll-mt-20">
      {heading(bt.eyebrow, bt.title, bt.titleAccent, bt.lead)}

      <div ref={containerRef} className="relative -mx-4 overflow-x-auto px-4">
        <svg viewBox={`0 0 ${W} ${H}`} className={wide ? 'w-full min-w-[680px]' : 'mx-auto block h-auto w-full max-w-[360px]'} role="img" aria-label={`${bt.eyebrow}: ${summary}`}>
          {/* year ticks along the time axis */}
          {YEARS.map((y) => {
            const t = monthIndex(`${y}-01`)
            const [x, yy] = wide ? [scaleTime(t), rowDim + 2] : [rowDim + 2, scaleTime(t)]
            return (
              <text key={y} x={x} y={yy} textAnchor={wide ? 'start' : 'end'} dominantBaseline={wide ? undefined : 'middle'} style={{ fontSize: 10, fill: 'currentColor' }} className={skin.muted}>
                {y}
              </text>
            )
          })}

          {/* the current month, marked once for the whole ribbon */}
          {(() => {
            const [x1, y1] = pt(NOW_IDX + 0.5, wide ? 0 : 0)
            const [x2, y2] = pt(NOW_IDX + 0.5, wide ? rowDim : rowDim)
            return (
              <g className={skin.accent}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.5} strokeDasharray="2 3" stroke="currentColor" opacity={0.7} />
                <text x={wide ? x1 : x1 + 4} y={wide ? y1 - 6 : y1 + 4} textAnchor={wide ? 'middle' : 'start'} style={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}>
                  {bt.current}
                </text>
              </g>
            )
          })()}

          {rows.map((row, ri) => {
            const cy = rowCenter(ri)
            if (row.kind === 'employer') {
              const { line } = row
              return (
                <g key={`emp-${line.company}`}>
                  <text
                    x={wide ? padStart - 12 : cy}
                    y={wide ? cy : padStart - 12}
                    textAnchor={wide ? 'end' : 'middle'}
                    dominantBaseline={wide ? 'middle' : undefined}
                    className={skin.title}
                    style={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }}
                  >
                    {wide ? line.company : line.company.slice(0, 3).toUpperCase()}
                  </text>
                  {line.segments.map((seg) => {
                    const exp = registry.experience.find((e) => e.id === seg.id)!
                    const label = roleAria(strings.experience[seg.id].title, line.company, formatPeriod(exp.start, exp.end))
                    const [x1, y1] = pt(seg.start, cy)
                    const [x2, y2] = pt(seg.end, cy)
                    const barW = EMPLOYER_ROW_H * 0.55
                    return (
                      <m.g key={seg.id} tabIndex={0} role="img" aria-label={label} className="cursor-default outline-none" onMouseEnter={(e) => showTip(e, label)} onFocus={(e) => showTip(e, label)} onMouseLeave={hideTip} onBlur={hideTip}>
                        {/* Invisible wider stroke = the real hit target (a mouse/touch never has to land on the
                            visible 13px bar); capped at the row's own height so it never bleeds into the row
                            above/below. Still short of 44px in a 5-row-per-screen ribbon — the accessible
                            record is the sr-only table below, this is a reach, not the only path to the data. */}
                        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={EMPLOYER_ROW_H - 2} strokeLinecap="round" stroke="transparent" />
                        <m.line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          strokeWidth={barW}
                          strokeLinecap="round"
                          style={{ ...barStrokeStyle, opacity: seg.current ? 1 : 0.62 }}
                          initial={reduced ? false : { pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true, margin: '-40px' }}
                          transition={{ duration: 0.6, delay: 0.05 + ri * 0.03, ease: EASE }}
                        >
                          <title>{label}</title>
                        </m.line>
                      </m.g>
                    )
                  })}
                </g>
              )
            }
            if (row.kind === 'year') {
              const yTop = rowTop[ri] + YEAR_BLOCK_PAD / 2
              return (
                <g key={`yr-${row.year}`}>
                  <text
                    x={wide ? padStart - 12 : cy}
                    y={wide ? rowTop[ri] + 9 : padStart - 12}
                    textAnchor={wide ? 'end' : 'middle'}
                    className={skin.muted}
                    style={{ fontSize: 10, fontWeight: 600, fill: 'currentColor' }}
                  >
                    {wide ? `${row.year} · ${bt.storefronts}` : row.year}
                  </text>
                  {/* Storefront-build bars stack at (YEAR_BAR_H + YEAR_BAR_GAP) = 4.5px pitch — up to 18 in
                      one year (2026) — so there is no room to widen the hit target without one bar's hover
                      stealing the next one's hover. Left at the drawn 3px width; the sr-only table below and
                      the always-visible "{year} · storefronts" label carry the record on touch/keyboard. */}
                  {row.stores.map((s, si) => {
                    const barCenter = wide ? yTop + si * (YEAR_BAR_H + YEAR_BAR_GAP) + YEAR_BAR_H / 2 : cy
                    const label = buildAria(s.name, String(row.year))
                    const [x1, y1] = wide ? [scaleTime(s.start), barCenter] : [barCenter - (row.stores.length * (YEAR_BAR_H + YEAR_BAR_GAP)) / 2 + si * (YEAR_BAR_H + YEAR_BAR_GAP), scaleTime(s.start)]
                    const [x2, y2] = wide ? [scaleTime(s.end), barCenter] : [x1, scaleTime(s.end)]
                    return (
                      <line
                        key={s.slug}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeWidth={YEAR_BAR_H}
                        strokeLinecap="round"
                        className="outline-none"
                        style={barStrokeStyle}
                        opacity={0.65}
                        tabIndex={0}
                        role="img"
                        aria-label={label}
                        onMouseEnter={(e) => showTip(e, label)}
                        onFocus={(e) => showTip(e, label)}
                        onMouseLeave={hideTip}
                        onBlur={hideTip}
                      >
                        <title>{label}</title>
                      </line>
                    )
                  })}
                </g>
              )
            }
            const dots = row.kind === 'products' ? productDots : personalDots
            const rowLabel = row.kind === 'products' ? bt.products : bt.personal
            return (
              <g key={row.kind}>
                <text
                  x={wide ? padStart - 12 : cy}
                  y={wide ? cy : padStart - 12}
                  textAnchor={wide ? 'end' : 'middle'}
                  dominantBaseline={wide ? 'middle' : undefined}
                  className={skin.muted}
                  style={{ fontSize: 10, fontWeight: 600, fill: 'currentColor' }}
                >
                  {wide ? rowLabel : rowLabel.slice(0, 4)}
                </text>
                {dots.map((d) => {
                  const label = dotAria(d.name, d.year)
                  const [x, y] = pt(d.t, cy)
                  return (
                    <g key={d.id} tabIndex={0} role="img" aria-label={label} className="cursor-default outline-none" onMouseEnter={(e) => showTip(e, label)} onFocus={(e) => showTip(e, label)} onMouseLeave={hideTip} onBlur={hideTip}>
                      {/* Invisible bigger circle = the real hit target, capped at the row height (MARK_ROW_H)
                          so neighboring dots and the row above/below stay unaffected. */}
                      <circle cx={x} cy={y} r={MARK_ROW_H / 2 - 1} fill="transparent" />
                      <m.circle
                        cx={x}
                        cy={y}
                        r={row.kind === 'products' ? 4 : 3}
                        style={barFillStyle}
                        opacity={row.kind === 'products' ? 1 : 0.6}
                        initial={reduced ? false : { scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.3, delay: 0.1, ease: EASE }}
                      >
                        <title>{label}</title>
                      </m.circle>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>

        {tip && (
          <div
            className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium shadow-lg ${skin.dark ? 'bg-white text-black' : 'bg-black text-white'}`}
            style={{ left: tip.x, top: Math.max(0, tip.y - 8) }}
          >
            {tip.text}
          </div>
        )}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs" aria-hidden="true">
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className={`inline-block h-2.5 w-1 rounded-full ${skin.accentBg}`} /> {bt.employers}
        </li>
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className={`inline-block h-1 w-2.5 rounded-full ${skin.accentBg} opacity-65`} /> {bt.storefronts}
        </li>
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className={`inline-block h-2 w-2 rounded-full ${skin.accentBg}`} /> {bt.products}
        </li>
        <li className={`${skin.muted} inline-flex items-center gap-1.5`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${skin.accentBg} opacity-60`} /> {bt.personal}
        </li>
      </ul>

      {/* `sr-only` on the wrapper (never the table itself) — see StackByYear for why: a table under
          table-layout:auto can force its true unwrapped width past the 1px the utility gives it. */}
      <div className="sr-only">
        <table>
          <caption>{bt.eyebrow}</caption>
          <tbody>
            {lines.flatMap((l) =>
              l.segments.map((s) => {
                const exp = registry.experience.find((e) => e.id === s.id)!
                return (
                  <tr key={s.id}>
                    <th scope="row">{l.company}</th>
                    <td>{roleAria(strings.experience[s.id].title, l.company, formatPeriod(exp.start, exp.end))}</td>
                  </tr>
                )
              }),
            )}
            {yearBlocks.map((b) => (
              <tr key={b.year}>
                <th scope="row">{b.year}</th>
                <td>{b.stores.map((s) => s.name).join(', ') || bt.storefronts}</td>
              </tr>
            ))}
            {registry.products.map((p) => (
              <tr key={p.id}>
                <th scope="row">{bt.products}</th>
                <td>{dotAria(p.name, p.year)}</td>
              </tr>
            ))}
            {registry.personalProjects.map((p) => (
              <tr key={p.id}>
                <th scope="row">{bt.personal}</th>
                <td>{dotAria(p.name, p.year)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
