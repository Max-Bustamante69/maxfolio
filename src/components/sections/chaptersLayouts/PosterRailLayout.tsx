import { useEffect, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useDragRail } from '../../../hooks'
import { RevealText } from '../../common'
import type { Skin } from '../../gallery'
import { timeline, WORK_KINDS, workCount, workTotal, type YearEntry } from '../../../data/timeline'
import { useChaptersRail, useHighlights, useKindMaps, yearAccentColor } from './shared'

interface Props {
  skin: Skin
}

const springSpec = { type: 'spring', bounce: 0, duration: 0.6 } as const

/**
 * Direction B — "Carteles por año": the rail keeps the house drag contract and clamped end (same
 * `useChaptersRail` machinery the default direction uses), but each card becomes a poster with its
 * own identity color derived from the skin's accent — never hand-picked — plus a numeral that drifts
 * a few px against the drag as a subtle parallax. Tapping a poster expands it in place via a shared
 * layout transition to reveal the full highlight list and unit chart; the rest dim; Escape or a tap on
 * the backdrop closes it.
 */
export function PosterRailLayout({ skin }: Props) {
  const { strings } = useContent()
  const reduced = useReducedMotion()
  const c = strings.sections.chapters
  const y = strings.sections.years
  const highlights = useHighlights()
  const { kindFill, kindLabel } = useKindMaps(skin)
  const years = [...timeline].reverse()
  const { railRef, cardRefs, active, goTo } = useChaptersRail(years.length)
  const { handlers: dragHandlers, isDragging } = useDragRail(railRef, { centerSnapBelow: 768 })
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (expanded === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const expandedEntry: YearEntry | undefined = expanded === null ? undefined : years.find((e) => e.year === expanded)
  const expandedColor = expandedEntry ? yearAccentColor(skin, years.findIndex((e) => e.year === expandedEntry.year)) : yearAccentColor(skin, 0)

  const Chart = ({ entry, size }: { entry: YearEntry; size: 'sm' | 'lg' }) => {
    const filled = WORK_KINDS.flatMap((k) => Array.from({ length: workCount(entry, k) }, (_, u) => ({ k, u })))
    return (
      <div className={`flex flex-wrap content-start gap-[2px] ${size === 'lg' ? 'h-3' : 'h-2.5'}`} role="img" aria-label={`${workTotal(entry)} ${y.perYear}`}>
        {filled.length > 0 ? (
          filled.map(({ k, u }) => <span key={`${k}-${u}`} className={`inline-block shrink-0 rounded-[1px] ${size === 'lg' ? 'h-3 w-2' : 'h-2.5 w-1'} ${kindFill[k]}`} />)
        ) : (
          <span className={`text-xs ${skin.muted}`}>—</span>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={railRef}
        data-dd-component="chapters-poster-rail"
        data-dragging={isDragging}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            goTo(active + 1)
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            goTo(active - 1)
          }
        }}
        {...dragHandlers}
        tabIndex={0}
        role="group"
        aria-label={c.eyebrow}
        className="drag-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 outline-none no-scrollbar"
      >
        {years.map((entry, i) => {
          const color = yearAccentColor(skin, i)
          const isOpen = expanded === entry.year
          const dim = expanded !== null && !isOpen
          return (
            <m.button
              key={entry.year}
              type="button"
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              data-idx={i}
              layoutId={`chapters-poster-${entry.year}`}
              layout
              onClick={() => setExpanded(entry.year)}
              aria-label={c.expandAria.replace('{year}', String(entry.year))}
              aria-expanded={isOpen}
              animate={{ opacity: dim ? 0.35 : 1, x: reduced ? 0 : (i - active) * 4 }}
              transition={{ opacity: { duration: 0.25 }, x: { type: 'spring', bounce: 0, duration: 0.5 } }}
              className={`w-[80%] shrink-0 snap-center overflow-hidden rounded-[22px] border p-6 text-left md:w-[46%] md:snap-start md:p-8 lg:w-[calc((100%-2rem)/3.15)] ${skin.line} ${isOpen ? 'invisible' : ''}`}
              style={{ background: `linear-gradient(155deg, ${color.replace(')', ' / 0.16)')}, transparent 65%)` }}
            >
              <p className={`${skin.headingFont} text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums md:text-7xl`} style={{ color }}>
                <RevealText text={String(entry.year)} trigger="load" />
              </p>
              {y.eras[String(entry.year)] && <p className={`mt-2 text-sm font-medium`} style={{ color }}>{y.eras[String(entry.year)]}</p>}
              <div className="mt-5">
                <Chart entry={entry} size="sm" />
              </div>
              <span className={`mt-5 flex h-7 w-7 items-center justify-center rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`} aria-hidden="true">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </m.button>
          )
        })}
      </div>

      <AnimatePresence>
        {expandedEntry && (
          <>
            <m.div
              key="backdrop"
              className={`absolute inset-0 z-30 rounded-[22px] ${skin.dark ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-sm`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              onClick={() => setExpanded(null)}
            />
            <m.div
              key="panel"
              layoutId={`chapters-poster-${expandedEntry.year}`}
              layout
              transition={springSpec}
              className={`absolute inset-x-0 top-0 z-40 max-h-[85vh] overflow-y-auto rounded-[22px] border p-7 md:p-10 ${skin.line} ${skin.dark ? 'bg-[#1d1d1f]' : 'bg-white'}`}
              style={{ background: `linear-gradient(155deg, ${expandedColor.replace(')', ' / 0.16)')}, ${skin.dark ? '#1d1d1f' : '#ffffff'} 55%)` }}
            >
              <button
                type="button"
                onClick={() => setExpanded(null)}
                aria-label={c.collapseAria.replace('{year}', String(expandedEntry.year))}
                className={`press absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <p className={`${skin.headingFont} text-7xl font-semibold leading-none tracking-[-0.05em] tabular-nums md:text-8xl`} style={{ color: expandedColor }}>
                {expandedEntry.year}
              </p>
              {y.eras[String(expandedEntry.year)] && (
                <p className="mt-2 text-base font-medium" style={{ color: expandedColor }}>
                  {y.eras[String(expandedEntry.year)]}
                </p>
              )}

              <div className="mt-6">
                <Chart entry={expandedEntry} size="lg" />
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-hidden="true">
                  {WORK_KINDS.filter((k) => workCount(expandedEntry, k) > 0).map((k) => (
                    <li key={k} className={`${skin.muted} inline-flex items-center gap-1.5 text-xs`}>
                      <span className={`inline-block h-2 w-2 rounded-[2px] ${kindFill[k]}`} />
                      {kindLabel[k]} {workCount(expandedEntry, k)}
                    </li>
                  ))}
                </ul>
              </div>

              {(highlights.get(expandedEntry.year) ?? []).length > 0 && (
                <div className="mt-6">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${skin.muted}`}>{c.highlightsLabel}</p>
                  <ul className="mt-2 space-y-1.5">
                    {(highlights.get(expandedEntry.year) ?? []).map((h) => (
                      <li key={h} className="text-base leading-snug md:text-lg">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
