// Value parser for `job.metrics[].value` (src/data/registry.ts), used by the Experience section's
// metric cards. Every metric on the CV is a hand-written string ("18+", "70→95+",
// "+10–20%", "$45k/yr"…), never a number — this reads the existing string's own shape instead of
// asking data.ts to carry a second, parallel numeric field. No metric value is invented here: every
// branch only reformats digits already present in `raw`, and `text` is the safe fallback for any
// future metric string this parser doesn't recognize (it renders `raw` verbatim, unanimated).

export type MetricKind = 'arrow' | 'rangePct' | 'signedPct' | 'money' | 'count' | 'text'

export interface ParsedMetric {
  kind: MetricKind
  raw: string
  // arrow: "70→95+"
  before?: number
  after?: number
  afterSuffix?: string
  // rangePct: "+10–20%" / "-30–40%" — sign applies to both bounds
  // signedPct: "+20%" / "-40%"
  sign?: '+' | '-'
  low?: number
  high?: number
  // signedPct / money / count
  value?: number
  prefix?: string
  suffix?: string
  // count only: order-of-magnitude bucket (1..5) for the decorative unit-dot row — never a claim
  // about the literal digit count, just "tens vs thousands" read at a glance.
  magnitude?: number
}

export function parseMetricValue(raw: string): ParsedMetric {
  let m = raw.match(/^(\d+(?:\.\d+)?)\s*→\s*(\d+(?:\.\d+)?)(\+)?$/)
  if (m) return { kind: 'arrow', raw, before: Number(m[1]), after: Number(m[2]), afterSuffix: m[3] ?? '' }

  m = raw.match(/^([+-])(\d+(?:\.\d+)?)[–-](\d+(?:\.\d+)?)%$/)
  if (m) return { kind: 'rangePct', raw, sign: m[1] as '+' | '-', low: Number(m[2]), high: Number(m[3]) }

  m = raw.match(/^\$(\d+(?:\.\d+)?)k\/yr$/)
  if (m) return { kind: 'money', raw, value: Number(m[1]), prefix: '$', suffix: 'k/yr' }

  m = raw.match(/^([+-])(\d+(?:\.\d+)?)%$/)
  if (m) return { kind: 'signedPct', raw, sign: m[1] as '+' | '-', value: Number(m[2]) }

  m = raw.match(/^([\d,]+)(\+)?$/)
  if (m) {
    const value = Number(m[1].replace(/,/g, ''))
    const magnitude = Math.max(1, Math.min(5, Math.floor(Math.log10(value + 1)) + 1))
    return { kind: 'count', raw, value, suffix: m[2] ?? '', magnitude }
  }

  return { kind: 'text', raw }
}
