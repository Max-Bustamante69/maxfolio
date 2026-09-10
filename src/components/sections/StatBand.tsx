import { useRef, useState } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'

/** "18+" → { value: 18, suffix: "+" }; anything that is not a number stays static. */
const parse = (v: string) => {
  const mt = v.match(/^([^\d]*)(\d[\d,.]*)(.*)$/)
  return mt ? { prefix: mt[1], value: Number(mt[2].replace(/,/g, '')), suffix: mt[3] } : null
}

interface StatBandProps {
  skin: Skin
  /** Optional class applied to each stat's wrapper, e.g. a recessed "readout" tile for the Neo theme. */
  tileClassName?: string
}

/**
 * The work in numbers as one typographic band: six numerals on hairlines, no tiles. The numbers
 * count up once when the band scrolls into view; reduced motion (or no JS) shows the final values.
 */
export function StatBand({ skin, tileClassName = '' }: StatBandProps) {
  const { strings, registry } = useContent()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion()
  const s = strings.sections.statBand
  const show = inView || reduced
  // Tap/click toggles the source note on touch and keyboard; :hover (desktop only) reveals it without a tap,
  // and the native `title` is a belt-and-suspenders fallback. Never gated behind a reveal: the note is always
  // in the DOM, just visually collapsed until opened.
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section aria-label={s.label}>
      <div className={`flex items-baseline justify-between gap-4 border-t ${skin.line} pt-4`}>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{s.label}</p>
        <p className={`text-[11px] ${skin.muted}`}>{s.asOf}</p>
      </div>
      {/* Phones: a mono stock-ticker strip (real registry.stats, no invented deltas) reads faster than a cramped 2-col grid. */}
      {/* Three columns, two rows, at every width from md up — never six-across: at least one of these
          six real values ($45k/yr, 10,000+) is long enough that a six-column track overflows its own
          cell into the next one (measured, 2026-09-09), and three keeps every numeral at full size. */}
      <div ref={ref} className={`grid grid-cols-2 border-b md:grid-cols-3 ${skin.line}`}>
        {registry.stats.map((st, i) => {
          // A before→after value ('70→95+') is a range, not a number to count to: it renders as-is.
          const p = st.value.includes('→') ? null : parse(st.value)
          // Phones: 2 columns (hairline between, top rule from the second row). md+: 3 columns, top rule from the fourth cell.
          const cols = [i % 2 !== 0 ? 'border-l pl-4' : 'pl-0', i % 3 !== 0 ? 'md:border-l md:pl-5' : 'md:border-l-0 md:pl-0', i === 2 ? 'border-t md:border-t-0' : i >= 3 ? 'border-t' : ''].join(' ')
          const source = strings.statSources[st.id]
          const open = openId === st.id
          const sourceId = `stat-source-${st.id}`
          return (
            // The card itself is never gated behind a reveal (a whole-cell fade that misses its
            // intersection would leave a blank tile — the same class of bug fixed on the Manifesto
            // band): only the numeral's count-up animates, and it always has real text at rest.
            <m.div
              key={st.id}
              // `min-w-0`: a grid item's default min-width is its content's max-content size, which
              // lets a long unbroken string ("$45k/yr", "10,000+") blow past a minmax(0,1fr) track and
              // paint over the next cell instead of shrinking to fit it (measured, 2026-09-09).
              className={`group relative flex min-w-0 flex-col-reverse py-5 pr-3 md:py-9 md:pr-4 ${cols} ${skin.line} ${tileClassName}`}
              initial={false}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : st.id)}
                aria-expanded={open}
                aria-describedby={sourceId}
                title={source}
                className="press -m-1 block w-full min-w-0 rounded-md p-1 text-left"
              >
                <span className={`${skin.muted} mt-3 block text-sm leading-snug`}>{strings.stats[st.id]}</span>
                <span className="m-0 block whitespace-nowrap text-[1.75rem] font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-4xl md:text-5xl">
                  {p ? (
                    <>
                      <span className="sr-only">{st.value}</span>
                      <span aria-hidden="true">{show ? <CountUp value={p.value} prefix={p.prefix} suffix={p.suffix} delay={i * 0.06} /> : st.value}</span>
                    </>
                  ) : (
                    st.value
                  )}
                </span>
              </button>
              {/* Collapsed by max-height, never by opacity alone, so a screen reader (via aria-describedby)
                  and a hovering/focusing pointer both always reach the same real text. */}
              <p
                id={sourceId}
                className={`mt-1.5 overflow-hidden text-[11px] leading-snug transition-[max-height,opacity] duration-200 ${skin.muted} ${
                  open ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0 md:group-hover:max-h-8 md:group-hover:opacity-100'
                }`}
              >
                <span className="font-semibold">{s.sourceLabel}: </span>
                {source}
              </p>
            </m.div>
          )
        })}
      </div>
      {/* Small print: the band shows measured ranges; exact per-store figures are confidential (client privacy). */}
      <p className={`mt-3 text-[11px] leading-snug ${skin.muted}`}>{s.note}</p>
    </section>
  )
}
