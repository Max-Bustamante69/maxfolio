// Results per store for the case-study sheet. Every entry is either MEASURED (source + period recorded)
// or SAMPLE (illustrative shape for the charts, visibly labeled on the page until measured numbers
// replace it). Client-absolute figures never appear: metrics are indexed (before = 100) or relative.

export type ResultMetricId = 'cr' | 'aov' | 'revenue' | 'lcp' | 'checkout'

export interface ResultMetric {
  id: ResultMetricId
  /** Index base 100 for before/after; seconds for `lcp`. */
  before: number
  after: number
  unit: 'index' | 's'
  /** Monthly series from before → after (index), used by the line chart. */
  series?: number[]
  /** Reporting window, e.g. "Jun–Sep 2026". */
  period?: string
  /** Where the number comes from ("Shopify Analytics", "Digitdeck Optimize"); required when measured. */
  source?: string
}

export interface StoreResults {
  sample: boolean
  metrics: ResultMetric[]
}

/**
 * SAMPLE shapes — illustrative only. Replace a store's entry with `sample: false` + `source` + `period`
 * once the measured numbers exist; the page drops the "Sample data" badge automatically.
 */
export const results: Record<string, StoreResults> = {
  'the-gummy-box': {
    sample: true,
    metrics: [
      { id: 'cr', before: 100, after: 128, unit: 'index', series: [100, 104, 112, 121, 128] },
      { id: 'aov', before: 100, after: 117, unit: 'index', series: [100, 106, 109, 114, 117] },
      { id: 'lcp', before: 5.4, after: 2.3, unit: 's' },
    ],
  },
  'nos-cafe': {
    sample: true,
    metrics: [
      { id: 'cr', before: 100, after: 122, unit: 'index', series: [100, 103, 109, 116, 122] },
      { id: 'aov', before: 100, after: 131, unit: 'index', series: [100, 112, 119, 126, 131] },
      { id: 'checkout', before: 100, after: 84, unit: 'index', series: [100, 96, 91, 87, 84] },
    ],
  },
  millennio: {
    sample: true,
    metrics: [
      { id: 'cr', before: 100, after: 119, unit: 'index', series: [100, 102, 108, 114, 119] },
      { id: 'revenue', before: 100, after: 126, unit: 'index', series: [100, 105, 113, 120, 126] },
      { id: 'lcp', before: 6.1, after: 2.6, unit: 's' },
    ],
  },
  nalua: {
    sample: true,
    metrics: [
      { id: 'cr', before: 100, after: 115, unit: 'index', series: [100, 101, 106, 111, 115] },
      { id: 'aov', before: 100, after: 124, unit: 'index', series: [100, 108, 114, 120, 124] },
      { id: 'checkout', before: 100, after: 88, unit: 'index', series: [100, 97, 93, 90, 88] },
    ],
  },
}
