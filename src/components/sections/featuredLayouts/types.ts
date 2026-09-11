// Shared shape the "featured build" story renders from — computed once in FeaturedBuild.tsx and
// handed to SplitStoryVariant and FeaturedImpact. All numbers are real (registry, commerce.json,
// telemetry.json); only the English/Spanish/Japanese copy lives in content/*.ts.
import type { Skin } from '../../gallery'
import type { PortfolioContent } from '../../../content/types'
import type { StoreEntry } from '../../../data/registry'

/**
 * Numbers for the shared Impact strip (FeaturedImpact.tsx), computed once in FeaturedBuild.tsx. The
 * `conversion`/`revenue`/`loadTime` series are the exact same seeded calls Gallery.tsx's own
 * `impactFor()` makes (conversionSeries → revenueSeries → loadTimeSeries off the real desktop LCP,
 * same order) — full point series so the strip's own charts (IndexAreaLine, LoadTimePairedBar), not
 * just their headline deltas, always equal the case-study sheet's own charts for this store.
 * `rings`/`lcpDesktop`/`tbtDesktop`/`clsDesktop` are real, straight from lighthouse.json — no build
 * counts here any more (2026-09-11 owner call: sections/blocks moved into the story itself, git facts
 * dropped from the strip entirely — see FeaturedData.metrics below for the story's own process count).
 */
export interface FeaturedImpactData {
  conversion: { points: number[]; low: number[]; high: number[]; deltaPct: number }
  revenue: { points: number[]; deltaPct: number }
  loadTime: { beforeSeconds: number; afterSeconds: number; deltaPct: number }
  rings: { perf: number; a11y: number; seo: number }
  lcpDesktop: number
  tbtDesktop: number
  clsDesktop: number
}

export interface FeaturedData {
  skin: Skin
  fb: PortfolioContent['sections']['featuredBuild']
  g: PortfolioContent['sections']['gallery']
  cs: PortfolioContent['sections']['caseStudy']
  store: StoreEntry
  /** {placeholder} -> real value, applied to every templated string this section renders. */
  vars: Record<string, string | number>
  /** Real telemetry: sections, blocks, tracked components — process facts (never git facts, never
   *  elapsed time), shared by the bento variant's three count-up numerals and the default variant's
   *  design-to-code diagram. */
  metrics: { sections: number; blocks: number; trackedComponents: number }
  /** The shared Impact strip's numbers — see `FeaturedImpactData` above. */
  impact: FeaturedImpactData
  /** `/gallery/<slug>/<name>-<variant>.webp` — only 'home' and 'pdp' exist for this store. */
  img: (name: 'home' | 'pdp', variant: 'desktop' | 'mobile') => string
  /** deep-links into the Gallery section's case-study sheet for this store (`?store=<slug>#gallery`). */
  sheetHref: string
}

/** Fills `{key}` placeholders in a template string from `vars` — same tiny helper the original
 *  section used, shared here so every variant fills copy identically. */
export const fill = (tpl: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl)
