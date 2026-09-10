// Real brand marks for the skill tiles, from the `simple-icons` package — never a guessed or
// unofficial logo. A tool with no entry in `ICONS` (no simple-icons match exists, e.g. Playwright,
// MCP, or a Digitdeck-specific practice like "AOV & funnel optimization") falls back to a monogram
// tile in Skills.tsx, drawn from the tool's own name.
import {
  siShopify,
  siGraphql,
  siRemix,
  siWebassembly,
  siReact,
  siNextdotjs,
  siVite,
  siTailwindcss,
  siGreensock,
  siFramer,
  siNodedotjs,
  siTypescript,
  siPrisma,
  siPostgresql,
  siRedis,
  siVitest,
  siGithubactions,
  siLighthouse,
  siClaude,
  type SimpleIcon,
} from 'simple-icons'

/** Exact tool name (as spelled in `skillGroups`, src/data/registry.ts) -> its real brand mark.
 *  Shopify-native concepts without their own distinct logo (Liquid, Online Store 2.0, theme blocks,
 *  metaobjects, web pixels, theme app extensions, app proxy, billing API, store migrations) share the
 *  Shopify bag — they ARE Shopify platform primitives, not a separate brand. */
const ICONS: Record<string, SimpleIcon> = {
  'Liquid': siShopify,
  'Online Store 2.0': siShopify,
  'Theme Blocks': siShopify,
  'Metaobjects & metafields': siShopify,
  'Admin & Storefront GraphQL': siGraphql,
  'Shopify CLI': siShopify,
  'Embedded apps (Remix)': siRemix,
  'Shopify Functions → WASM': siWebassembly,
  'Web Pixels': siShopify,
  'Theme App Extensions': siShopify,
  'App Proxy': siShopify,
  'Billing API': siShopify,
  'Store migrations': siShopify,
  'React': siReact,
  'Remix': siRemix,
  'Next.js': siNextdotjs,
  'Vite': siVite,
  'Tailwind CSS': siTailwindcss,
  'GSAP': siGreensock,
  'Framer Motion': siFramer,
  'Node.js': siNodedotjs,
  'TypeScript': siTypescript,
  'Prisma': siPrisma,
  'PostgreSQL': siPostgresql,
  'Redis': siRedis,
  'REST & GraphQL': siGraphql,
  'Vitest': siVitest,
  'GitHub Actions': siGithubactions,
  'Lighthouse / Core Web Vitals': siLighthouse,
  'Claude Code': siClaude,
}

export function toolIcon(tool: string): SimpleIcon | undefined {
  return ICONS[tool]
}

/** First letter of up to two significant words — the fallback mark for a tool with no official brand
 *  icon. A short all-caps acronym (MCP, AOV…) prints whole rather than getting cut to two letters. */
export function monogram(tool: string): string {
  const words = tool
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) {
    const w = words[0]
    return /^[A-Z0-9]+$/.test(w) && w.length <= 4 ? w : w.slice(0, 2).toUpperCase()
  }
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** One 24x24 tool mark, drawn in `currentColor` — never the brand's own hex — so it always matches
 *  whichever skin/state colors the tile around it. Renders nothing when the tool has no real icon;
 *  callers fall back to `monogram()`. */
export function ToolMark({ tool, className }: { tool: string; className?: string }) {
  const icon = toolIcon(tool)
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}
