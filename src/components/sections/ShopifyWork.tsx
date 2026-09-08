import { Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, GalleryLightbox, type Skin } from '../gallery'
import { shotsFor, lightboxItems, caseStudyFor, caseStudyLabels, ProjectModal, type SectionHeading } from './Gallery'
import type { StoreEntry, ProductEntry } from '../../data/registry'

interface ShopifyWorkProps {
  skin: Skin
  heading: SectionHeading
}

/** Rows shown before "Show all": enough to read the range without scrolling a wall. */
const VISIBLE = 8

/**
 * The index: one line per store — name, what it is, when, and the one-sentence tagline. Everything
 * else (description, Lighthouse, facts, stack, captures) lives in the case-study sheet the name
 * opens, so the section stays scannable. The Gallery is the visual wall.
 */
export function ShopifyWork({ skin, heading }: ShopifyWorkProps) {
  const { strings, registry, formatPeriod } = useContent()
  const s = strings.sections.shopify
  const g = strings.sections.gallery
  const cs = strings.sections.caseStudy
  const [tab, setTab] = useState<'stores' | 'products'>('stores')
  const [showAll, setShowAll] = useState(false)
  const [openStore, setOpenStoreState] = useState<StoreEntry | null>(null)
  const [sheetLoaded, setSheetLoaded] = useState(false)
  const setOpenStore = (st: StoreEntry | null) => {
    if (st) setSheetLoaded(true)
    setOpenStoreState(st)
  }
  const [openProduct, setOpenProduct] = useState<ProductEntry | null>(null)

  const fleet = registry.stores.filter((x) => !x.legacy)
  const legacy = registry.stores.filter((x) => x.legacy)
  const visibleFleet = showAll ? fleet : fleet.slice(0, VISIBLE)
  const hidden = registry.stores.length - visibleFleet.length

  const StoreRow = ({ st }: { st: StoreEntry }) => {
    const c = strings.stores[st.slug]
    return (
      <li className={`${skin.rowHover} transition-colors`}>
        <div className="grid gap-x-6 gap-y-1.5 py-4 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setOpenStore(st)} className={`${skin.title} press text-left text-[15px] underline-offset-4 hover:underline`}>
                {st.name}
              </button>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${st.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>
                {st.status === 'live' ? strings.badges.live : strings.badges.dev}
              </span>
            </div>
            <p className={`${skin.muted} mt-0.5 text-xs`}>
              {c?.industry} · {formatPeriod(st.timeline.start, st.timeline.end)}
            </p>
          </div>
          <p className={`${skin.body} text-sm leading-snug md:col-span-5 md:line-clamp-2`}>{c?.tagline}</p>
          <div className="flex items-center gap-x-4 text-sm md:col-span-3 md:justify-end">
            <button type="button" onClick={() => setOpenStore(st)} className={`${skin.accent} press compact-touch inline-flex items-center whitespace-nowrap`}>
              {cs.open} ›
            </button>
            {st.url && (
              <a href={st.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} compact-touch inline-flex items-center whitespace-nowrap`}>
                {s.visit} ›
              </a>
            )}
          </div>
        </div>
      </li>
    )
  }

  const ProductCard = ({ p }: { p: ProductEntry }) => (
    <article className={`${skin.card} p-5`}>
      {p.gallery && <ProjectFrame name={p.name} shots={shotsFor(p.id, false)} skin={skin} onOpen={() => setOpenProduct(p)} alt={g.open} variant="laptop" />}
      <div className={p.gallery ? 'mt-5' : ''}>
        <h3 className={`${skin.title} text-lg`}>{p.name}</h3>
        <p className={`${skin.accent} text-sm`}>{strings.products[p.id]?.tagline}</p>
        <p className={`${skin.body} mt-2 text-sm leading-relaxed`}>{strings.products[p.id]?.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.stack.map((t) => (
            <span key={t} className={skin.chip}>
              {t}
            </span>
          ))}
        </div>
        {p.url && (
          <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} mt-3 inline-block text-sm`}>
            {s.visit} ›
          </a>
        )}
      </div>
    </article>
  )

  return (
    <section id="shopify" className="scroll-mt-20">
      {heading(s.eyebrow, s.title, s.titleAccent, s.lead)}

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label={s.eyebrow}>
        {(['stores', 'products'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`${tab === k ? skin.chipOn : skin.chip} compact-touch transition-colors`}
          >
            {k === 'stores' ? `${s.tabStores} · ${registry.stores.length}` : `${s.tabProducts} · ${registry.products.length}`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'stores' ? (
          <motion.div key="stores" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <ul className={`divide-y border-y ${skin.divider}`}>
              {visibleFleet.map((st) => (
                <StoreRow key={st.slug} st={st} />
              ))}
            </ul>
            {showAll && legacy.length > 0 && (
              <>
                <p className={`${skin.muted} mb-2 mt-10 text-xs uppercase tracking-[0.2em]`}>{s.legacyLabel}</p>
                <ul className={`divide-y border-y ${skin.divider}`}>
                  {legacy.map((st) => (
                    <StoreRow key={st.slug} st={st} />
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6">
              <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className={`${showAll ? skin.chip : skin.chipOn} compact-touch press transition-colors`}>
                {showAll ? s.showLess : s.showAll.replace('{n}', String(registry.stores.length))}
                {!showAll && hidden > 0 ? ' ›' : ''}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {registry.products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {sheetLoaded && (
        <Suspense fallback={null}>
          <ProjectModal
            open={!!openStore}
            data={openStore ? caseStudyFor(openStore, strings, skin, formatPeriod) : null}
            skin={skin}
            labels={caseStudyLabels(strings)}
            onClose={() => setOpenStore(null)}
          />
        </Suspense>
      )}
      <GalleryLightbox
        open={!!openProduct}
        title={openProduct?.name ?? ''}
        items={openProduct ? lightboxItems(openProduct.id, g, false) : []}
        onClose={() => setOpenProduct(null)}
        closeLabel={g.close}
      />
    </section>
  )
}
