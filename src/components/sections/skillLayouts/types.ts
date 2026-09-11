// Shared shape the "What I work with" layouts (the orbit and its ledger fallback) render from — all
// real data, nothing layout-specific computed twice. Skills.tsx builds this once.
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
