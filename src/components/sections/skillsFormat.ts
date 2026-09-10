// Shared between Skills.tsx and SkillPanel.tsx (kept in its own module so neither imports the other).
import type { ToolUsage } from '../../data/skillUsage'
import type { PortfolioContent } from '../../content/types'

export type SkillsStrings = PortfolioContent['sections']['skills']

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many).replace('{n}', String(n))

export const formatTool = (sk: SkillsStrings, u: ToolUsage) => {
  const parts: string[] = []
  if (u.stores) parts.push(plural(u.stores, sk.usage.storesUnitOne, sk.usage.storesUnit))
  if (u.products) parts.push(plural(u.products, sk.usage.productsUnitOne, sk.usage.productsUnit))
  if (u.roleWork) parts.push(plural(u.roleWork, sk.usage.roleUnitOne, sk.usage.roleUnit))
  return parts.length ? parts.join(' · ') : sk.usage.noData
}

export const formatGroup = (sk: SkillsStrings, n: number) => plural(n, sk.usage.storesUnitOne, sk.usage.storesUnit)
