import { useContent } from '../../hooks'
import { GlassControls, carouselTokens, type Skin } from '../gallery'
import { Carousel } from '../../vendor/carousel'
import { timeline, type YearEntry } from '../../data/timeline'
import type { SectionHeading } from './Gallery'

interface YearsProps {
  skin: Skin
  heading: SectionHeading
}

/**
 * The career as a rail of years (derived from the registry): the roles running that year, the
 * storefronts whose build touched it, the products and the side projects. House carousel, so it
 * bleeds, snaps and drags like every other rail; the newest year rests first.
 */
export function Years({ skin, heading }: YearsProps) {
  const { strings, formatPeriod } = useContent()
  const y = strings.sections.years
  const cs = strings.sections.caseStudy
  const years = [...timeline].reverse()
  const d = skin.dark
  const card = skin.frame === 'apple' ? `rounded-[22px] ${d ? 'bg-white/5' : 'bg-white shadow-tile'}` : skin.card
  const dot = (s: YearEntry['stores'][number]) => (s.status === 'live' ? 'bg-[#34c759]' : 'bg-[#ff9f0a]')

  return (
    <section id="years" className="scroll-mt-20">
      {heading(y.eyebrow, y.title, y.titleAccent, y.lead)}
      <div className="rail-wide" style={carouselTokens(skin.frame, d)} data-lenis-prevent-wheel>
        <Carousel
          slidesPerView={{ base: 1, md: 2, lg: 3 }}
          gap={24}
          desktopSnap="start"
          trackClassName="py-6 -my-6"
          ariaLabel={y.eyebrow}
          renderControls={(state) => <GlassControls state={state} skin={skin} labels={{ prev: cs.prev, next: cs.next }} />}
        >
          {years.map((entry) => {
            const visible = entry.stores.slice(0, 6)
            const rest = entry.stores.length - visible.length
            return (
              <article key={entry.year} className={`${card} flex h-full flex-col p-6`}>
                <p className="font-sf text-5xl font-semibold tracking-[-0.04em] md:text-6xl">{entry.year}</p>

                <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{y.roles}</p>
                <ul className="mt-1.5 space-y-1.5">
                  {entry.positions.map((p) => (
                    <li key={p.id} className="text-sm leading-snug">
                      <span className={skin.title}>{strings.experience[p.id].title}</span>
                      <span className={`${skin.muted}`}> · {p.company} · {formatPeriod(p.start, p.end)}</span>
                    </li>
                  ))}
                </ul>

                {entry.stores.length > 0 && (
                  <>
                    <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>
                      {y.shipped} · {entry.stores.length}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {visible.map((s) => (
                        <span key={s.slug} className={`${skin.chip} inline-flex items-center gap-1.5`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dot(s)}`} aria-hidden="true" />
                          {s.name}
                        </span>
                      ))}
                      {rest > 0 && <span className={skin.chip}>{y.more.replace('{n}', String(rest))}</span>}
                    </div>
                  </>
                )}

                {entry.products.length > 0 && (
                  <>
                    <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{y.products}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {entry.products.map((p) => (
                        <span key={p.id} className={skin.chip}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {entry.personal.length > 0 && (
                  <>
                    <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`}>{y.side}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {entry.personal.map((p) => (
                        <span key={p.id} className={skin.chip}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </article>
            )
          })}
        </Carousel>
      </div>
    </section>
  )
}
