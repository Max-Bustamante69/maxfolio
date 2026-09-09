import data from './telemetry.json'

/** Real engineering telemetry per storefront, produced by scripts/store-telemetry.mjs from each store repo's git history. */
export interface StoreTelemetry {
  repo: string
  commits: number
  first: string // YYYY-MM-DD of the first commit
  last: string
  weekOf: string // Monday of the first week in `weeks`
  weeks: number[] // commits per week, first → last
  files: { liquid: number; ts: number; css: number; json: number }
  lines: { liquid: number; islands: number; css: number }
  sections: number
  busiestWeek: { index: number; commits: number; week: string }
}

export const telemetry: Record<string, StoreTelemetry> = data as Record<string, StoreTelemetry>
