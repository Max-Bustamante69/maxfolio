// Real per-tool usage, derived once from the registry — never a curated or invented number.
// A tool's count is how many storefronts, products or named client-role deliverables actually list
// it in their own `stack` array. A tool that never appears there (internal tooling, editorial-only
// entries in skillGroups) gets `total: 0` — its tile shows an honest "no fleet count yet" tag instead
// of a fabricated number (Skills.tsx / SkillPanel.tsx).
import { products, roleWork, skillGroups, stores, type RoleWorkId, type SkillGroupId } from './registry'
import { telemetry } from './telemetry'

interface StackEntry {
  stack: readonly string[]
}

/** One regex per tool in `skillGroups`, hand-authored (not auto-derived) so a match is always a real,
 *  checkable claim. Case-insensitive; word boundaries where a bare match would over-count (e.g. "React"
 *  inside an unrelated word). Deliberately narrow — "Framer → Liquid" (a design-tool port) must never
 *  count toward "Framer Motion" (the animation library), even though both start with "Framer". */
const ALIASES: Record<string, RegExp> = {
  // shopify
  'Liquid': /liquid/i,
  'Online Store 2.0': /online store 2\.0|\bos 2\.0\b/i,
  'Theme Blocks': /theme block/i,
  'Metaobjects & metafields': /metaobject|metafield/i,
  'Admin & Storefront GraphQL': /graphql/i,
  'Shopify CLI': /shopify cli/i,
  'Embedded apps (Remix)': /\bremix\b/i,
  'Shopify Functions → WASM': /shopify functions|\bwasm\b/i,
  'Web Pixels': /web pixel/i,
  'Theme App Extensions': /theme app extension/i,
  'App Proxy': /app proxy/i,
  'Billing API': /billing api/i,
  'Store migrations': /migrat|transfer|woocommerce/i,
  // frontend
  'React': /\breact\b/i,
  'Remix': /\bremix\b/i,
  'Next.js': /next\.?js/i,
  'Vite': /\bvite\b/i,
  'Tailwind CSS': /tailwind/i,
  'GSAP': /\bgsap\b/i,
  'Framer Motion': /framer motion|framer-motion/i,
  'Accessibility': /accessib|\ba11y\b/i,
  // backend
  'Node.js': /node\.?js/i,
  'TypeScript': /typescript/i,
  'Prisma': /prisma/i,
  'PostgreSQL': /postgres/i,
  'Redis': /redis/i,
  'BullMQ': /bullmq/i,
  'REST & GraphQL': /\brest\b|graphql/i,
  'Multi-tenant architecture': /multi-tenant/i,
  // quality
  'Playwright': /playwright/i,
  'Vitest': /vitest/i,
  'GitHub Actions': /github actions/i,
  'Lighthouse / Core Web Vitals': /lighthouse|core web vitals|web quality/i,
  // cro
  'A/B testing (Bayesian, SRM)': /a\/b test/i,
  'First-party event instrumentation': /first-party|\btrack\b|\btracking\b|\bpixel\b/i,
  'AOV & funnel optimization': /\baov\b|funnel|bundle|quiz|upsell|purchase offer/i,
  // ai
  'Claude Code': /claude code/i,
  'Codex': /\bcodex\b/i,
  'MCP': /\bmcp\b/i,
  'Multi-agent orchestration': /multi-agent/i,
  'Evaluation suites': /evaluation suite|\beval\b/i,
}

const matches = <T extends StackEntry>(entries: readonly T[], re: RegExp): T[] => entries.filter((e) => e.stack.some((s) => re.test(s)))

export interface ToolUsage {
  tool: string
  group: SkillGroupId
  /** Real storefronts whose stack names this tool. */
  stores: number
  /** Real in-house products (Apps, Platform, Track…) whose stack names this tool. */
  products: number
  /** Real named client-role deliverables whose stack names this tool. */
  roleWork: number
  total: number
  /** The actual names/ids behind the counts above — real registry matches, in registry order, for the
   *  skill panel's "used in" list. Never a curated subset. */
  storeNames: string[]
  productNames: string[]
  roleWorkIds: RoleWorkId[]
}

export const toolUsage: ToolUsage[] = (Object.keys(skillGroups) as SkillGroupId[]).flatMap((group) =>
  (skillGroups[group] as readonly string[]).map((tool): ToolUsage => {
    const re = ALIASES[tool]
    const matchedStores = re ? matches(stores, re) : []
    const matchedProducts = re ? matches(products, re) : []
    const matchedRoleWork = re ? matches(roleWork, re) : []
    return {
      tool,
      group,
      stores: matchedStores.length,
      products: matchedProducts.length,
      roleWork: matchedRoleWork.length,
      total: matchedStores.length + matchedProducts.length + matchedRoleWork.length,
      storeNames: matchedStores.map((s) => s.name),
      productNames: matchedProducts.map((p) => p.name),
      roleWorkIds: matchedRoleWork.map((w) => w.id),
    }
  }),
)

export const toolUsageById = new Map(toolUsage.map((u) => [u.tool, u]))

/** Distinct storefronts that name at least one tool from a group — a real, non-double-counted figure,
 *  used only to annotate the group-filter tabs above the tile grid. */
export const storesPerGroup: Record<SkillGroupId, number> = Object.fromEntries(
  (Object.keys(skillGroups) as SkillGroupId[]).map((g) => {
    const res = (skillGroups[g] as readonly string[]).map((t) => ALIASES[t]).filter(Boolean) as RegExp[]
    const n = stores.filter((s) => res.some((re) => s.stack.some((tag) => re.test(tag)))).length
    return [g, n]
  }),
) as Record<SkillGroupId, number>

/** Fleet-wide depth: real lines of Liquid and of TypeScript/TSX islands, summed from every store's own
 *  git-derived telemetry (`scripts/store-telemetry.mjs`) — never estimated. */
export const fleetLiquidLines = Object.values(telemetry).reduce((a, t) => a + t.lines.liquid, 0)
export const fleetIslandLines = Object.values(telemetry).reduce((a, t) => a + t.lines.islands, 0)
export const fleetStoreCount = stores.length
/** Real in-house products shipped (Apps, Platform, Track…) — feeds the orbit layout's center-card
 *  at-rest stat, never a curated or rounded figure. */
export const fleetProductCount = products.length
