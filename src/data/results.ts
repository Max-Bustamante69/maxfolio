// Results per store for the case-study sheet. Every entry is either MEASURED (source + period recorded)
// or SAMPLE (illustrative shape, visibly labeled on the page until measured numbers replace it).
// Client-absolute figures never appear: metrics are indexed (before = 100), percentages, or units of time.

export type ResultMetricId =
  | 'cr' // conversion rate (index)
  | 'aov' // average order value (index)
  | 'revenue' // revenue (index)
  | 'checkout' // checkout drop-off (index, lower is better)
  | 'bounce' // bounce rate (index, lower is better)
  | 'lcp' // mobile LCP (seconds, lower is better)
  | 'bundleShare' // share of orders carrying a bundle (%)
  | 'subscribers' // subscription share of orders (%)
  | 'reviewCoverage' // products with 5+ reviews (%)
  | 'touchpoints' // tracked elements (count)
  | 'syncLag' // hours between supplier list and storefront (hours, lower is better)
  | 'catalog' // SKUs live (count)
  | 'redirects' // migrated URLs resolving (%)

export interface ResultMetric {
  id: ResultMetricId
  before: number
  after: number
  unit: 'index' | 's' | '%' | 'h' | 'n'
  /** Lower is better (drop-off, bounce, LCP, sync lag). */
  invert?: boolean
  /** Monthly series from before → after, used by the line chart. */
  series?: number[]
}

export type ChartKind = 'line' | 'slope' | 'gauge' | 'bars'

export interface ChartSpec {
  kind: ChartKind
  metrics: ResultMetric[]
}

export interface StoreResults {
  sample: boolean
  /** Reporting window and source, required when measured. */
  period?: string
  source?: string
  charts: ChartSpec[]
}

/**
 * SAMPLE shapes — illustrative only, and deliberately different per store archetype (bundle store,
 * Framer port with tracking, rebuild with reviews, catalog sync, migration). Replace a store's entry
 * with `sample: false` + `source` + `period` once measured; the badge drops automatically.
 */
export const results: Record<string, StoreResults> = {
  // bundle + subscriptions
  'the-gummy-box': {
    sample: true,
    charts: [
      { kind: 'line', metrics: [{ id: 'cr', before: 100, after: 128, unit: 'index', series: [100, 104, 112, 121, 128] }] },
      { kind: 'gauge', metrics: [{ id: 'bundleShare', before: 0, after: 41, unit: '%' }, { id: 'subscribers', before: 0, after: 18, unit: '%' }] },
      { kind: 'slope', metrics: [{ id: 'aov', before: 100, after: 117, unit: 'index' }, { id: 'checkout', before: 100, after: 86, unit: 'index', invert: true }] },
    ],
  },
  // Framer port + box builder
  'nos-cafe': {
    sample: true,
    charts: [
      { kind: 'slope', metrics: [{ id: 'cr', before: 100, after: 122, unit: 'index' }, { id: 'aov', before: 100, after: 131, unit: 'index' }, { id: 'bounce', before: 100, after: 84, unit: 'index', invert: true }] },
      { kind: 'bars', metrics: [{ id: 'lcp', before: 5.5, after: 2.4, unit: 's', invert: true }] },
      { kind: 'gauge', metrics: [{ id: 'bundleShare', before: 0, after: 36, unit: '%' }] },
    ],
  },
  // Framer port on React islands + tracking
  millennio: {
    sample: true,
    charts: [
      { kind: 'bars', metrics: [{ id: 'touchpoints', before: 0, after: 260, unit: 'n' }, { id: 'lcp', before: 6.1, after: 2.6, unit: 's', invert: true }] },
      { kind: 'line', metrics: [{ id: 'revenue', before: 100, after: 126, unit: 'index', series: [100, 105, 113, 120, 126] }] },
    ],
  },
  // offers + cash on delivery
  nalua: {
    sample: true,
    charts: [
      { kind: 'slope', metrics: [{ id: 'cr', before: 100, after: 115, unit: 'index' }, { id: 'aov', before: 100, after: 124, unit: 'index' }] },
      { kind: 'line', metrics: [{ id: 'checkout', before: 100, after: 88, unit: 'index', invert: true, series: [100, 97, 93, 90, 88] }] },
    ],
  },
  // rebuild with a review wall
  sebum: {
    sample: true,
    charts: [
      { kind: 'gauge', metrics: [{ id: 'reviewCoverage', before: 22, after: 94, unit: '%' }] },
      { kind: 'line', metrics: [{ id: 'cr', before: 100, after: 112, unit: 'index', series: [100, 102, 105, 109, 112] }] },
    ],
  },
  // catalog sync retailer
  atmosfera: {
    sample: true,
    charts: [
      { kind: 'bars', metrics: [{ id: 'syncLag', before: 168, after: 12, unit: 'h', invert: true }, { id: 'catalog', before: 640, after: 2100, unit: 'n' }] },
      { kind: 'line', metrics: [{ id: 'bounce', before: 100, after: 79, unit: 'index', invert: true, series: [100, 94, 88, 83, 79] }] },
    ],
  },
  // migration
  'alma-de-aviador': {
    sample: true,
    charts: [
      { kind: 'gauge', metrics: [{ id: 'redirects', before: 0, after: 100, unit: '%' }] },
      { kind: 'bars', metrics: [{ id: 'lcp', before: 7.2, after: 2.8, unit: 's', invert: true }] },
    ],
  },
}
