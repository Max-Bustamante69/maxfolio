// Shared shape every "review checklist" direction renders from — computed once in
// ReviewChecklist.tsx and handed to whichever layout `?review=` currently selects. Mirrors the
// pattern featuredLayouts/types.ts set for `?featured=`: one VariantId union, one switcher, one data
// object so no direction re-derives the flat item list or the group icon set on its own.
import type { Skin } from '../../gallery'
import type { PortfolioContent } from '../../../content/types'

export type ReviewStrings = PortfolioContent['sections']['reviewChecklist']
export type ReviewGroup = ReviewStrings['groups'][number]

/** One entry per checklist item, flattened across all 7 groups in fixed order — the sequence every
 *  time-based direction (console replay, stations rail) steps through. */
export interface FlatCheck {
  gi: number
  ii: number
  item: string
}

export interface ReviewData {
  skin: Skin
  rc: ReviewStrings
  /** The documented floor of automated checks (40) — always rendered as "{n}+", never a bare number. */
  checkCount: number
  reduced: boolean
  flat: FlatCheck[]
  /** flat[]'s starting index for each group, same order as rc.groups. */
  cumulative: number[]
  total: number
  /** True once the section has been at least 30% visible — the single shared trigger every
   *  time-based direction starts its run from, so switching directions never re-litigates
   *  "when does this start". */
  started: boolean
  onCta: () => void
}

export const VARIANT_IDS = ['a', 'b', 'c', 'd'] as const
export type VariantId = (typeof VARIANT_IDS)[number]

export const isVariantId = (v: string | null): v is VariantId => !!v && (VARIANT_IDS as readonly string[]).includes(v)

export const VARIANT_META: Record<VariantId, string> = {
  a: 'Console replay',
  b: 'X-ray overlay',
  c: 'Report card',
  d: 'Stations rail',
}

/** One inline line-icon path per group, fixed order matching `rc.groups` (parity-checked across
 *  locales, so groups are addressed by index, never by label text). Shared across every direction
 *  that shows a group glyph — carried over from the round-41 layout, no icon library. Kept as plain
 *  path data (not a component) so this file stays JSX-free — each `.tsx` layout renders its own
 *  `<svg>` from it. */
export const ICON_PATHS = [
  'M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Zm2-3a4 4 0 0 1 8 0', // Commerce — bag
  'M5 4h10l4 4v12H5V4Zm10 0v4h4M9 12h6M9 16h6', // Content — a folded card
  'M4 19V10m6.5 9V5M17 19v-6', // Data — bars
  'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z', // Geometry — grid
  'M8 6v12l10-6-10-6Z', // Motion — play
  'M4 6h16M4 12h16M4 18h16', // Navigation — menu
  'M12 4l8 4-8 4-8-4 8-4Zm-8 8 8 4 8-4M4 16l8 4 8-4', // Overlays — stacked layers
] as const

export const EASE = [0.23, 1, 0.32, 1] as const
