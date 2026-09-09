import { useState, type CSSProperties } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { RevealText } from '../common'
import type { Skin } from '../gallery'
import { WORK_KINDS, timeline, workCount, workTotal, type WorkKind, type YearEntry } from '../../data/timeline'
import type { SectionHeading } from './Gallery'

interface YearsProps {
  skin: Skin
  heading: SectionHeading
  /** 'rows' (default, Arcade/Persona): the unit chart + editorial rows/scrubber, unchanged.
   *  'lines' (Luxury): the unit chart stays, each year's era line becomes a composed sentence.
   *  'strip' (Brutalist): the unit chart is replaced by a 60-month calendar grid. */
  variant?: 'rows' | 'lines' | 'strip'
  /** Soft UI (Neo): the unit chart's tiles render with the raised/inset depth treatment instead of flat fills. */
  depth?: boolean
}

const EASE = [0.23, 1, 0.32, 1] as const
const NOW_YM = '2026-09'
const STRIP_YEARS = [2022, 2023, 2024, 2025, 2026]
const STRIP_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

/**
 * The career as an editorial timeline derived from the registry, opened by a small real chart
 * (every kind of shipped work whose build touched each year, stacked by kind). Desktop: one hairline
 * row per year, the numeral and its era on the left, roles / storefronts / client projects / products /
 * side projects as sentences on the right. Phones: the same records as a year scrubber with one panel,
 * so five years cost one screen.
 */
export function Years({ skin, heading, variant = 'rows', depth = false }: YearsProps) {
  const { strings, registry, formatPeriod, locale } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const y = strings.sections.years
  const fl = strings.sections.fiveLines
  const ys = strings.sections.yearStrip
  const years = [...timeline].reverse()
  const [picked, setPicked] = useState(years[0].year)
  const dot = (s: YearEntry['stores'][number]) => (s.status === 'live' ? 'bg-[#34c759]' : 'bg-[#ff9f0a]')
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
  const maxTotal = Math.max(1, ...timeline.map(workTotal))
  // One accent, four strengths (opacity classes): the stack reads as one bar whose parts are the kinds of work.
  // Blocks animate scaleX, never opacity, or the inline opacity would erase the strength.
  const kindFill: Record<WorkKind, string> = { stores: skin.accentBg, work: `${skin.accentBg} opacity-70`, products: `${skin.accentBg} opacity-45`, personal: `${skin.accentBg} opacity-25` }
  const kindLabel: Record<WorkKind, string> = { stores: y.shipped, work: y.work, products: y.products, personal: y.side }
  const roleName = (w: YearEntry['work'][number]) => `${strings.roleWork[w.id]} · ${registry.experience.find((e) => e.id === w.role)?.company ?? ''}`

  /** Luxury's "five years in five lines": the same unit-chart counts, spelled out as one sentence. */
  const fiveLineSentence = (entry: YearEntry) => {
    const parts = WORK_KINDS.map((k) => {
      const n = workCount(entry, k)
      if (n === 0) return null
      const kind = fl.kinds[k]
      const word = n === 1 ? kind.one : (fl.numberWords[n] ?? String(n))
      const noun = n === 1 ? kind.singular : kind.plural
      return `${word}${fl.joiner}${noun}`
    }).filter((s): s is string => s !== null)
    if (parts.length === 0) return fl.empty
    const sentence = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(fl.listJoiner) + fl.listFinal + parts[parts.length - 1]
    return sentence.charAt(0).toUpperCase() + sentence.slice(1)
  }

  /** Brutalist's Year Strip: a month is active when a storefront build or a role's window covers it — string compare works because YYYY-MM sorts lexicographically. */
  const monthActive = (ym: string) => registry.stores.some((s) => ym >= s.timeline.start && ym <= s.timeline.end) || registry.experience.some((e) => ym >= e.start && ym <= (e.end ?? NOW_YM))

  const Names = ({ items }: { items: { key: string; name: string; dot?: string }[] }) => (
    <p className="text-base leading-relaxed md:text-lg">
      {items.map((it, i) => (
        <span key={it.key} className="inline-flex items-baseline">
          {it.dot && <span className={`mr-1.5 inline-block h-1.5 w-1.5 self-center rounded-full ${it.dot}`} aria-hidden="true" />}
          <span>{it.name}</span>
          {i < items.length - 1 && <span className={`${skin.muted} mr-2`}>,</span>}
        </span>
      ))}
    </p>
  )

  /**
   * Shipped work per year as a unit chart: one block per project, colored by kind, so two projects in
   * 2022 are two visible blocks and not a sliver against the 27 of 2026. Real counts, the same records
   * as the rows below.
   */
  const UNIT = wide ? 5 : 4
  const GAP = 1.5
  // Depth (Neo): a raised tile per shipped unit, an inset placeholder for every unused slot up to the
  // busiest year — the meter reads "how full" a year is, not just "how tall". Small-scale shadows read
  // off the theme's own tokens (`--neo-shadow-*`), never a hardcoded value, so light/dark stay correct.
  const raisedStyle: CSSProperties = { boxShadow: '2px 2px 5px var(--neo-shadow-dark), -2px -2px 5px var(--neo-shadow-light)' }
  const insetStyle: CSSProperties = { boxShadow: 'inset 1.5px 1.5px 3px var(--neo-shadow-dark), inset -1.5px -1.5px 3px var(--neo-shadow-light)', background: 'var(--neo-surface)' }
  const PerYear = () => (
    <figure className="m-0 mb-10 max-w-xl md:mb-14">
      <figcaption className={label}>{y.perYear}</figcaption>
      <div
        className="mt-3 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${timeline.length}, minmax(0, 1fr))` }}
        role="img"
        aria-label={timeline.map((e) => `${e.year}: ${workTotal(e)} (${WORK_KINDS.filter((k) => workCount(e, k) > 0).map((k) => `${kindLabel[k]} ${workCount(e, k)}`).join(', ')})`).join('; ')}
      >
        {timeline.map((e, i) => {
          const filled = WORK_KINDS.flatMap((k) => Array.from({ length: workCount(e, k) }, (_, u) => ({ k, u })))
          const emptyCount = depth ? Math.max(0, maxTotal - filled.length) : 0
          return (
            <div key={e.year} className="flex flex-col">
              <p className="mb-2 text-sm font-semibold tabular-nums">{workTotal(e)}</p>
              <div className="flex flex-col-reverse justify-start" style={{ height: maxTotal * UNIT + (maxTotal - 1) * GAP, gap: GAP }}>
                {depth &&
                  Array.from({ length: emptyCount }, (_, j) => (
                    <div key={`empty-${j}`} className="w-full shrink-0 rounded-[1px]" style={{ height: UNIT, ...insetStyle }} />
                  ))}
                {filled.map(({ k, u }, j) => (
                  <m.div
                    key={`${k}-${u}`}
                    className={`w-full shrink-0 rounded-[1px] ${kindFill[k]}`}
                    style={{ height: UNIT, transformOrigin: 'left', ...(depth ? raisedStyle : {}) }}
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.06 + j * 0.025, ease: EASE }}
                  />
                ))}
              </div>
              <p className={`${skin.muted} mt-1.5 border-t pt-1.5 text-xs tabular-nums ${skin.line}`}>{e.year}</p>
            </div>
          )
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-hidden="true">
        {WORK_KINDS.map((k) => (
          <li key={k} className={`${skin.muted} inline-flex items-center gap-1.5 text-xs`}>
            <span className={`inline-block h-2 w-2 rounded-[2px] ${kindFill[k]}`} />
            {kindLabel[k]}
          </li>
        ))}
      </ul>
    </figure>
  )

  /**
   * Brutalist's replacement for the unit chart: every month from 2022-01 to 2026-12 as a dense mono
   * grid, one row per year, a cell filled when a storefront build or a role touched that month. The
   * current month gets a red marker regardless of state — "now", not "active".
   */
  const YearStrip = () => {
    const rows = STRIP_YEARS.map((yr) => {
      const cells = STRIP_MONTHS.map((mo) => {
        const ym = `${yr}-${String(mo).padStart(2, '0')}`
        return { ym, active: monthActive(ym), now: ym === NOW_YM }
      })
      return { year: yr, cells, count: cells.filter((c) => c.active).length }
    })
    const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })
    return (
      <figure className="m-0 mb-10 max-w-xl md:mb-14">
        <figcaption className={label}>{ys.legend}</figcaption>
        <div className="mt-3 space-y-[3px]" role="img" aria-label={`${ys.legend}: ${rows.map((r) => `${r.year} — ${r.count} ${ys.countUnit}`).join('; ')}`}>
          {rows.map((r) => (
            <div key={r.year} className="flex items-center gap-2">
              <span className={`w-10 shrink-0 font-mono text-[11px] tabular-nums ${skin.muted}`}>{r.year}</span>
              <div className="grid flex-1 grid-cols-12 gap-[3px]">
                {r.cells.map((c) => {
                  const cellLabel = ys.monthAria.replace('{month}', monthFmt.format(new Date(`${c.ym}-01T12:00:00`))).replace('{state}', c.now ? ys.currentState : c.active ? ys.activeState : ys.inactiveState)
                  return (
                    <m.span
                      key={c.ym}
                      role="img"
                      aria-label={cellLabel}
                      title={cellLabel}
                      className={`aspect-square min-w-[6px] rounded-[1px] ${c.now ? 'bg-red-600' : c.active ? skin.accentBg : skin.dark ? 'bg-stone-700' : 'bg-stone-300'}`}
                      initial={reduced ? false : { opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.2, delay: 0.15 + STRIP_YEARS.indexOf(r.year) * 0.06, ease: EASE }}
                    />
                  )
                })}
              </div>
              <span className={`w-6 shrink-0 text-right font-mono text-[11px] tabular-nums ${skin.muted}`}>{r.count}</span>
            </div>
          ))}
        </div>
        <p className={`mt-3 text-xs ${skin.muted}`}>{ys.countUnit}</p>
        {/* `sr-only` on the wrapper — see StackByYear for why the table itself never gets it directly. */}
        <div className="sr-only">
          <table>
            <caption>{ys.legend}</caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year}>
                  <th scope="row">{r.year}</th>
                  {r.cells.map((c) => (
                    <td key={c.ym}>{ys.monthAria.replace('{month}', c.ym).replace('{state}', c.now ? ys.currentState : c.active ? ys.activeState : ys.inactiveState)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    )
  }

  const Body = ({ entry }: { entry: YearEntry }) => (
    <div className="space-y-6">
      {entry.positions.length > 0 && (
        <div>
          <p className={label}>{y.roles}</p>
          <ul className="mt-2 space-y-1.5">
            {entry.positions.map((p) => (
              <li key={p.id} className="text-lg leading-snug md:text-xl">
                <span className={skin.title}>{strings.experience[p.id].title}</span>
                <span className={skin.muted}>
                  {' '}
                  · {p.company} · {formatPeriod(p.start, p.end)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {entry.stores.length > 0 && (
        <div>
          <p className={label}>
            {y.shipped} · {entry.stores.length}
          </p>
          <div className="mt-2">
            <Names items={entry.stores.map((s) => ({ key: s.slug, name: s.name, dot: dot(s) }))} />
          </div>
        </div>
      )}
      {entry.work.length > 0 && (
        <div>
          <p className={label}>{y.work}</p>
          <div className="mt-2">
            <Names items={entry.work.map((w) => ({ key: w.id, name: roleName(w) }))} />
          </div>
        </div>
      )}
      {entry.products.length > 0 && (
        <div>
          <p className={label}>{y.products}</p>
          <div className="mt-2">
            <Names items={entry.products.map((p) => ({ key: p.id, name: p.name }))} />
          </div>
        </div>
      )}
      {entry.personal.length > 0 && (
        <div>
          <p className={label}>{y.side}</p>
          <div className="mt-2">
            <Names items={entry.personal.map((p) => ({ key: p.id, name: p.name }))} />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <section id="years" className="scroll-mt-20">
      {heading(y.eyebrow, y.title, y.titleAccent, y.lead)}
      {variant === 'strip' ? <YearStrip /> : <PerYear />}

      {wide ? (
        <ol className={`border-t ${skin.line}`}>
          {years.map((entry) => (
            <m.li
              key={entry.year}
              className={`grid gap-5 border-b py-8 md:grid-cols-12 md:gap-8 md:py-12 ${skin.line}`}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="md:col-span-3">
                <p className="font-sf text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums md:text-7xl">
                  <RevealText text={String(entry.year)} />
                </p>
                {variant === 'lines' ? (
                  <p className={`${skin.accent} font-display mt-3 text-base italic leading-snug md:text-lg`}>{fiveLineSentence(entry)}.</p>
                ) : (
                  y.eras[String(entry.year)] && <p className={`${skin.accent} mt-3 text-sm font-medium`}>{y.eras[String(entry.year)]}</p>
                )}
              </div>
              <div className="md:col-span-9">
                <Body entry={entry} />
              </div>
            </m.li>
          ))}
        </ol>
      ) : (
        <div>
          {/* year scrubber */}
          <div className="-mx-4 overflow-x-auto px-4 no-scrollbar" role="tablist" aria-label={y.eyebrow}>
            <div className={`flex gap-1 border-b ${skin.line}`}>
              {years.map((entry) => {
                const active = picked === entry.year
                return (
                  <button
                    key={entry.year}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPicked(entry.year)}
                    className={`press relative shrink-0 px-3 pb-3 pt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] transition-colors duration-150 first:pl-0 ${active ? '' : skin.muted}`}
                  >
                    {active && <m.span layoutId="years-marker" className={`absolute bottom-0 left-0 h-0.5 w-full ${skin.accentBg}`} transition={reduced ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.1 }} />}
                    {entry.year}
                    {workTotal(entry) > 0 && <span className={`${skin.muted} ml-1.5 align-top text-[11px] font-medium`}>{workTotal(entry)}</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={picked} role="tabpanel" className="pt-6" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.28, ease: EASE }}>
              {variant === 'lines' ? (
                <p className={`${skin.accent} font-display mb-5 text-base italic leading-snug`}>{fiveLineSentence(years.find((e) => e.year === picked) ?? years[0])}.</p>
              ) : (
                y.eras[String(picked)] && <p className={`${skin.accent} mb-5 text-sm font-medium`}>{y.eras[String(picked)]}</p>
              )}
              <Body entry={years.find((e) => e.year === picked) ?? years[0]} />
            </m.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
