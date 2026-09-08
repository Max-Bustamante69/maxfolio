import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../hooks'
import { RevealText } from '../common'
import type { Skin } from '../gallery'
import { timeline, type YearEntry } from '../../data/timeline'
import type { SectionHeading } from './Gallery'

interface YearsProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The career as an editorial timeline derived from the registry. Desktop: one hairline row per year,
 * the numeral set large on the left, roles / storefronts / products / side projects as sentences on
 * the right. Phones: the same records as a year scrubber (chips) with one panel, so five years cost
 * one screen instead of five.
 */
export function Years({ skin, heading }: YearsProps) {
  const { strings, formatPeriod } = useContent()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)', true)
  const y = strings.sections.years
  const years = [...timeline].reverse()
  const [picked, setPicked] = useState(years[0].year)
  const dot = (s: YearEntry['stores'][number]) => (s.status === 'live' ? 'bg-[#34c759]' : 'bg-[#ff9f0a]')
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`

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
                {entry.stores.length > 0 && <p className={`${skin.muted} mt-3 text-sm`}>{y.count.replace('{n}', String(entry.stores.length))}</p>}
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
                    {entry.stores.length > 0 && <span className={`${skin.muted} ml-1.5 align-top text-[11px] font-medium`}>{entry.stores.length}</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={picked} role="tabpanel" className="pt-6" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.28, ease: EASE }}>
              <Body entry={years.find((e) => e.year === picked) ?? years[0]} />
            </m.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
