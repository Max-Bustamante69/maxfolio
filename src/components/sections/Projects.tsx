import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface ProjectsProps {
  skin: Skin
  heading: SectionHeading
}

const EASE = [0.23, 1, 0.32, 1] as const

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12 12 4M6 4h6v6" />
  </svg>
)

/** First letters of up to two words — no invented screenshot exists for these projects, so the hover reveal is typographic, not a fabricated preview. */
const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Side projects as an index: a numbered hairline list, one line each, the whole row a link. */
export function Projects({ skin, heading }: ProjectsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const pr = strings.sections.projects
  const items = [...registry.personalProjects].sort((a, b) => b.year - a.year)

  return (
    <section id="projects" className="scroll-mt-20">
      {heading(pr.eyebrow, pr.title, pr.titleAccent)}
      <ol className={`border-t ${skin.line}`}>
        {items.map((p, i) => {
          const c = strings.projects[p.id]
          return (
            <m.li
              key={p.id}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
            >
              <a
                href={p.url ?? p.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${pr.view}: ${p.name}`}
                className={`group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 border-b py-6 md:grid-cols-[3rem_1fr_auto] md:gap-6 md:py-7 ${skin.line} ${skin.rowHover} transition-colors`}
              >
                <span className={`${skin.muted} text-sm tabular-nums`}>{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h3 className={`${skin.title} text-xl leading-tight transition-transform duration-200 ease-out-strong group-hover:translate-x-1 md:text-2xl`}>
                    {p.name}
                    {c?.tagline && <span className={`${skin.accent} ml-2 text-base font-medium`}>{c.tagline}</span>}
                  </h3>
                  {c?.description && <p className={`${skin.muted} mt-1.5 text-sm leading-relaxed md:text-base`}>{c.description}</p>}
                  <p className={`${skin.muted} mt-1.5 text-xs`}>{p.stack.join(' · ')}</p>
                </div>
                <span className={`${skin.muted} flex items-center gap-4 text-sm tabular-nums`}>
                  {/* Clip-path reveal on hover: an accent monogram (typographic, not a fabricated screenshot — these projects have no real capture) circles open from its center. */}
                  <span
                    aria-hidden="true"
                    className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white transition-[clip-path] duration-500 ease-out-strong [clip-path:circle(0%_at_50%_50%)] md:flex [@media(hover:hover)]:group-hover:[clip-path:circle(75%_at_50%_50%)] ${skin.accentBg}`}
                  >
                    {initials(p.name)}
                  </span>
                  <span className="hidden sm:inline">{p.year}</span>
                  <span className="transition-transform duration-200 ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <Arrow />
                  </span>
                </span>
              </a>
            </m.li>
          )
        })}
      </ol>
    </section>
  )
}
