import { Suspense, useEffect, useState, type MouseEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useContent, useSheetHistory } from '../../hooks'
import { GalleryLightbox, type Skin } from '../gallery'
import { Products, type ProductSelectRequest } from './Products'
import { useHoverPreview } from '../gallery/HoverPreview'
import { lightboxItems, caseStudyFor, caseStudyLabels, ProjectModal, type SectionHeading } from './Gallery'
import type { StoreEntry, ProductEntry } from '../../data/registry'
import { conversionSeries } from '../../data/illustrative'
import { onRequestProduct, onRequestStore, scrollToSection, setCaseStudyVisible } from '../../lib/sectionLinks'

/** How long a row's accent flash stays visible after the orbit links here — long enough to read as
 *  "this is the one that just opened", short enough to not linger once the shopper has moved on. */
const HIGHLIGHT_MS = 1500

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
  const { strings, registry, formatPeriod, intlLocale, monthFmt } = useContent()
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
  // Broadcasts this sheet's own visibility so a caller that opened it from elsewhere on the page (a
  // capture tile inside the skills orbit's `ToolDrawer`) can hide itself while this sheet is up —
  // one modal dialog at a time — see `sectionLinks.ts`.
  useEffect(() => {
    setCaseStudyVisible(!!openStore)
    return () => setCaseStudyVisible(false)
  }, [openStore])
  // Desktop hover: the store's home capture follows the cursor along the row (touch just opens the sheet).
  const preview = useHoverPreview()

  // A real link into this section from elsewhere on the page (currently the orbit skill layout's
  // preview/center card, see src/lib/sectionLinks.ts): a store opens the exact same case-study sheet
  // the index itself opens (reusing `setOpenStore` → `useSheetHistory` above, never a forked
  // mechanism), a product switches to the products tab and selects it in `Products`' own rail. Both
  // also clear any active row filter/collapse so the target row is genuinely visible, not just
  // technically open behind the sheet, and flash the row's accent color for `HIGHLIGHT_MS`.
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null)
  const [productSelect, setProductSelect] = useState<ProductSelectRequest | null>(null)
  useEffect(() => {
    const offStore = onRequestStore(({ slug }) => {
      const st = registry.stores.find((x) => x.slug === slug)
      setTab('stores')
      setFeature(null)
      setShowAll(true)
      scrollToSection('shopify')
      if (st) setOpenStore(st)
      setHighlightSlug(slug)
      window.setTimeout(() => setHighlightSlug((prev) => (prev === slug ? null : prev)), HIGHLIGHT_MS)
    })
    const offProduct = onRequestProduct(({ id }) => {
      setTab('products')
      scrollToSection('shopify')
      setProductSelect({ id, nonce: Date.now() })
    })
    return () => {
      offStore()
      offProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry.stores])

  const active = FEATURES.find((f) => f.id === feature)
  const matches = (st: StoreEntry) => !active || st.stack.some((t) => active.test.test(t))
  const fleet = registry.stores.filter((x) => !x.legacy && matches(x))
  const legacy = registry.stores.filter((x) => x.legacy && matches(x))
  const visibleFleet = showAll || active ? fleet : fleet.slice(0, VISIBLE)
  const hidden = registry.stores.length - visibleFleet.length
  const chipFor = (on: boolean) => `${on ? skin.chipOn : skin.chip} compact-touch transition-colors`

  // Prev/Next inside the sheet cycle through exactly the rows this list currently renders (the
  // visible fleet, plus the legacy rows once "Show all" reveals them) — wrapping at the ends.
  const orderedList = [...visibleFleet, ...(showAll ? legacy : [])]
  const openIndex = openStore ? orderedList.findIndex((x) => x.slug === openStore.slug) : -1
  const canNavigate = orderedList.length > 1 && openIndex !== -1
  const goPrev = canNavigate ? () => setOpenStore(orderedList[(openIndex - 1 + orderedList.length) % orderedList.length]) : undefined
  const goNext = canNavigate ? () => setOpenStore(orderedList[(openIndex + 1) % orderedList.length]) : undefined

  /** One Impact-block headline figure per store — the same illustrative conversion lift the
   *  case-study sheet leads with (src/data/illustrative.ts conversionSeries), so the index chip and
   *  the sheet it opens tell one consistent story instead of two different numbers. */
  const Headline = ({ st }: { st: StoreEntry }) => {
    const text = cs.impact.indexChip.replace('{pct}', String(conversionSeries(st.slug).deltaPct))
    return <span className={`${skin.chip} mt-1.5 inline-flex items-center gap-1.5`}>{text}</span>
  }

  // A cursor spotlight for pointer devices: a radial highlight that tracks the pointer inside the
  // hovered row via CSS custom properties (no re-render per mousemove) — off on touch by media query.
  const onRowMove = (e: MouseEvent<HTMLLIElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
  }
  const spotColor = skin.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  const StoreRow = ({ st }: { st: StoreEntry }) => {
    const c = strings.stores[st.slug]
    const highlighted = highlightSlug === st.slug
    return (
      <li
        data-orbit-row={st.slug}
        className={`group relative overflow-hidden ${skin.rowHover} transition-colors`}
        onMouseMove={onRowMove}
        {...(st.gallery ? preview.bind(`/gallery/${st.slug}/home-desktop.webp`) : {})}
      >
        {/* Accent flash from an external "open this store" request (the orbit's preview/center card) —
            `currentColor` off `skin.accent` so it matches every theme with zero per-theme code. */}
        <span aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-current transition-opacity duration-500 ${skin.accent} ${highlighted ? 'opacity-[0.12]' : 'opacity-0'}`} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
          style={{ background: `radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${spotColor}, transparent 70%)` }}
        />
        <div className="relative grid gap-x-6 gap-y-1.5 py-4 md:grid-cols-12 md:items-center">
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
            <Headline st={st} />
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
            <Products skin={skin} onOpen={setOpenProduct} select={productSelect} />
          </m.div>
        )}
      </AnimatePresence>

      {sheetLoaded && (
        <Suspense fallback={null}>
          <ProjectModal
            open={!!openStore}
            data={openStore ? caseStudyFor(openStore, strings, skin, formatPeriod, intlLocale, monthFmt) : null}
            skin={skin}
            labels={caseStudyLabels(strings)}
            onClose={() => setOpenStore(null)}
            onPrev={goPrev}
            onNext={goNext}
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
