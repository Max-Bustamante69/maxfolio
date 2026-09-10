// Composes the four commerce angles (catalog / offer / delivery / reach) the index chips, gallery
// captions and case-study sheet all read from — one system, several honest surfaces. Every number
// here traces to src/data/commerce.json (fetched from the live storefront), src/data/telemetry.json
// (the store repo's git history) or a registry fact the owner curated by hand. Nothing here is a
// conversion rate, revenue or AOV figure — those are not measured for these stores.
import type { StoreEntry } from './registry'
import { isLiveCommerce, type StoreCommerce, type StoreCommerceLive } from './commerce'
import type { StoreTelemetry } from './telemetry'
import type { CommerceLabels, PortfolioContent } from '../content/types'

export type CommerceAngle = 'catalog' | 'offer' | 'delivery' | 'reach'
const ANGLES: CommerceAngle[] = ['catalog', 'offer', 'delivery', 'reach']

/** Deterministic (no randomness, so SSR/CSR and re-renders agree) angle rotation by slug, so the
 *  index reads varied instead of repeating the same angle on every row. */
export function angleForSlug(slug: string, offset = 0): CommerceAngle {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return ANGLES[(h + offset) % ANGLES.length]
}

/** Same vocabulary as ShopifyWork's filter chips — the offer angle's fallback for a store with no
 *  curated `facts` entry (e.g. Sebum, Pixxiesx): the first matching stack tag, translated. */
const OFFER_FEATURES: { id: string; test: RegExp }[] = [
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'subscriptions', test: /subscription/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|framer|migrat|port/i },
  { id: 'i18n', test: /bilingual|currency|dual/i },
  { id: 'tracking', test: /track|pixel|analytics/i },
  { id: 'islands', test: /react/i },
]

export function formatMoney(amount: number, currency: string, intlLocale: string): string {
  try {
    return new Intl.NumberFormat(intlLocale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${Math.round(amount).toLocaleString(intlLocale)} ${currency}`
  }
}

const fill = (tpl: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl)

/** Real weeks a build took: the store repo's own git weeks when telemetry exists, else the
 *  calendar span of the registry's build window (start → end, both real, hand-verified dates). */
export function weeksFor(store: StoreEntry, tel: StoreTelemetry | undefined): number {
  if (tel) return tel.weeks.length
  const [sy, sm] = store.timeline.start.split('-').map(Number)
  const [ey, em] = store.timeline.end.split('-').map(Number)
  const months = Math.max(1, (ey - sy) * 12 + (em - sm) + 1)
  return Math.round(months * 4.345)
}

// Singular-noun swaps for EN/ES so "1 collections"/"1 colecciones" doesn't ship (real fleet stores
// do land on exactly one collection or product) — Japanese counters don't inflect, so left alone.
const SINGULAR_SWAPS: [RegExp, string][] = [
  [/\bcollections\b/, 'collection'],
  [/\bcolecciones\b/, 'colección'],
  [/\bproducts\b/, 'product'],
  [/\bproductos\b/, 'producto'],
]
function singularize(text: string, n: number): string {
  if (n !== 1) return text
  return SINGULAR_SWAPS.reduce((s, [re, word]) => s.replace(re, word), text)
}

function catalogText(c: StoreCommerceLive, cs: CommerceLabels, intlLocale: string): string {
  const collections = c.collections ?? 0
  const line =
    c.priceMin !== null && c.currency
      ? fill(cs.catalogLine, { products: c.products, collections, price: formatMoney(c.priceMin, c.currency, intlLocale) })
      : fill(cs.catalogLineNoPrice, { products: c.products, collections })
  // Two independently-plural counts share one string, so each singular swap must anchor to its own
  // number: split on the products/collections boundary (the " · " the templates always place between
  // them) and singularize each half against its own count.
  const [productsHalf, ...rest] = line.split(' · ')
  const collectionsHalf = rest.join(' · ')
  return [singularize(productsHalf, c.products), singularize(collectionsHalf, collections)].filter(Boolean).join(' · ')
}

function offerText(store: StoreEntry, storeContent: PortfolioContent['stores'][string] | undefined, filters: Record<string, string>, cs: CommerceLabels, joinAll: boolean): string {
  const facts = store.facts.filter((f) => f.id !== 'langs' && f.id !== 'live')
  if (facts.length > 0) {
    const parts = (joinAll ? facts : facts.slice(0, 1)).map((f) => {
      const kind = cs.offerKind[f.id] ?? storeContent?.factLabels?.[f.id] ?? f.id
      return `${f.value} ${kind}`
    })
    return parts.join(' · ')
  }
  const match = OFFER_FEATURES.find((f) => store.stack.some((t) => f.test.test(t)))
  if (match && filters[match.id]) return filters[match.id]
  return cs.offerFallback
}

function deliveryText(store: StoreEntry, tel: StoreTelemetry | undefined, cs: CommerceLabels, monthFmt: Intl.DateTimeFormat): string {
  const weeks = weeksFor(store, tel)
  const launch = tel ? tel.last : `${store.timeline.end}-01`
  const month = monthFmt.format(new Date(`${launch.slice(0, 7)}-01T12:00:00`))
  return fill(cs.deliveryLine, { weeks, month })
}

function reachText(c: StoreCommerceLive, store: StoreEntry, cs: CommerceLabels): string | null {
  if (!c.currency) return null
  const langsFact = store.facts.find((f) => f.id === 'langs')
  if (c.shipsToCount && c.shipsToCount > 1) return fill(cs.reachLine, { currency: c.currency, n: c.shipsToCount })
  if (langsFact) return `${c.currency} · ${langsFact.value}`
  return fill(cs.reachLineSingle, { currency: c.currency })
}

export interface CommerceContext {
  store: StoreEntry
  storeContent: PortfolioContent['stores'][string] | undefined
  filters: Record<string, string> // strings.sections.shopify.filters
  cs: CommerceLabels // strings.sections.caseStudy.commerce
  commerceEntry: StoreCommerce | undefined
  telemetryEntry: StoreTelemetry | undefined
  intlLocale: string
  monthFmt: Intl.DateTimeFormat
}

/** One angle's line, or null when that angle has no real data for this store (protected/unreachable
 *  storefronts have no catalog or reach angle). Offer and delivery always resolve. */
export function lineForAngle(angle: CommerceAngle, ctx: CommerceContext, joinAllOffer = false): string | null {
  switch (angle) {
    case 'catalog':
      return isLiveCommerce(ctx.commerceEntry) ? catalogText(ctx.commerceEntry, ctx.cs, ctx.intlLocale) : null
    case 'offer':
      return offerText(ctx.store, ctx.storeContent, ctx.filters, ctx.cs, joinAllOffer)
    case 'delivery':
      return deliveryText(ctx.store, ctx.telemetryEntry, ctx.cs, ctx.monthFmt)
    case 'reach':
      return isLiveCommerce(ctx.commerceEntry) ? reachText(ctx.commerceEntry, ctx.store, ctx.cs) : null
  }
}

/** Picks the first resolvable angle starting at `angleForSlug(slug, offset)`, cascading through the
 *  remaining three so every store shows a line (offer and delivery always resolve, as a floor). */
export function pickCommerceLine(slug: string, offset: number, ctx: CommerceContext): { angle: CommerceAngle; text: string } {
  for (let i = 0; i < ANGLES.length; i++) {
    const angle = angleForSlug(slug, offset + i)
    const text = lineForAngle(angle, ctx)
    if (text) return { angle, text }
  }
  return { angle: 'offer', text: ctx.cs.offerFallback }
}

