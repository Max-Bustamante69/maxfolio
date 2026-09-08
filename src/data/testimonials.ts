// Real, attributable quotes only. The section renders nothing while this list is empty; add an entry
// once the person has confirmed the wording and the attribution (name, role, company).
export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  /** Store slug from the registry when the quote is about a specific build. */
  storeSlug?: string
  /** Where the quote came from, for the record: "email 2026-09-01", "Loom review", "LinkedIn recommendation". */
  source: string
}

export const testimonials: Testimonial[] = []
