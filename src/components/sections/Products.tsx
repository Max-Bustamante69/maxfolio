import { useEffect, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, type Skin } from '../gallery'
import { shotsFor } from './Gallery'
import type { ProductEntry } from '../../data/registry'

/** A real link into this rail from elsewhere on the page (the orbit skill layout, see
 *  src/lib/sectionLinks.ts): which product to select. `nonce` changes on every request, including a
 *  repeat request for the same id already selected, so the effect below always re-applies it. */
export interface ProductSelectRequest {
  id: string
  nonce: number
}

interface ProductsProps {
  skin: Skin
  onOpen: (p: ProductEntry) => void
  select?: ProductSelectRequest | null
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The apps and the platform as a split: a hairline rail of products on the left (a horizontal strip
 * on phones), one editorial panel on the right with the capture, the description and the stack as
 * a line of text — the same shape as Experience, so the page reads as one system, not five tiles.
 */
export function Products({ skin, onOpen, select }: ProductsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const s = strings.sections.shopify
  const g = strings.sections.gallery
  const [current, setCurrent] = useState(registry.products[0])
  const c = strings.products[current.id]

  useEffect(() => {
    if (!select) return
    const p = registry.products.find((x) => x.id === select.id)
    if (p) setCurrent(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [select?.id, select?.nonce])

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:col-span-4 lg:mx-0 lg:overflow-visible lg:px-0" role="tablist" aria-label={s.tabProducts}>
        <div className={`flex gap-1 border-b lg:flex-col lg:gap-0 lg:border-b-0 lg:border-l ${skin.line}`}>
          {registry.products.map((p) => {
            const active = current.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCurrent(p)}
                className={`press relative shrink-0 py-3 pr-4 text-left transition-colors duration-150 lg:w-full lg:py-3.5 lg:pl-5 ${active ? '' : skin.muted}`}
              >
                {active && (
                  <m.span
                    layoutId="products-marker"
                    className={`absolute bottom-0 left-0 h-0.5 w-full lg:bottom-auto lg:top-0 lg:h-full lg:w-0.5 ${skin.accentBg}`}
                    transition={reduced ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.1 }}
                  />
                )}
                <span className="block text-sm font-semibold leading-snug">{p.name}</span>
                <span className={`${skin.muted} mt-0.5 block text-xs`}>{strings.products[p.id]?.tagline}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-8">
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={current.id} role="tabpanel" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.28, ease: EASE }}>
            {current.gallery && (
              <div className="mb-8 max-w-xl">
                <ProjectFrame name={current.name} shots={shotsFor(current.id, false)} skin={skin} onOpen={() => onOpen(current)} alt={g.open} variant="laptop" />
              </div>
            )}
            <h3 className={`${skin.title} text-2xl leading-tight md:text-3xl`}>{current.name}</h3>
            <p className={`${skin.accent} mt-1 text-sm font-medium`}>{c?.tagline}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg">{c?.description}</p>
            <p className={`${skin.muted} mt-5 text-sm`}>
              <span className="font-semibold">{strings.sections.caseStudy.stack}:</span> {current.stack.join(' · ')}
            </p>
            {current.url && (
              <a href={current.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} mt-4 inline-block text-sm font-medium`}>
                {s.visit} ›
              </a>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
