/**
 * The A/B split, shared by the edge middleware (assignment) and the client (rendering + attribution).
 *
 * Each variant is a full landing experience served at `/`: the middleware rewrites the request to the
 * variant's static shell (a Vite HTML entry with its own pre-React hero) and pins the choice in a cookie,
 * so a visitor keeps seeing the same variant. With a single variant listed there is no split at all —
 * that is the switch: add the entries and the next deploy divides traffic evenly among them.
 *
 * Attribution: pageviews of `/` are reported to Vercel Web Analytics as `/v/<variant>`, every contact
 * request carries `variant` + `theme` fields (and a subject suffix), and /api/ab keeps first-party
 * counters (views, contacts) per variant when a KV store is connected.
 */
export type VariantId = 'apple' | 'neo' | 'persona'

export interface Variant {
  id: VariantId
  /** The static HTML entry Vite builds for this variant (its pre-React shell lives inside). */
  shell: 'index.html' | 'neo.html' | 'persona.html'
}

export const AB = {
  cookie: 'mf_v',
  /** 90 days: long enough for a returning visitor to land on the same experience. */
  maxAge: 60 * 60 * 24 * 90,
  /** Ordered; the first one is the control and the fallback when a cookie names an unknown variant. */
  variants: [{ id: 'apple', shell: 'index.html' }] as Variant[],
}

export const isVariant = (v: unknown): v is VariantId => AB.variants.some((x) => x.id === v)
