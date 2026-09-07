import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, ProjectModal, GalleryLightbox, type Skin } from '../gallery'
import { shotsFor, lightboxItems, caseStudyFor, type SectionHeading } from './Gallery'
import type { StoreEntry, ProductEntry } from '../../data/registry'

interface ShopifyWorkProps {
  skin: Skin
  heading: SectionHeading
}

/**
 * The index: what each store is, what was built, what it runs on. No screenshots in the rows —
 * the name opens the case-study sheet (carousel + numbers); the Gallery is the visual wall.
 */
export function ShopifyWork({ skin, heading }: ShopifyWorkProps) {
  const { strings, registry, formatPeriod } = useContent()
  const s = strings.sections.shopify
  const g = strings.sections.gallery
  const cs = strings.sections.caseStudy
  const [tab, setTab] = useState<'stores' | 'products'>('stores')
  const [openStore, setOpenStore] = useState<StoreEntry | null>(null)
  const [openProduct, setOpenProduct] = useState<ProductEntry | null>(null)

  const fleet = registry.stores.filter((x) => !x.legacy)
  const legacy = registry.stores.filter((x) => x.legacy)

  const StoreRow = ({ st }: { st: StoreEntry }) => (
    <li className={`grid gap-3 py-5 md:grid-cols-12 md:gap-6 ${skin.rowHover} transition-colors`}>
      <div className="md:col-span-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setOpenStore(st)} className={`${skin.title} press text-left text-base underline-offset-4 hover:underline`}>
            {st.name}
          </button>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${st.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>
            {st.status === 'live' ? strings.badges.live : strings.badges.dev}
          </span>
        </div>
        <p className={`${skin.muted} mt-0.5 text-xs`}>
          {strings.stores[st.slug]?.industry} · {formatPeriod(st.timeline.start, st.timeline.end)} · {strings.badges.roles[st.role]}
        </p>
      </div>
      <div className="md:col-span-6">
        <p className={`${skin.accent} text-sm font-medium`}>{strings.stores[st.slug]?.tagline}</p>
        <p className={`${skin.body} mt-1 text-sm leading-relaxed`}>{strings.stores[st.slug]?.description}</p>
      </div>
      <div className="md:col-span-3">
        <div className="flex flex-wrap gap-1.5">
          {st.stack.map((t) => (
            <span key={t} className={skin.chip}>
              {t}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" onClick={() => setOpenStore(st)} className={`${skin.accent} press text-sm`}>
            {cs.facts} ›
          </button>
          {st.url && (
            <a href={st.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} text-sm`}>
              {s.visit} ›
            </a>
          )}
        </div>
      </div>
    </li>
  )

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
              {fleet.map((st) => (
                <StoreRow key={st.slug} st={st} />
              ))}
            </ul>
            <p className={`${skin.muted} mb-2 mt-10 text-xs uppercase tracking-[0.2em]`}>{s.legacyLabel}</p>
            <ul className={`divide-y border-y ${skin.divider}`}>
              {legacy.map((st) => (
                <StoreRow key={st.slug} st={st} />
              ))}
            </ul>
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

      <ProjectModal
        open={!!openStore}
        data={openStore ? caseStudyFor(openStore, strings, skin, formatPeriod) : null}
        skin={skin}
        labels={{ close: g.close, prev: cs.prev, next: cs.next, home: g.home, pdp: g.pdp, desktop: g.desktop, mobile: g.mobile, facts: cs.facts, results: cs.results, stack: cs.stack, visit: cs.visit }}
        onClose={() => setOpenStore(null)}
      />
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
