import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { useContent, useSheetHistory } from '../../hooks'
import { ProjectFrame, GlassControls, carouselTokens, type Skin, type FrameShots, type LightboxItem, type CaseStudyData, type CompareRow } from '../gallery'
import type { CaseStudyLabels } from '../gallery/ProjectModal'
import { Carousel } from '../../vendor/carousel'
import { metrics, stores as allStores, type StoreEntry } from '../../data/registry'
import { telemetry } from '../../data/telemetry'
import { commerce, isLiveCommerce } from '../../data/commerce'
import { computeFleetMedians, formatMoney, lineForAngle, pickCommerceLine, vsFleetPctChip, vsFleetWeeksChip, weeksFor } from '../../data/commerceLines'
import { conversionSeries, lighthouseBeforeScore, revenuePerVisitorSeries } from '../../data/illustrative'
import lighthouseJson from '../../data/lighthouse.json'
import type { PortfolioContent } from '../../content/types'
import type { ImpactCharts } from '../gallery/ProjectModal'

interface LighthouseFormEntry {
  perf: number
  a11y: number
  bp: number
  seo: number
  lcp: number | null
  tbt: number | null
  cls: number | null
  finalUrl: string
}
interface LighthouseStoreEntry {
  fetchedAt: string
  mobile: LighthouseFormEntry | null
  desktop: LighthouseFormEntry | null
}
// `_skipped` is a diagnostics-only sibling key scripts/store-lighthouse.mjs writes alongside the
// per-store entries — never a store slug, so it's dropped by the `mobile`/`desktop` shape check below.
const LIGHTHOUSE = lighthouseJson as unknown as Record<string, LighthouseStoreEntry | unknown>
function lighthouseFor(slug: string): LighthouseStoreEntry | undefined {
  const entry = LIGHTHOUSE[slug]
  return entry && typeof entry === 'object' && 'fetchedAt' in entry ? (entry as LighthouseStoreEntry) : undefined
}

/** "Impact" block data: conversion + revenue-per-visitor are always-present illustrative
 *  representations (see src/data/illustrative.ts); Lighthouse "after" and the LCP gauge are real,
 *  read straight from src/data/lighthouse.json — null piece by piece whenever that store has no
 *  measured score for it, never backfilled with an estimate. */
function impactFor(st: StoreEntry): ImpactCharts {
  const lh = lighthouseFor(st.slug)
  const lighthouse = lh
    ? {
        fetchedAt: lh.fetchedAt,
        mobile: lh.mobile ? { before: lighthouseBeforeScore(st.slug, 'mobile'), after: lh.mobile.perf } : null,
        desktop: lh.desktop ? { before: lighthouseBeforeScore(st.slug, 'desktop'), after: lh.desktop.perf } : null,
      }
    : null
  const speed = lh?.mobile?.lcp != null ? { seconds: lh.mobile.lcp, fetchedAt: lh.fetchedAt } : null
  return { conversion: conversionSeries(st.slug), rpv: revenuePerVisitorSeries(st.slug), lighthouse, speed }
}

// Computed once at module scope: registry/commerce/telemetry are static build-time data, so every
// open sheet compares against the same real fleet snapshot rather than re-deriving it per render.
const FLEET_MEDIANS = computeFleetMedians(allStores, commerce, telemetry)

export type SectionHeading = (eyebrow: string, title: string, accent: string, lead?: string) => ReactNode

/** The case-study sheet (carousel + charts) loads on first open, off the main bundle. */
export const ProjectModal = lazy(() => import('../gallery/ProjectModal').then((m) => ({ default: m.ProjectModal })))

type Filter = 'all' | 'live' | 'dev'
type View = 'carousel' | 'grid' | 'phones'

interface GalleryLabels {
  home: string
  pdp: string
  desktop: string
  mobile: string
}

export const shotsFor = (slug: string, withPdp = true): FrameShots => ({
  homeDesktop: `/gallery/${slug}/home-desktop.webp`,
  homeMobile: `/gallery/${slug}/home-mobile.webp`,
  ...(withPdp ? { pdpDesktop: `/gallery/${slug}/pdp-desktop.webp`, pdpMobile: `/gallery/${slug}/pdp-mobile.webp` } : {}),
})

export const lightboxItems = (slug: string, labels: GalleryLabels, withPdp = true): LightboxItem[] => [
  { key: 'hd', label: `${labels.home} · ${labels.desktop}`, src: `/gallery/${slug}/home-desktop.webp`, kind: 'desktop' },
  ...(withPdp ? [{ key: 'pd', label: `${labels.pdp} · ${labels.desktop}`, src: `/gallery/${slug}/pdp-desktop.webp`, kind: 'desktop' as const }] : []),
  { key: 'hm', label: `${labels.home} · ${labels.mobile}`, src: `/gallery/${slug}/home-mobile.webp`, kind: 'mobile' },
  ...(withPdp ? [{ key: 'pm', label: `${labels.pdp} · ${labels.mobile}`, src: `/gallery/${slug}/pdp-mobile.webp`, kind: 'mobile' as const }] : []),
]

/** The sheet's labels, from the gallery + case-study strings of the active locale. */
export const caseStudyLabels = (strings: PortfolioContent): CaseStudyLabels => {
  const g = strings.sections.gallery
  const cs = strings.sections.caseStudy
  return {
    close: g.close, prev: cs.prev, next: cs.next, home: g.home, pdp: g.pdp, desktop: g.desktop, mobile: g.mobile,
    facts: cs.facts, results: cs.results, stack: cs.stack, visit: cs.visit,
    metrics: cs.metrics, perf: cs.perf, a11y: cs.a11y, bp: cs.bp, seo: cs.seo, lcp: cs.lcp, measured: cs.measured,
    trail: cs.trail, trailNote: cs.trailNote, perWeek: cs.perWeek, peak: cs.peak, codebase: cs.codebase, liquidLines: cs.liquidLines, islandLines: cs.islandLines, sectionsCount: cs.sectionsCount, commits: cs.commits, weeks: cs.weeks,
    copyLink: cs.copyLink, copied: cs.copied,
    commerce: cs.commerce,
    impact: cs.impact,
    charts: cs.charts,
  }
}

/** Parses the registry's `ladder` fact ("10% → 20%") into ascending numbers for the discount-ladder
 *  chart. Returns null for anything that doesn't look like a real percentage ladder. */
function parseLadder(value: string | undefined): number[] | null {
  if (!value) return null
  const nums = [...value.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => Number(m[1]))
  return nums.length >= 2 ? nums : null
}

/** Builds the case-study sheet data for a store from the registry + the active locale. */
export function caseStudyFor(
  st: StoreEntry,
  strings: PortfolioContent,
  skin: Skin,
  formatPeriod: (start: string, end: string | null) => string,
  intlLocale: string,
  monthFmt: Intl.DateTimeFormat,
): CaseStudyData {
  const c = strings.stores[st.slug]
  const cs = strings.sections.caseStudy
  const cm = cs.commerce
  const stats = [
    { label: cs.timeline, value: formatPeriod(st.timeline.start, st.timeline.end) },
    ...st.facts.map((f) => ({ label: c?.factLabels?.[f.id] ?? f.id, value: f.value })),
  ]
  const results = st.results.map((r) => ({ label: c?.factLabels?.[r.id] ?? r.id, value: r.value }))

  // "By the numbers": the four commerce angles, always all four (offer and delivery always
  // resolve; catalog and reach fall back to `unavailable` for a protected/unreachable storefront).
  const commerceEntry = commerce[st.slug]
  const ctx = { store: st, storeContent: c, filters: strings.sections.shopify.filters, cs: cm, commerceEntry, telemetryEntry: telemetry[st.slug], intlLocale, monthFmt }
  const weeks = weeksFor(st, telemetry[st.slug])
  const priceMid = isLiveCommerce(commerceEntry) && commerceEntry.priceMin !== null && commerceEntry.priceMax !== null ? (commerceEntry.priceMin + commerceEntry.priceMax) / 2 : null
  const commerceTiles = [
    {
      label: cm.catalogLabel,
      value: lineForAngle('catalog', ctx) ?? cm.unavailable,
      deltas: [
        isLiveCommerce(commerceEntry) ? vsFleetPctChip(commerceEntry.products, FLEET_MEDIANS.products, cm.vsFleetPct) : null,
        isLiveCommerce(commerceEntry) && commerceEntry.currency && priceMid !== null ? vsFleetPctChip(priceMid, FLEET_MEDIANS.priceMidByCurrency[commerceEntry.currency], cm.vsFleetPct) : null,
      ].filter((d): d is string => !!d),
    },
    { label: cm.offerLabel, value: lineForAngle('offer', ctx, true) ?? cm.offerFallback, deltas: [] },
    {
      label: cm.deliveryLabel,
      value: lineForAngle('delivery', ctx) ?? cm.offerFallback,
      deltas: [vsFleetWeeksChip(weeks, FLEET_MEDIANS.weeks, cm.vsFleetWeeks)].filter((d): d is string => !!d),
    },
    { label: cm.reachLabel, value: lineForAngle('reach', ctx) ?? cm.unavailable, deltas: [] },
  ]

  // The "Visualized" charts block: every field traces to a real source and is left out entirely
  // when that source doesn't have a real number for this store — never a placeholder or estimate.
  const tel = telemetry[st.slug]
  const compare: CompareRow[] = []
  if (FLEET_MEDIANS.weeks != null) {
    const value = weeksFor(st, tel)
    compare.push({ key: 'weeks', label: '', storeValue: value, fleetValue: FLEET_MEDIANS.weeks, displayStore: `${value} ${cs.weeks}`, displayFleet: `${Math.round(FLEET_MEDIANS.weeks)} ${cs.weeks}` })
  }
  if (isLiveCommerce(commerceEntry) && FLEET_MEDIANS.products != null) {
    compare.push({ key: 'products', label: '', storeValue: commerceEntry.products, fleetValue: FLEET_MEDIANS.products, displayStore: String(commerceEntry.products), displayFleet: String(Math.round(FLEET_MEDIANS.products)) })
  }
  if (isLiveCommerce(commerceEntry) && commerceEntry.currency && priceMid !== null) {
    const fleetPriceMid = FLEET_MEDIANS.priceMidByCurrency[commerceEntry.currency]
    if (fleetPriceMid != null) {
      const fmt = (n: number) => formatMoney(n, commerceEntry.currency as string, intlLocale)
      compare.push({ key: 'price', label: '', storeValue: priceMid, fleetValue: fleetPriceMid, displayStore: fmt(priceMid), displayFleet: fmt(fleetPriceMid) })
    }
  }
  const ladderFact = st.facts.find((f) => f.id === 'ladder')

  // Client-facing sheet: the engineering trail (commits, custom sections) stays in the registry but collapsed at the bottom.
  return {
    name: st.name,
    url: st.url || undefined,
    meta: `${c?.industry ?? ''} · ${st.year} · ${strings.badges.roles[st.role]}`,
    badge: { text: st.status === 'live' ? strings.badges.live : strings.badges.dev, className: st.status === 'live' ? skin.badgeLive : skin.badgeDev },
    tagline: c?.tagline ?? '',
    description: c?.description ?? '',
    metrics: st.status === 'live' ? metrics[st.slug] : undefined,
    trail: telemetry[st.slug] ? { data: telemetry[st.slug], range: formatPeriod(telemetry[st.slug].first.slice(0, 7), telemetry[st.slug].last.slice(0, 7)) } : undefined,
    commerceTiles,
    stats,
    results,
    stack: st.stack,
    shots: shotsFor(st.slug, st.gallery),
    charts: {
      compare,
      onSaleShare: isLiveCommerce(commerceEntry) ? commerceEntry.onSaleShare : null,
      ladder: parseLadder(ladderFact?.value),
      weeklyCommits: tel ? { weeks: tel.weeks, weekOf: tel.weekOf } : null,
      priceRange:
        isLiveCommerce(commerceEntry) && commerceEntry.priceMin !== null && commerceEntry.priceMax !== null && commerceEntry.currency
          ? { min: commerceEntry.priceMin, max: commerceEntry.priceMax, median: commerceEntry.currency ? (FLEET_MEDIANS.priceMidByCurrency[commerceEntry.currency] ?? null) : null, currency: commerceEntry.currency }
          : null,
      fetchedAt: isLiveCommerce(commerceEntry) ? commerceEntry.fetchedAt : null,
      impact: impactFor(st),
    },
  }
}

interface GalleryProps {
  skin: Skin
  heading: SectionHeading
}

/**
 * The visual wall. Three views — the house carousel of laptop + phone composites (default), a grid of
 * the same, or a wall of phones — and a case-study sheet on click. The facts live in Shopify Work.
 */
export function Gallery({ skin, heading }: GalleryProps) {
  const { strings, registry, formatPeriod, intlLocale, monthFmt } = useContent()
  const g = strings.sections.gallery
  const cs = strings.sections.caseStudy
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('carousel')
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [sheetLoaded, setSheetLoaded] = useState(false)
  const openSheet = (slug: string) => {
    setSheetLoaded(true)
    setOpenSlug(slug)
  }

  useSheetHistory(openSlug, () => setOpenSlug(null), { param: 'store' })

  const items = useMemo(
    () => registry.stores.filter((s) => s.gallery && (filter === 'all' || s.status === filter)),
    [filter, registry.stores],
  )
  const open = openSlug ? registry.stores.find((s) => s.slug === openSlug) : null
  const chip = (active: boolean) => `${active ? skin.chipOn : skin.chip} compact-touch transition-colors`

  // Prev/Next inside the sheet cycle through `items` — the same ordered, filtered list this view
  // shows — wrapping at the ends. Disabled (undefined) with 0-1 items or when the open slug fell out
  // of `items` (a filter changed underneath the open sheet).
  const openIndex = open ? items.findIndex((s) => s.slug === open.slug) : -1
  const canNavigate = items.length > 1 && openIndex !== -1
  const goPrev = canNavigate ? () => setOpenSlug(items[(openIndex - 1 + items.length) % items.length].slug) : undefined
  const goNext = canNavigate ? () => setOpenSlug(items[(openIndex + 1) % items.length].slug) : undefined

  // A different angle than the index chip's (offset 2 of 4) so the same store reads two distinct,
  // still-honest commerce facts across the two surfaces instead of repeating one line everywhere.
  const Caption = ({ s }: { s: StoreEntry }) => {
    const c = strings.stores[s.slug]
    const { text } = pickCommerceLine(s.slug, 2, {
      store: s,
      storeContent: c,
      filters: strings.sections.shopify.filters,
      cs: cs.commerce,
      commerceEntry: commerce[s.slug],
      telemetryEntry: telemetry[s.slug],
      intlLocale,
      monthFmt,
    })
    return (
      <figcaption className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <span className={`${skin.title} truncate text-sm`}>{s.name}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${s.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>
            {s.status === 'live' ? strings.badges.live : strings.badges.dev}
          </span>
        </div>
        <p className={`${skin.muted} mt-0.5 truncate text-xs`}>{text}</p>
      </figcaption>
    )
  }

  return (
    <section id="gallery" className="scroll-mt-20">
      {heading(g.eyebrow, g.title, g.titleAccent, g.lead)}

      {/* Two filter groups, visibly separate: status | view */}
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={g.eyebrow}>
          {(['all', 'live', 'dev'] as Filter[]).map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={chip(filter === f)}>
              {f === 'all' ? g.filterAll : f === 'live' ? g.filterLive : g.filterDev}
            </button>
          ))}
        </div>
        <span className={`hidden h-6 w-px sm:block ${skin.frame === 'brutalist' ? 'bg-current opacity-60' : 'bg-current opacity-20'}`} aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={g.viewLabel}>
          <span className={`${skin.muted} mr-1 text-[11px] uppercase tracking-[0.15em]`}>{g.viewLabel}</span>
          {(['carousel', 'grid', 'phones'] as View[]).map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={chip(view === v)}>
              {v === 'carousel' ? g.viewCarousel : v === 'grid' ? g.viewDevices : g.viewPhones}
            </button>
          ))}
        </div>
      </div>

      {view === 'carousel' && (
        <div className="rail-wide" style={carouselTokens(skin.frame, skin.dark)} data-lenis-prevent-wheel>
          {/* House carousel: edge bleed to the viewport, centered snap on mobile, left rest on desktop,
              weighted mouse drag, step-by-one arrows + the five-dot window in glass. The rail breaks
              out of the text column on wide screens so the composites read at size. */}
          <Carousel
            key={filter}
            slidesPerView={{ base: 1, md: 2, lg: 2, xl: 3 }}
            gap={24}
            desktopSnap="start"
            trackClassName="py-10 -my-10"
            ariaLabel={g.eyebrow}
            renderControls={(state) => <GlassControls state={state} skin={skin} labels={{ prev: cs.prev, next: cs.next }} />}
          >
            {items.map((s) => (
              <figure key={s.slug} className="m-0">
                <ProjectFrame name={s.name} shots={shotsFor(s.slug)} skin={skin} onOpen={() => openSheet(s.slug)} alt={g.open} cta={cs.open} />
                <Caption s={s} />
              </figure>
            ))}
          </Carousel>
        </div>
      )}

      {view === 'grid' && (
        <m.div className="rail-wide grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, idx) => (
            <m.figure
              key={s.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (idx % 3) * 0.05, duration: 0.5 }}
              className="m-0"
            >
              <ProjectFrame name={s.name} shots={shotsFor(s.slug)} skin={skin} onOpen={() => openSheet(s.slug)} alt={g.open} cta={cs.open} />
              <Caption s={s} />
            </m.figure>
          ))}
        </m.div>
      )}

      {view === 'phones' && (
        <m.div className="rail-wide grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((s, idx) => (
            <m.figure
              key={s.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (idx % 5) * 0.04, duration: 0.5 }}
              className="m-0"
            >
              <ProjectFrame name={s.name} shots={shotsFor(s.slug)} skin={skin} onOpen={() => openSheet(s.slug)} alt={g.open} variant="phone" />
              <figcaption className={`${skin.muted} mt-2 truncate text-center text-xs`}>{s.name}</figcaption>
            </m.figure>
          ))}
        </m.div>
      )}

      {sheetLoaded && (
        <Suspense fallback={null}>
          <ProjectModal
            open={!!open}
            data={open ? caseStudyFor(open, strings, skin, formatPeriod, intlLocale, monthFmt) : null}
            skin={skin}
            labels={caseStudyLabels(strings)}
            onClose={() => setOpenSlug(null)}
            onPrev={goPrev}
            onNext={goNext}
            intlLocale={intlLocale}
          />
        </Suspense>
      )}
    </section>
  )
}
