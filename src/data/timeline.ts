import { experience, personalProjects, products, roleWork, stores, type ExperienceEntry, type PersonalProject, type ProductEntry, type RoleWork, type StoreEntry } from './registry'

/** One card per year: what was running, what shipped, what was built on the side. Derived, never typed by hand. */
export interface YearEntry {
  year: number
  positions: ExperienceEntry[] // active at any point in the year, newest first
  stores: StoreEntry[] // build window touches the year, live first
  work: RoleWork[] // named deliverables inside roles whose window touches the year
  products: ProductEntry[]
  personal: PersonalProject[]
}

/** The kinds of shipped work the per-year chart stacks, in drawing order (bottom first). */
export const WORK_KINDS = ['stores', 'work', 'products', 'personal'] as const
export type WorkKind = (typeof WORK_KINDS)[number]

export const workCount = (e: YearEntry, kind: WorkKind) => e[kind].length
export const workTotal = (e: YearEntry) => WORK_KINDS.reduce((n, k) => n + workCount(e, k), 0)

const yearOf = (ym: string) => Number(ym.slice(0, 4))
const CURRENT_YEAR = 2026

export function buildTimeline(): YearEntry[] {
  const first = Math.min(...experience.map((e) => yearOf(e.start)), ...stores.map((s) => yearOf(s.timeline.start)))
  const years: YearEntry[] = []
  for (let y = first; y <= CURRENT_YEAR; y++) {
    years.push({
      year: y,
      positions: experience.filter((e) => yearOf(e.start) <= y && (e.end === null ? CURRENT_YEAR : yearOf(e.end)) >= y),
      stores: stores
        .filter((s) => yearOf(s.timeline.start) <= y && yearOf(s.timeline.end) >= y)
        .sort((a, b) => (a.status === b.status ? 0 : a.status === 'live' ? -1 : 1)),
      work: roleWork.filter((w) => yearOf(w.timeline.start) <= y && yearOf(w.timeline.end) >= y),
      products: products.filter((p) => p.year === y),
      personal: personalProjects.filter((p) => p.year === y),
    })
  }
  return years
}

export const timeline = buildTimeline()
