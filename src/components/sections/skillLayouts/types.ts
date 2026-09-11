// Shared shape every alternative "What I work with" layout renders from — all real data, nothing
// layout-specific computed twice. Skills.tsx builds this once and hands it to whichever layout the
// `?skills=` switcher currently selects.
import type { SkillGroupId } from '../../../data/registry'
import type { ToolUsage } from '../../../data/skillUsage'
import type { Skin } from '../../gallery'
import type { SkillsStrings } from '../skillsFormat'

export interface SkillsData {
  skin: Skin
  sk: SkillsStrings
  groups: SkillGroupId[]
  groupLabel: Record<SkillGroupId, string>
  groupNote: Record<SkillGroupId, string>
  storesPerGroup: Record<SkillGroupId, number>
  toolsByGroup: Record<SkillGroupId, ToolUsage[]>
  /** Every tool across all groups, deduplicated, in group order — feeds ticker-style layouts. */
  allTools: string[]
  formatTool: (u: ToolUsage) => string
  formatGroup: (n: number) => string
}

export interface SkillsLayoutProps {
  data: SkillsData
}

/** The six alternative layouts plus the current tile grid, selectable with `?skills=<id>`. */
export const LAYOUT_IDS = ['tiles', 'ledger', 'wall', 'bento', 'columns', 'orbit', 'rows'] as const
export type LayoutId = (typeof LAYOUT_IDS)[number]

export const isLayoutId = (v: string | null): v is LayoutId => !!v && (LAYOUT_IDS as readonly string[]).includes(v)

export const LAYOUT_META: Record<LayoutId, string> = {
  tiles: 'Tiles (current)',
  ledger: 'Ledger',
  wall: 'Wall',
  bento: 'Bento',
  columns: 'Columns',
  orbit: 'Orbit',
  rows: 'Rows',
}

/** The four sub-1024px "What I work with" candidates (2026-09-11 owner feedback: "in mobile this
 *  section is still horrible, find another way... maybe accordions"), selectable with
 *  `?skillsMobile=<id>`, read once on mount exactly like `?skills=`/`?featured=`. The default (no
 *  param) stays the current ledger fallback until the owner picks one from the contact sheet — see
 *  `mobile/MobileSkillsLayout.tsx`. Each differs in mechanism: a) disclosure accordion per group, b) a
 *  draggable card rail, c) one flat ranked list, d) a static clustered map. */
export const MOBILE_LAYOUT_IDS = ['a', 'b', 'c', 'd'] as const
export type MobileLayoutId = (typeof MOBILE_LAYOUT_IDS)[number]

export const isMobileLayoutId = (v: string | null): v is MobileLayoutId => !!v && (MOBILE_LAYOUT_IDS as readonly string[]).includes(v)

export const MOBILE_LAYOUT_META: Record<MobileLayoutId, string> = {
  a: 'Accordion by group',
  b: 'Group cards rail',
  c: 'Ranked list',
  d: 'Constellation',
}
