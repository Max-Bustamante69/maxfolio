import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { CountUp } from '../gallery/charts'
import type { Skin } from '../gallery'

const EASE = [0.23, 1, 0.32, 1] as const

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

  return (
    <section aria-label={s.label}>
      <div className={`flex items-baseline justify-between gap-4 border-t ${skin.line} pt-4`}>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{s.label}</p>
        <p className={`text-[11px] ${skin.muted}`}>{s.asOf}</p>
      </div>
      <dl ref={ref} className={`grid grid-cols-2 border-b md:grid-cols-3 lg:grid-cols-6 ${skin.line}`}>
        {registry.stats.map((st, i) => {
          const p = parse(st.value)
          const cols = [
            i % 2 === 1 ? 'border-l pl-5' : 'pl-0',
            i % 3 !== 0 ? 'md:border-l md:pl-5' : 'md:border-l-0 md:pl-0',
            i > 0 ? 'lg:border-l lg:pl-5' : 'lg:border-l-0 lg:pl-0',
            i >= 2 ? 'border-t' : 'border-t-0',
            i >= 3 ? 'md:border-t' : 'md:border-t-0',
            'lg:border-t-0',
          ].join(' ')
          return (
            <m.div
              key={st.id}
              className={`flex flex-col-reverse py-7 pr-4 md:py-9 ${cols} ${skin.line} ${tileClassName}`}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}
            >
              <dt className={`${skin.muted} mt-3 text-sm leading-snug`}>{strings.stats[st.id]}</dt>
              <dd className="m-0 text-5xl font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-6xl">
                {p ? (
                  <>
                    <span className="sr-only">{st.value}</span>
                    <span aria-hidden="true" className={show ? '' : 'opacity-0'}>
                      {show ? <CountUp value={p.value} prefix={p.prefix} suffix={p.suffix} delay={i * 0.06} /> : st.value}
                    </span>
                  </>
                ) : (
                  st.value
                )}
              </dd>
            </m.div>
          )
        })}
      </dl>
    </section>
  )
}
