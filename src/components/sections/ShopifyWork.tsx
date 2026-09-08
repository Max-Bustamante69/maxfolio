import { Suspense, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useContent, useSheetHistory } from '../../hooks'
import { GalleryLightbox, type Skin } from '../gallery'
import { Products } from './Products'
import { useHoverPreview } from '../gallery/HoverPreview'
import { lightboxItems, caseStudyFor, caseStudyLabels, ProjectModal, type SectionHeading } from './Gallery'
import type { StoreEntry, ProductEntry } from '../../data/registry'
import { results as storyResults } from '../../data/results'
import { badText, goodText } from '../gallery/charts'

interface ShopifyWorkProps {
  skin: Skin
  heading: SectionHeading
}

/** Rows shown before "Show all": enough to read the range without scrolling a wall. */
const VISIBLE = 8

/** Feature chips, derived from each store's stack so the vocabulary stays curated and small. */
const FEATURES: { id: string; test: RegExp }[] = [
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'subscriptions', test: /subscription/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|framer|migrat|port/i },
  { id: 'islands', test: /react/i },
  { id: 'tracking', test: /track|pixel|analytics/i },
  { id: 'i18n', test: /bilingual|currency|dual/i },
]

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
  const [feature, setFeature] = useState<string | null>(null)
  const [openStore, setOpenStoreState] = useState<StoreEntry | null>(null)
  const [sheetLoaded, setSheetLoaded] = useState(false)
  const setOpenStore = (st: StoreEntry | null) => {
    if (st) setSheetLoaded(true)
    setOpenStoreState(st)
  }
  const [openProduct, setOpenProduct] = useState<ProductEntry | null>(null)
  // The sheet lives in history: Back closes it, `?store=<slug>` opens it, the link can be copied.
  useSheetHistory(openStore?.slug ?? null, () => setOpenStoreState(null), {
    param: 'store',
    open: (slug) => {
      const st = registry.stores.find((x) => x.slug === slug)
      if (st) setOpenStore(st)
    },
  })
  // Desktop hover: the store's home capture follows the cursor along the row (touch just opens the sheet).
  const preview = useHoverPreview()

  const active = FEATURES.find((f) => f.id === feature)
  const matches = (st: StoreEntry) => !active || st.stack.some((t) => active.test.test(t))
  const fleet = registry.stores.filter((x) => !x.legacy && matches(x))
  const legacy = registry.stores.filter((x) => x.legacy && matches(x))
  const visibleFleet = showAll || active ? fleet : fleet.slice(0, VISIBLE)
  const hidden = registry.stores.length - visibleFleet.length
  const chipFor = (on: boolean) => `${on ? skin.chipOn : skin.chip} compact-touch transition-colors`

  /** The story's headline metric as a small delta chip, so the varied number shows before the sheet opens. */
  const Headline = ({ slug }: { slug: string }) => {
    const story = storyResults[slug]
    const lead = story?.charts.flatMap((ch) => ch.metrics).find((mm) => mm.before > 0)
    if (!story || !lead) return null
    const d = Math.round(((lead.after - lead.before) / lead.before) * 100)
    const good = lead.invert ? d <= 0 : d >= 0
    return (
      <span className={`${skin.chip} mt-1.5 inline-flex items-center gap-1.5`}>
        <span className={`font-semibold tabular-nums ${good ? goodText(skin.dark) : badText(skin.dark)}`}>{d >= 0 ? '+' : '−'}{Math.abs(d)}%</span>
        <span>{cs.metric[lead.id]}</span>
        {story.sample && <span className={skin.muted}>· {cs.sampleBadge}</span>}
      </span>
    )
  }

  const StoreRow = ({ st }: { st: StoreEntry }) => {
    const c = strings.stores[st.slug]
    return (
      <li className={`${skin.rowHover} transition-colors`} {...(st.gallery ? preview.bind(`/gallery/${st.slug}/home-desktop.webp`) : {})}>
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
            <Headline slug={st.slug} />
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

  return (
    <section id="shopify" className="scroll-mt-20">
      {heading(s.eyebrow, s.title, s.titleAccent, s.lead)}
      {preview.node}

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

      {tab === 'stores' && (
        <div className="mb-6 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={s.tabStores}>
          <button type="button" role="radio" aria-checked={feature === null} onClick={() => setFeature(null)} className={chipFor(feature === null)}>
            {s.filterAll}
          </button>
          {FEATURES.filter((f) => registry.stores.some((st) => st.stack.some((t) => f.test.test(t)))).map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={feature === f.id} onClick={() => setFeature(feature === f.id ? null : f.id)} className={chipFor(feature === f.id)}>
              {s.filters[f.id]}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'stores' ? (
          <m.div key="stores" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
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
            <div className={`mt-6 ${active ? 'hidden' : ''}`}>
              <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className={`${showAll ? skin.chip : skin.chipOn} compact-touch press transition-colors`}>
                {showAll ? s.showLess : s.showAll.replace('{n}', String(registry.stores.length))}
                {!showAll && hidden > 0 ? ' ›' : ''}
              </button>
            </div>
          </m.div>
        ) : (
          <m.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Products skin={skin} onOpen={setOpenProduct} />
          </m.div>
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
