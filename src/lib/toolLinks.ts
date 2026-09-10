// Resolves a tool's real usage (skillUsage.ts) into linkable, capturable things — a store slug, a
// product id, a client-role's company/period — for the orbit preview card and the ledger fallback's
// tap-to-expand row. Registry-only (no i18n strings) so it stays a plain, testable data function;
// the components that render this attach locale-formatted labels around it.
import { products, stores, roleWork, experience, type RoleWorkId } from '../data/registry'
import type { ToolUsage } from '../data/skillUsage'

export interface StoreThumb {
  kind: 'store'
  slug: string
  name: string
  hasCapture: boolean
  status: 'live' | 'dev'
}
export interface ProductThumb {
  kind: 'product'
  id: string
  name: string
  hasCapture: boolean
}
export type ToolThumb = StoreThumb | ProductThumb

export interface ToolRoleLine {
  id: RoleWorkId
  /** The job this role-work belongs to — what Experience.tsx's rail selects by. */
  experienceId: string
  company: string
  start: string
  end: string | null
}

/** Up to `max` real store/product thumbnails a tool is used in, stores first — the same order
 *  `formatTool`/the center card already use. Names that no longer resolve to a registry entry (should
 *  never happen — `skillUsage.ts` derives them from the same registry) are dropped rather than
 *  rendered as a dead link. */
export function toolThumbs(tool: ToolUsage, max = 4): ToolThumb[] {
  const storeThumbs: StoreThumb[] = tool.storeNames
    .map((name): StoreThumb | null => {
      const st = stores.find((s) => s.name === name)
      return st ? { kind: 'store', slug: st.slug, name: st.name, hasCapture: st.gallery, status: st.status } : null
    })
    .filter((t): t is StoreThumb => t !== null)
  const productThumbs: ProductThumb[] = tool.productNames
    .map((name): ProductThumb | null => {
      const p = products.find((x) => x.name === name)
      return p ? { kind: 'product', id: p.id, name: p.name, hasCapture: p.gallery } : null
    })
    .filter((t): t is ProductThumb => t !== null)
  return [...storeThumbs, ...productThumbs].slice(0, max)
}

/** Real client-role deliverables that list this tool in their own `stack` — company + the role-work's
 *  own timeline (not the parent job's full tenure), matching the years a shopper would actually see
 *  printed on the role-work's own record. */
export function toolRoleLines(tool: ToolUsage): ToolRoleLine[] {
  return tool.roleWorkIds
    .map((id): ToolRoleLine | null => {
      const w = roleWork.find((r) => r.id === id)
      if (!w) return null
      const exp = experience.find((e) => e.id === w.role)
      return { id, experienceId: w.role, company: exp?.company ?? '', start: w.timeline.start, end: w.timeline.end }
    })
    .filter((r): r is ToolRoleLine => r !== null)
}

export const galleryCapture = (slugOrId: string) => `/gallery/${slugOrId}/home-desktop.webp`
