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
  /** Theme blocks (blocks/*.liquid) and sections/blocks carrying a data-dd-component tracking hook.
   *  Optional: only counted so far for the-gummy-box, by hand from the theme repo on disk, 2026-09-10
   *  (`blocks`: file count under blocks/*.liquid; `trackedComponents`: grep for data-dd-component
   *  across sections/ and blocks/). Not produced by scripts/store-telemetry.mjs yet. */
  blocks?: number
  trackedComponents?: number
}

export const telemetry: Record<string, StoreTelemetry> = data as Record<string, StoreTelemetry>
