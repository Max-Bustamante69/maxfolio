import { experience, personalProjects, products, stores, type ExperienceEntry, type PersonalProject, type ProductEntry, type StoreEntry } from './registry'

/** One card per year: what was running, what shipped, what was built on the side. Derived, never typed by hand. */
export interface YearEntry {
  year: number
  positions: ExperienceEntry[] // active at any point in the year, newest first
  stores: StoreEntry[] // build window touches the year, live first
  products: ProductEntry[]
  personal: PersonalProject[]
}

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
      products: products.filter((p) => p.year === y),
      personal: personalProjects.filter((p) => p.year === y),
    })
  }
  return years
}

export const timeline = buildTimeline()
