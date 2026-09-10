import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { useContent, useSheetHistory } from '../../hooks'
import { ProjectFrame, GlassControls, carouselTokens, type Skin, type FrameShots, type LightboxItem, type CaseStudyData } from '../gallery'
import type { CaseStudyLabels } from '../gallery/ProjectModal'
import { Carousel } from '../../vendor/carousel'
import type { StoreEntry } from '../../data/registry'
import { telemetry } from '../../data/telemetry'
import { commerce } from '../../data/commerce'
import { pickCommerceLine, weeksFor } from '../../data/commerceLines'
import { conversionSeries, deliveryReferenceWeeks, lighthouseBeforeScore, loadTimeSeries, orderValueSeries, revenuePerVisitorSeries, revenueSeries } from '../../data/illustrative'
import lighthouseJson from '../../data/lighthouse.json'
import type { PortfolioContent } from '../../content/types'
import type { ImpactCharts } from '../gallery/ProjectModal'
import type { RingMetric } from '../gallery/charts'

interface LighthouseFieldEntry {
  p75Lcp: number | null // seconds
  p75Inp: number | null // ms
  p75Cls: number | null
  passes: boolean
}
interface LighthouseFormEntry {
  perf: number
  a11y: number
  bp: number
  seo: number
  lcp: number | null
  tbt: number | null
  cls: number | null
  finalUrl: string
  field: LighthouseFieldEntry | null // CrUX real-user data — null unless the origin has enough traffic
}
interface LighthouseStoreEntry {
  fetchedAt: string
  source: string // 'PageSpeed Insights' | 'local, best of 3' | a ' + ' join of both (mixed forms)
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

/** "Impact" block data: conversion, order value, revenue and revenue-per-visitor are always-present
 *  illustrative representations (see src/data/illustrative.ts). `delivery`'s weeks figure is REAL
 *  (telemetry/registry, via commerceLines.weeksFor); its "typical agency" reference is illustrative.
 *  Everything else is real, read straight from src/data/lighthouse.json — null piece by piece whenever
 *  that store has no measured value for it, never backfilled with an estimate: `rings` (desktop
 *  Performance/Accessibility/SEO, Best Practices always omitted, any sub-50 score omitted rather than
 *  shown red), `perfDual.after` (the dual ring's real outer arc — `.before` is the one illustrative
 *  figure here), `cwv` (CrUX field data, only when the origin has enough real-user traffic) and `speed`
 *  (the lab LCP gauge fallback when `cwv` is null). */
function impactFor(st: StoreEntry, ringLabels: { perf: string; a11y: string; seo: string }): ImpactCharts {
  const lh = lighthouseFor(st.slug)
  const desktop = lh?.desktop ?? null
  const mobile = lh?.mobile ?? null

  const rings: ImpactCharts['rings'] = (() => {
    if (!desktop || !lh) return null
    const metrics: RingMetric[] = [
      { key: 'perf', label: ringLabels.perf, value: desktop.perf },
      { key: 'a11y', label: ringLabels.a11y, value: desktop.a11y },
      { key: 'seo', label: ringLabels.seo, value: desktop.seo },
    ].filter((m) => m.value >= 50)
    return metrics.length > 0 ? { metrics, fetchedAt: lh.fetchedAt } : null
  })()

  // Performance dual ring: illustrative baseline vs. the real desktop score (mobile if no desktop
  // measurement), gated on the same +8pt pairing margin the sheet has always used so a measured score
  // never reads as a false decline against its own illustrative anchor (seen on NOS, 2026-09-10).
  const perfForm = desktop ?? mobile
  const perfFormName: 'mobile' | 'desktop' = desktop ? 'desktop' : 'mobile'
  const perfBefore = perfForm ? lighthouseBeforeScore(st.slug, perfFormName) : null
  const perfDual: ImpactCharts['perfDual'] = perfForm && perfBefore !== null && lh && perfForm.perf >= perfBefore + 8 ? { before: perfBefore, after: perfForm.perf, fetchedAt: lh.fetchedAt } : null

  // Core Web Vitals field data — prefer mobile (CrUX's traffic volume skews mobile); fall back to
  // desktop's field data when mobile has none. Every one of the three metrics must be present, or the
  // sheet falls back to the lab LCP gauge instead of showing a partial strip.
  const field = mobile?.field ?? desktop?.field ?? null
  const cwv: ImpactCharts['cwv'] = field && field.p75Lcp != null && field.p75Inp != null && field.p75Cls != null && lh ? { data: { lcp: field.p75Lcp, inp: field.p75Inp, cls: field.p75Cls }, fetchedAt: lh.fetchedAt } : null

  // The lab LCP shown is the better-measured form: mobile while it is at most 4 s (the 'needs improvement' ceiling),
  // otherwise desktop, labeled as such — a poor mobile lab LCP is a real number, but it is not the number this
  // block exists to show, and desktop is just as real.
  const lcpForm: 'mobile' | 'desktop' = mobile?.lcp != null && (mobile.lcp <= 4 || desktop?.lcp == null) ? 'mobile' : 'desktop'
  const lcpValue = lcpForm === 'mobile' ? mobile?.lcp ?? null : desktop?.lcp ?? null
  const speed = !cwv && lcpValue != null && lh ? { seconds: lcpValue, fetchedAt: lh.fetchedAt, form: lcpForm } : null
  const loadTime = lcpValue != null && lh ? { ...loadTimeSeries(st.slug, lcpValue), fetchedAt: lh.fetchedAt, form: lcpForm } : null

  const conversion = conversionSeries(st.slug)
  const orderValue = orderValueSeries(st.slug)
  const revenue = revenueSeries(st.slug, conversion.deltaPct, orderValue.deltaPct)

  // Delivery: real weeks (telemetry.json git history, or the registry's build-window fallback — see
  // commerceLines.weeksFor) against an illustrative "typical agency" reference (14–18 weeks, seeded).
  // Every real fleet build lands well inside that reference, so the pair is omitted only in the
  // defensive case a store's real weeks would somehow meet or exceed it (never observed on this fleet).
  const realWeeks = weeksFor(st, telemetry[st.slug])
  const referenceWeeks = deliveryReferenceWeeks(st.slug)
  const delivery: ImpactCharts['delivery'] = referenceWeeks > realWeeks ? { weeks: realWeeks, referenceWeeks, deltaPct: Math.round(((referenceWeeks - realWeeks) / referenceWeeks) * 100) } : null

  return { conversion, orderValue, revenue, rpv: revenuePerVisitorSeries(st.slug), delivery, rings, perfDual, cwv, speed, loadTime }
}

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
    stack: cs.stack, visit: cs.visit,
    copyLink: cs.copyLink, copied: cs.copied,
    impact: cs.impact,
  }
}

/** Builds the case-study sheet data for a store from the registry + the active locale. The sheet is
 *  header → captures → tagline/description → Impact → stack → Visit store (2026-09-10) — everything
 *  here traces to that shape; there is no separate commerce-tiles or "visualized" data to assemble. */
export function caseStudyFor(
  st: StoreEntry,
  strings: PortfolioContent,
  skin: Skin,
  _formatPeriod: (start: string, end: string | null) => string,
  _intlLocale: string,
  _monthFmt: Intl.DateTimeFormat,
): CaseStudyData {
  const c = strings.stores[st.slug]
  const cs = strings.sections.caseStudy
  return {
    name: st.name,
    url: st.url || undefined,
    meta: `${c?.industry ?? ''} · ${st.year} · ${strings.badges.roles[st.role]}`,
    badge: { text: st.status === 'live' ? strings.badges.live : strings.badges.dev, className: st.status === 'live' ? skin.badgeLive : skin.badgeDev },
    tagline: c?.tagline ?? '',
    description: c?.description ?? '',
    stack: st.stack,
    shots: shotsFor(st.slug, st.gallery),
    impact: impactFor(st, { perf: cs.perf, a11y: cs.a11y, seo: cs.seo }),
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
          />
        </Suspense>
      )}
    </section>
  )
}
