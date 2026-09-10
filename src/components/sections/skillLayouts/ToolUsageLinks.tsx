// Real, clickable usage for one tool — up to 4 store/product capture thumbnails plus a line per
// client-role deliverable. Shared by the orbit layout's floating preview card and center card, and by
// SkillPanel (the ledger/tiles/wall fallback's side panel), so "what links where" is defined once.
// Every click goes through src/lib/sectionLinks.ts — it never fabricates a destination.
import { useContent } from '../../../hooks'
import { requestProduct, requestRole, requestStore } from '../../../lib/sectionLinks'
import { galleryCapture, toolRoleLines, toolThumbs, type ToolThumb } from '../../../lib/toolLinks'
import type { ToolUsage } from '../../../data/skillUsage'
import type { Skin } from '../../gallery'
import type { SkillsStrings } from '../skillsFormat'
import { monogram } from '../skillIcons'

interface ToolUsageLinksProps {
  tool: ToolUsage
  skin: Skin
  sk: SkillsStrings
  /** 'floating' = the orbit's small hover/press preview card; 'panel' = the larger SkillPanel/center
   *  card context, where the thumbnails can run a little bigger. */
  size?: 'sm' | 'md'
}

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

export function ToolUsageLinks({ tool, skin, sk, size = 'sm' }: ToolUsageLinksProps) {
  const { strings, formatPeriod } = useContent()
  const ob = sk.orbit
  const thumbs = toolThumbs(tool, 4)
  const roles = toolRoleLines(tool)
  if (thumbs.length === 0 && roles.length === 0) return null

  const thumbSize = size === 'sm' ? 'h-9 w-12' : 'h-11 w-16'
  const thumbKey = (t: ToolThumb) => (t.kind === 'store' ? `store-${t.slug}` : `product-${t.id}`)
  const thumbLabel = (t: ToolThumb) => (t.kind === 'store' ? fill(ob.openStore, { name: t.name }) : fill(ob.openProduct, { name: t.name }))
  const onThumbClick = (t: ToolThumb) => () => (t.kind === 'store' ? requestStore(t.slug) : requestProduct(t.id))

  return (
    <div className="flex flex-col gap-2">
      {thumbs.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-1.5" role="list">
          {thumbs.map((t) => (
            <li key={thumbKey(t)}>
              <button
                type="button"
                onClick={onThumbClick(t)}
                aria-label={thumbLabel(t)}
                title={t.name}
                className={`block overflow-hidden rounded-md border transition-transform duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${thumbSize} ${skin.line}`}
              >
                {t.hasCapture ? (
                  <img
                    src={galleryCapture(t.kind === 'store' ? t.slug : t.id)}
                    width={128}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <span className={`flex h-full w-full items-center justify-center text-[9px] font-bold ${skin.dark ? 'bg-white/5' : 'bg-black/[0.03]'} ${skin.muted}`}>{monogram(t.name)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {roles.length > 0 && (
        <ul className="flex flex-col items-center gap-1" role="list">
          {roles.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => requestRole(r.experienceId)}
                aria-label={fill(ob.openRole, { company: r.company })}
                className={`text-center text-[10px] leading-tight underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${skin.muted}`}
              >
                {fill(ob.usedAt, { company: r.company, role: strings.roleWork[r.id], years: formatPeriod(r.start, r.end) })}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
