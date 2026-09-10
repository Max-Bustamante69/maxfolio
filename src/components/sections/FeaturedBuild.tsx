import { useState } from 'react'
import { useContent } from '../../hooks'
import { commerce, isLiveCommerce } from '../../data/commerce'
import { telemetry } from '../../data/telemetry'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { SplitStoryVariant } from './featuredLayouts/SplitStoryVariant'
import { StoryboardRailVariant } from './featuredLayouts/StoryboardRailVariant'
import { CinematicVariant } from './featuredLayouts/CinematicVariant'
import { BentoCaseCardVariant } from './featuredLayouts/BentoCaseCardVariant'
import { VariantSwitcher } from './featuredLayouts/VariantSwitcher'
import { isVariantId, type FeaturedData, type VariantId } from './featuredLayouts/types'

interface FeaturedBuildProps {
  skin: Skin
  heading: SectionHeading
}

const STORE_SLUG = 'the-gummy-box'

const readInitialVariant = (): { variant: VariantId; hasParam: boolean } => {
  if (typeof window === 'undefined') return { variant: 'a', hasParam: false }
  try {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('featured')) return { variant: 'a', hasParam: false }
    const v = params.get('featured')
    return { variant: isVariantId(v) ? v : 'a', hasParam: true }
  } catch {
    return { variant: 'a', hasParam: false }
  }
}

/**
 * "Featured build": The Gummy Box (a functional-gummy storefront — bundle builder wired to the
 * Bundles module, a 10%→20% ladder priced by a Shopify Function at checkout, subscriptions through
 * Treli, first-party tracking on every surface) told through four selectable design variants —
 * `?featured=a|b|c|d`, read once on mount, default `a`. The switcher only renders when the param is
 * present at all, so visitors see the chosen default variant without any UI chrome for picking one.
 * Every variant reads from the same `FeaturedData`, computed once here from real registry/commerce/
 * telemetry figures — nothing store-specific is duplicated per variant.
 */
export function FeaturedBuild({ skin, heading }: FeaturedBuildProps) {
  const { strings, registry, formatPeriod, intlLocale } = useContent()
  const fb = strings.sections.featuredBuild
  const g = strings.sections.gallery
  const store = registry.stores.find((s) => s.slug === STORE_SLUG)
  const c = commerce[STORE_SLUG]
  const t = telemetry[STORE_SLUG]

  const [{ variant: initialVariant, hasParam }] = useState(readInitialVariant)
  const [variant, setVariant] = useState<VariantId>(initialVariant)

  const onSelectVariant = (id: VariantId) => {
    setVariant(id)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('featured', id)
      window.history.replaceState(null, '', url)
    } catch {
      // preview-only convenience; never block the switch on it
    }
  }

  if (!store) return null

  const ladder = store.facts.find((f) => f.id === 'ladder')?.value ?? ''
  const range = formatPeriod(store.timeline.start, store.timeline.end)
  // One currency prefix, not one per number (formatMoney on each side reads noisy for a range).
  const priceRange = isLiveCommerce(c) && c.priceMin != null && c.priceMax != null && c.currency ? `${c.currency} ${Math.round(c.priceMin).toLocaleString(intlLocale)}–${Math.round(c.priceMax).toLocaleString(intlLocale)}` : ''
  const vars: Record<string, string | number> = {
    commits: store.commits ?? 0,
    sections: store.sections ?? 0,
    range,
    url: store.url.replace(/^https?:\/\//, ''),
    products: isLiveCommerce(c) ? c.products : 0,
    collections: isLiveCommerce(c) && c.collections != null ? c.collections : 0,
    priceRange,
    ladder,
  }

  const data: FeaturedData = {
    skin,
    fb,
    g,
    store,
    vars,
    metrics: { commits: t?.commits ?? store.commits ?? 0, weeks: t?.weeks.length ?? 0, sections: t?.sections ?? store.sections ?? 0 },
    img: (name, v) => `/gallery/${STORE_SLUG}/${name}-${v}.webp`,
    sheetHref: `?store=${STORE_SLUG}#gallery`,
  }

  return (
    <section id="featured-build" className="scroll-mt-20">
      {heading(fb.eyebrow, fb.title, fb.titleAccent, fb.lead)}

      {hasParam && <VariantSwitcher skin={skin} active={variant} onSelect={onSelectVariant} />}

      {variant === 'a' && <SplitStoryVariant data={data} />}
      {variant === 'b' && <StoryboardRailVariant data={data} />}
      {variant === 'c' && <CinematicVariant data={data} />}
      {variant === 'd' && <BentoCaseCardVariant data={data} />}
    </section>
  )
}
