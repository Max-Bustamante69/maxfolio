// Shared shape every "featured build" variant renders from — computed once in FeaturedBuild.tsx and
// handed to whichever variant `?featured=` currently selects. All numbers are real (registry,
// commerce.json, telemetry.json); only the English/Spanish/Japanese copy lives in content/*.ts.
import type { Skin } from '../../gallery'
import type { PortfolioContent } from '../../../content/types'
import type { StoreEntry } from '../../../data/registry'

/**
 * Numbers for the shared Impact strip (FeaturedImpact.tsx), computed once in FeaturedBuild.tsx.
 * `conversionPct`/`revenuePct`/`loadTimePct` are illustrative — the exact same seeded calls
 * Gallery.tsx's `impactFor()` makes (conversionSeries → revenueSeries → loadTimeSeries off the real
 * desktop LCP) — so these hero numerals always equal the case-study sheet's own hero numerals for
 * this store. Everything else here is real, straight from lighthouse.json/telemetry.json.
 */
export interface FeaturedImpactData {
  conversionPct: number
  revenuePct: number
  loadTimePct: number
  rings: { perf: number; a11y: number; seo: number }
  lcpDesktop: number
  tbtDesktop: number
  build: { commits: number; weeks: number; sections: number; blocks: number; trackedComponents: number }
}

export interface FeaturedData {
  skin: Skin
  fb: PortfolioContent['sections']['featuredBuild']
  g: PortfolioContent['sections']['gallery']
  cs: PortfolioContent['sections']['caseStudy']
  store: StoreEntry
  /** {placeholder} -> real value, applied to every templated string this section renders. */
  vars: Record<string, string | number>
  /** Real telemetry: commits, weeks tracked, sections — the bento variant's three count-up numerals. */
  metrics: { commits: number; weeks: number; sections: number }
  /** The shared Impact strip's numbers — see `FeaturedImpactData` above. */
  impact: FeaturedImpactData
  /** `/gallery/<slug>/<name>-<variant>.webp` — only 'home' and 'pdp' exist for this store. */
  img: (name: 'home' | 'pdp', variant: 'desktop' | 'mobile') => string
  /** deep-links into the Gallery section's case-study sheet for this store (`?store=<slug>#gallery`). */
  sheetHref: string
}

export const VARIANT_IDS = ['a', 'b', 'c', 'd'] as const
export type VariantId = (typeof VARIANT_IDS)[number]

export const isVariantId = (v: string | null): v is VariantId => !!v && (VARIANT_IDS as readonly string[]).includes(v)

export const VARIANT_META: Record<VariantId, string> = {
  a: 'Split story',
  b: 'Storyboard rail',
  c: 'Cinematic',
  d: 'Bento case card',
}

/** Fills `{key}` placeholders in a template string from `vars` — same tiny helper the original
 *  section used, shared here so every variant fills copy identically. */
export const fill = (tpl: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl)
