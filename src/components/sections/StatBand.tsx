import { useRef, useState } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { CountUp } from '../gallery/charts'
import { Ticker } from '../common'
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
  const ref = useRef<HTMLDListElement>(null)
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
      <div className={`rail-wide border-b py-3 md:hidden ${skin.line}`}>
        <Ticker
          variant="stock-ticker"
          duration={30}
          label={s.label}
          items={registry.stats}
          keyOf={(st) => st.id}
          itemClassName={`flex shrink-0 items-baseline gap-2 whitespace-nowrap px-5 py-1 text-sm ${skin.muted}`}
          renderItem={(st) => (
            <>
              <span className="uppercase tracking-[0.12em]">{strings.stats[st.id]}</span>
              <span className="text-base font-semibold tabular-nums text-current">{st.value}</span>
            </>
          )}
        />
      </div>
      {/* Three columns, two rows, at every width from md up — never six-across: at least one of these
          six real values ($45k/yr, 10,000+) is long enough that a six-column track overflows its own
          cell into the next one (measured, 2026-09-09), and three keeps every numeral at full size. */}
      <dl ref={ref} className={`hidden border-b md:grid md:grid-cols-3 ${skin.line}`}>
        {registry.stats.map((st, i) => {
          const p = parse(st.value)
          const cols = [i % 3 !== 0 ? 'md:border-l md:pl-5' : 'md:pl-0', i >= 3 ? 'md:border-t' : ''].join(' ')
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
              className={`group relative flex min-w-0 flex-col-reverse py-7 pr-4 md:py-9 ${cols} ${skin.line} ${tileClassName}`}
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
                <dt className={`${skin.muted} mt-3 text-sm leading-snug`}>{strings.stats[st.id]}</dt>
                <dd className="m-0 whitespace-nowrap text-4xl font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-5xl">
                  {p ? (
                    <>
                      <span className="sr-only">{st.value}</span>
                      <span aria-hidden="true">{show ? <CountUp value={p.value} prefix={p.prefix} suffix={p.suffix} delay={i * 0.06} /> : st.value}</span>
                    </>
                  ) : (
                    st.value
                  )}
                </dd>
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
      </dl>
    </section>
  )
}
