import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../../hooks'
import type { Skin } from '../../gallery'
import { timeline, WORK_KINDS, workCount, workTotal, type YearEntry } from '../../../data/timeline'
import { EASE, useHighlights, useKindMaps } from './shared'

interface Props {
  skin: Skin
}

const NOW_YM = '2026-09'
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

/**
 * Direction C — "Mapa de actividad": a GitHub-style contribution heatmap, five real years by twelve
 * real months. A month lights up when a storefront build's window or a role's window covers it — the
 * exact same rule Years.tsx's own Brutalist "Year Strip" already uses (`monthActive`, stores + roles,
 * string-compared YYYY-MM), so this direction invents no new notion of "active" and just draws it
 * differently: density at a glance instead of a scrolling rail. Clicking (or focusing) a year row opens
 * a detail panel below with that year's era, real counts and highlights — the same records the default
 * rail's cards show, reached through the map instead of a swipe.
 */
export function ActivityMapLayout({ skin }: Props) {
  const { strings, registry, locale } = useContent()
  const reduced = useReducedMotion()
  const c = strings.sections.chapters
  const y = strings.sections.years
  const ys = strings.sections.yearStrip
  const highlights = useHighlights()
  const { kindFill, kindLabel } = useKindMaps(skin)
  const years = [...timeline].reverse()
  const [selected, setSelected] = useState(years[0]?.year ?? 0)

  const monthActive = (ym: string) => registry.stores.some((s) => ym >= s.timeline.start && ym <= s.timeline.end) || registry.experience.some((e) => ym >= e.start && ym <= (e.end ?? NOW_YM))

  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })

  const rows = years.map((entry, yi) => {
    const cells = MONTHS.map((mo) => {
      const ym = `${entry.year}-${String(mo).padStart(2, '0')}`
      return { ym, active: monthActive(ym), now: ym === NOW_YM }
    })
    return { entry, yi, cells, count: cells.filter((cc) => cc.active).length }
  })

  const detail: YearEntry | undefined = years.find((e) => e.year === selected)
  const filled = detail ? WORK_KINDS.flatMap((k) => Array.from({ length: workCount(detail, k) }, (_, u) => ({ k, u }))) : []

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] no-scrollbar md:mx-0 md:overflow-visible md:px-0 md:[mask-image:none]">
        <div className="min-w-[560px] space-y-1.5" role="group" aria-label={ys.legend}>
          {rows.map((r) => {
            const isSel = selected === r.entry.year
            return (
              <button
                key={r.entry.year}
                type="button"
                onClick={() => setSelected(r.entry.year)}
                onMouseEnter={() => setSelected(r.entry.year)}
                aria-pressed={isSel}
                aria-label={`${r.entry.year}${y.eras[String(r.entry.year)] ? ` — ${y.eras[String(r.entry.year)]}` : ''}: ${r.count} ${ys.countUnit}`}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors duration-150 lg:min-h-0 ${isSel ? (skin.dark ? 'bg-white/[0.06]' : 'bg-black/[0.04]') : ''}`}
              >
                <span className={`w-11 shrink-0 text-sm font-semibold tabular-nums ${isSel ? '' : skin.muted}`}>{r.entry.year}</span>
                <div className="grid flex-1 grid-cols-12 gap-[3px]" aria-hidden="true">
                  {r.cells.map((cell) => (
                    <m.span
                      key={cell.ym}
                      title={`${monthFmt.format(new Date(`${cell.ym}-01T12:00:00`))} — ${cell.now ? ys.currentState : cell.active ? ys.activeState : ys.inactiveState}`}
                      className={`relative aspect-square min-w-[9px] rounded-[2px] ${cell.active || cell.now ? skin.accentBg : skin.dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}
                      style={cell.now ? { boxShadow: `inset 0 0 0 2px ${skin.dark ? '#fff' : '#000'}` } : undefined}
                      initial={reduced ? false : { opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.2, delay: 0.03 * MONTHS.indexOf(Number(cell.ym.slice(5))) + r.yi * 0.05, ease: EASE }}
                    />
                  ))}
                </div>
                <span className={`w-6 shrink-0 text-right text-xs font-semibold tabular-nums ${skin.muted}`}>{r.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <p className={`text-[11px] ${skin.muted}`}>{ys.legend}</p>
        <div className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-[2px] ${skin.dark ? 'bg-white/10' : 'bg-black/[0.06]'}`} aria-hidden="true" />
          <span className={`text-[11px] ${skin.muted}`}>{ys.inactiveState}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-[2px] ${skin.accentBg}`} aria-hidden="true" />
          <span className={`text-[11px] ${skin.muted}`}>{ys.activeState}</span>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {detail && (
          <m.div
            key={detail.year}
            className={`mt-6 rounded-[22px] border p-6 md:p-8 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className={`${skin.headingFont} text-4xl font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-5xl`}>{detail.year}</p>
              {y.eras[String(detail.year)] && <p className={`${skin.accent} text-sm font-medium`}>{y.eras[String(detail.year)]}</p>}
            </div>

            <div className="mt-5 flex h-2.5 flex-wrap content-start gap-[2px]" role="img" aria-label={`${workTotal(detail)} ${y.perYear}`}>
              {filled.length > 0 ? filled.map(({ k, u }) => <span key={`${k}-${u}`} className={`inline-block h-2.5 w-1.5 shrink-0 rounded-[1px] ${kindFill[k]}`} />) : <span className={`text-xs ${skin.muted}`}>—</span>}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span>
                <span className="font-semibold tabular-nums">{detail.positions.length}</span> <span className={skin.muted}>{y.roles}</span>
              </span>
              {WORK_KINDS.map((k) => workCount(detail, k) > 0 && (
                <span key={k}>
                  <span className="font-semibold tabular-nums">{workCount(detail, k)}</span> <span className={skin.muted}>{kindLabel[k]}</span>
                </span>
              ))}
            </div>

            {(highlights.get(detail.year) ?? []).length > 0 && (
              <div className="mt-5">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${skin.muted}`}>{c.highlightsLabel}</p>
                <ul className="mt-2 space-y-1">
                  {(highlights.get(detail.year) ?? []).map((h) => (
                    <li key={h} className="text-sm leading-snug">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
