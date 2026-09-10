// Shared between Skills.tsx and SkillPanel.tsx (kept in its own module so neither imports the other).
import type { ToolUsage } from '../../data/skillUsage'
import type { PortfolioContent } from '../../content/types'

export type SkillsStrings = PortfolioContent['sections']['skills']

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many).replace('{n}', String(n))

export const formatTool = (sk: SkillsStrings, u: ToolUsage) => {
  const parts: string[] = []
  if (u.stores) parts.push(plural(u.stores, sk.sunburst.storesUnitOne, sk.sunburst.storesUnit))
  if (u.products) parts.push(plural(u.products, sk.sunburst.productsUnitOne, sk.sunburst.productsUnit))
  if (u.roleWork) parts.push(plural(u.roleWork, sk.sunburst.roleUnitOne, sk.sunburst.roleUnit))
  return parts.length ? parts.join(' · ') : sk.sunburst.noData
}

export const formatGroup = (sk: SkillsStrings, n: number) => plural(n, sk.sunburst.storesUnitOne, sk.sunburst.storesUnit)
