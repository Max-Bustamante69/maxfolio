import { useContent } from '../../hooks'
import { commerce, isLiveCommerce } from '../../data/commerce'
import { telemetry } from '../../data/telemetry'
import { conversionSeries, loadTimeSeries, orderValueSeries, revenueSeries } from '../../data/illustrative'
import lighthouseJson from '../../data/lighthouse.json'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { SplitStoryVariant } from './featuredLayouts/SplitStoryVariant'
import { FeaturedImpact } from './featuredLayouts/FeaturedImpact'
import type { FeaturedData, FeaturedImpactData } from './featuredLayouts/types'

// Minimal local shape of src/data/lighthouse.json's per-store entry — just the fields this section's
// Impact strip needs (desktop Performance/Accessibility/SEO/LCP/TBT/CLS). Gallery.tsx's own richer
// `LighthouseStoreEntry` (CrUX field data, mobile form, `_skipped` diagnostics key) isn't exported from
// that module, so this replicates only the slice used here rather than importing across lazy chunks.
interface LighthouseFormEntry {
  perf: number
  a11y: number
  seo: number
  lcp: number | null
  tbt: number | null
  cls: number | null
}
const LIGHTHOUSE = lighthouseJson as unknown as Record<string, { desktop: LighthouseFormEntry | null } | undefined>

interface FeaturedBuildProps {
  skin: Skin
  heading: SectionHeading
}

const STORE_SLUG = 'the-gummy-box'

/**
 * "Featured build": The Gummy Box (a functional-gummy storefront — bundle builder wired to the
 * Bundles module, a 10%→20% ladder priced by a Shopify Function at checkout, subscriptions through
 * Treli, first-party tracking on every surface) told through the "split story" layout — a tight
 * two-column device-frame story. Reads from `FeaturedData`, computed once here from real registry/
 * commerce/telemetry figures.
 */
export function FeaturedBuild({ skin, heading }: FeaturedBuildProps) {
  const { strings, registry, intlLocale } = useContent()
  const fb = strings.sections.featuredBuild
  const g = strings.sections.gallery
  const cs = strings.sections.caseStudy
  const store = registry.stores.find((s) => s.slug === STORE_SLUG)
  const c = commerce[STORE_SLUG]
  const t = telemetry[STORE_SLUG]
  const lh = LIGHTHOUSE[STORE_SLUG]?.desktop ?? null

  if (!store) return null

  const ladder = store.facts.find((f) => f.id === 'ladder')?.value ?? ''
  // One currency prefix, not one per number (formatMoney on each side reads noisy for a range).
  const priceRange = isLiveCommerce(c) && c.priceMin != null && c.priceMax != null && c.currency ? `${c.currency} ${Math.round(c.priceMin).toLocaleString(intlLocale)}–${Math.round(c.priceMax).toLocaleString(intlLocale)}` : ''

  const sections = t?.sections ?? store.sections ?? 0
  const blocks = t?.blocks ?? 0
  const trackedComponents = t?.trackedComponents ?? 0
  const perfDesktop = lh?.perf ?? 0
  const a11yDesktop = lh?.a11y ?? 0
  const seoDesktop = lh?.seo ?? 0
  const tbtDesktop = lh?.tbt ?? 0
  const clsDesktop = lh?.cls ?? 0
  const lcpDesktopValue = lh?.lcp ?? 0
  const shipsTo = isLiveCommerce(c) && c.shipsToCount != null ? c.shipsToCount : 0

  // No git facts (commits, lines of code, busiest week) and no elapsed weeks anywhere in this
  // section per the owner's 2026-09-11 call — every var below is a process or commerce fact instead.
  const vars: Record<string, string | number> = {
    sections,
    url: store.url.replace(/^https?:\/\//, ''),
    products: isLiveCommerce(c) ? c.products : 0,
    collections: isLiveCommerce(c) && c.collections != null ? c.collections : 0,
    priceRange,
    ladder,
    blocks,
    trackedComponents,
    lcpDesktop: lcpDesktopValue.toFixed(2),
    perfDesktop,
    a11yDesktop,
    seoDesktop,
    tbtDesktop,
    shipsTo,
  }

  // Illustrative series (data/illustrative.ts) — the exact same seeded calls Gallery.tsx's own
  // `impactFor()` makes for this store, in the same order (conversion → order value → revenue, then
  // load time off the real desktop LCP), full point series (not just the headline delta) so the
  // Impact strip's own charts always draw identically to the case-study sheet's own charts. Order
  // value itself isn't shown here; it only feeds revenue's compound.
  const conv = conversionSeries(STORE_SLUG)
  const orderValue = orderValueSeries(STORE_SLUG)
  const rev = revenueSeries(STORE_SLUG, conv.deltaPct, orderValue.deltaPct)
  const loadTime = loadTimeSeries(STORE_SLUG, lcpDesktopValue)

  const impact: FeaturedImpactData = {
    conversion: { points: conv.points, low: conv.low, high: conv.high, deltaPct: conv.deltaPct },
    revenue: { points: rev.points, deltaPct: rev.deltaPct },
    loadTime: { beforeSeconds: loadTime.beforeSeconds, afterSeconds: loadTime.afterSeconds, deltaPct: loadTime.deltaPct },
    rings: { perf: perfDesktop, a11y: a11yDesktop, seo: seoDesktop },
    lcpDesktop: lcpDesktopValue,
    tbtDesktop,
    clsDesktop,
  }

  const data: FeaturedData = {
    skin,
    fb,
    g,
    cs,
    store,
    vars,
    metrics: { sections, blocks, trackedComponents },
    impact,
    img: (name, v) => `/gallery/${STORE_SLUG}/${name}-${v}.webp`,
    sheetHref: `?store=${STORE_SLUG}#gallery`,
  }

  return (
    <section id="featured-build" className="scroll-mt-20">
      {heading(fb.eyebrow, fb.title, fb.titleAccent, fb.lead)}

      <SplitStoryVariant data={data} />

      <FeaturedImpact data={data} />
    </section>
  )
}
