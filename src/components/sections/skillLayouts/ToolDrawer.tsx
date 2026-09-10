// The orbit's single detail surface (2026-09-10, replacing the orbit3 floating "quick look" card and
// the big center card per the owner's feedback: "more like modals or drawers... images too... so
// everything is more organized"). One instance per mounted layout (`OrbitLayout` or `LedgerLayout`,
// never both at once — see their own comments), portalled to `document.body`: a right-side panel on
// desktop (≥1024px, below the fixed header), a bottom sheet with a drag-to-dismiss grabber below that
// — the same split the case-study sheet (`ProjectModal`) draws between its own two breakpoints, reused
// here via `sheetTokens` rather than forked. Every link inside (captures, roles, "show in index") goes
// through the same `src/lib/sectionLinks.ts`/`toolLinks.ts` the old preview card used — nothing new is
// fabricated, only the presentation changes.
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m, useDragControls, useReducedMotion } from 'framer-motion'
import { useContent, useMediaQuery } from '../../../hooks'
import type { RoleWorkId, SkillGroupId } from '../../../data/registry'
import { fleetIslandLines, fleetLiquidLines, type ToolUsage } from '../../../data/skillUsage'
import { galleryCapture, toolRoleLines, toolThumbs, type ToolThumb } from '../../../lib/toolLinks'
import { requestProduct, requestRole, requestStore, scrollToSection } from '../../../lib/sectionLinks'
import { sheetTokens, type Skin } from '../../gallery'
import { CountUp } from '../../gallery/charts'
import { monogram, toolIcon, ToolMark } from '../skillIcons'
import type { SkillsStrings } from '../skillsFormat'

export interface ToolDrawerProps {
  skin: Skin
  sk: SkillsStrings
  groupLabel: Record<SkillGroupId, string>
  formatTool: (u: ToolUsage) => string
  /** The tool to show. Mirrors `ProjectModal`'s `data`/`open` split: kept non-null through the close
   *  animation (paired with `open=false`) so `AnimatePresence` has real content to animate out. */
  tool: ToolUsage | null
  open: boolean
  onClose: () => void
}

export const DRAWER_ID = 'orbit-tool-drawer'
const DRAWER_TITLE_ID = 'orbit-tool-drawer-title'
// A strong ease-out (framer's "expo out" family) — the rules call for ≤0.35s.
const EASE_OUT_STRONG = [0.16, 1, 0.3, 1] as const
const OPEN_DURATION = 0.32

const fill = (template: string, vars: Record<string, string>) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), template)

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * One capture tile in the drawer's 2-column grid — a real store/product thumbnail (16:10) or, when the
 * fleet has no capture for it, an icon tile carrying the entry's own monogram. Always a real link,
 * never decorative: clicking opens the case-study sheet or switches `ShopifyWork` to its products tab
 * (`requestStore`/`requestProduct`, the same dispatch the old preview card used).
 */
function CaptureTile({ thumb, skin, sk, badges }: { thumb: ToolThumb; skin: Skin; sk: SkillsStrings; badges: { live: string; dev: string } }) {
  const ob = sk.orbit
  const isStore = thumb.kind === 'store'
  const label = isStore ? fill(ob.openStore, { name: thumb.name }) : fill(ob.openProduct, { name: thumb.name })
  const onClick = () => (isStore ? requestStore(thumb.slug) : requestProduct(thumb.id))
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${skin.line}`}
    >
      <span className="relative block aspect-[16/10] w-full overflow-hidden">
        {thumb.hasCapture ? (
          <img
            src={galleryCapture(thumb.kind === 'store' ? thumb.slug : thumb.id)}
            width={320}
            height={200}
            loading="lazy"
            decoding="async"
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <span className={`flex h-full w-full items-center justify-center text-lg font-bold ${skin.dark ? 'bg-white/5' : 'bg-black/[0.03]'} ${skin.muted}`}>{monogram(thumb.name)}</span>
        )}
      </span>
      <span className="flex items-center justify-between gap-2 px-2.5 py-2">
        <span className="min-w-0">
          <span className={`block truncate text-[12px] font-medium ${skin.title}`}>{thumb.name}</span>
          <span className={`block text-[10px] tabular-nums ${skin.muted}`}>{thumb.year}</span>
        </span>
        {isStore && <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] ${thumb.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>{thumb.status === 'live' ? badges.live : badges.dev}</span>}
      </span>
    </button>
  )
}

/**
 * The drawer's actual content — a separate component so its hooks (`useContent`, for the role→company
 * lookup) only run while a tool is really selected, and so the parent can key it by tool for a clean
 * re-mount between two different tools opened back to back.
 */
function DrawerBody({ tool, skin, sk, groupLabel, formatTool, onShowInIndex, onClose }: { tool: ToolUsage; skin: Skin; sk: SkillsStrings; groupLabel: Record<SkillGroupId, string>; formatTool: (u: ToolUsage) => string; onShowInIndex: () => void; onClose: () => void }) {
  const { strings, registry } = useContent()
  const ob = sk.orbit
  const dr = ob.drawer
  const icon = toolIcon(tool.tool)
  const thumbs = toolThumbs(tool, Infinity)
  const roles = toolRoleLines(tool)
  const depth = tool.tool === 'Liquid' ? { label: sk.depthLabel.liquid, value: fleetLiquidLines } : tool.tool === 'TypeScript' ? { label: sk.depthLabel.ts, value: fleetIslandLines } : null
  const hasAnyUsage = thumbs.length > 0 || roles.length > 0

  const roleCompany = (id: RoleWorkId, fallback: string) => {
    const w = registry.roleWork.find((r) => r.id === id)
    const exp = w ? registry.experience.find((e) => e.id === w.role) : undefined
    return { logo: exp?.logo, name: fallback }
  }

  return (
    <>
      <div className="flex items-start gap-3.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${skin.dark ? 'bg-white/[0.06] text-current' : 'bg-black/[0.05] text-current'} ${skin.accent}`}>
          {icon ? <ToolMark tool={tool.tool} className="h-5 w-5" /> : monogram(tool.tool)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={DRAWER_TITLE_ID} className={`truncate text-lg font-semibold leading-tight ${skin.title}`}>
            {tool.tool}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={skin.chip}>{groupLabel[tool.group]}</span>
            <span className={`text-[11px] ${skin.muted}`}>{formatTool(tool)}</span>
          </div>
        </div>
      </div>

      {hasAnyUsage ? (
        <>
          {thumbs.length > 0 && (
            <div className="mt-6">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{dr.capturesLabel}</p>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {thumbs.map((t) => (
                  <CaptureTile key={t.kind === 'store' ? `store-${t.slug}` : `product-${t.id}`} thumb={t} skin={skin} sk={sk} badges={strings.badges} />
                ))}
              </div>
            </div>
          )}

          {roles.length > 0 && (
            <div className="mt-6">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>{dr.rolesLabel}</p>
              <ul className="mt-2 flex flex-col gap-1" role="list">
                {roles.map((r) => {
                  const meta = roleCompany(r.id, r.company)
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => requestRole(r.experienceId)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-2 text-left transition-colors ${skin.rowHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
                      >
                        {meta.logo ? (
                          <img src={meta.logo} alt="" width={22} height={22} loading="lazy" className="h-[22px] w-[22px] shrink-0 rounded object-contain" />
                        ) : (
                          <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded text-[9px] font-bold ${skin.dark ? 'bg-white/10' : 'bg-black/5'} ${skin.muted}`}>{monogram(meta.name)}</span>
                        )}
                        <span className={`text-[12.5px] leading-snug ${skin.body}`}>{fill(ob.usedAt, { company: r.company, role: strings.roleWork[r.id], years: `${r.start}${r.end ? `–${r.end}` : ''}` })}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className={`mt-6 text-sm ${skin.muted}`}>{dr.noCaptures}</p>
      )}

      {depth && (
        <div className={`mt-6 border-t pt-4 ${skin.line}`}>
          <p className={`text-lg font-semibold tabular-nums ${skin.title}`}>
            <CountUp value={depth.value} />
          </p>
          <p className={`mt-0.5 text-[10px] uppercase leading-tight tracking-wide ${skin.muted}`}>{depth.label}</p>
        </div>
      )}

      <div className={`mt-auto flex items-center justify-between gap-3 border-t pt-4 ${skin.line}`}>
        <button type="button" onClick={onShowInIndex} className={`text-left text-[12.5px] font-medium underline-offset-2 hover:underline ${skin.accent}`}>
          {dr.showInIndex}
        </button>
        <button type="button" onClick={onClose} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium ${skin.line} ${skin.body}`}>
          {dr.close}
        </button>
      </div>
    </>
  )
}

/**
 * The drawer shell: backdrop + panel, portalled, focus-trapped, Esc-to-close, drag-to-dismiss on
 * phones. `open`/`tool` mirror `ProjectModal`'s own two props — see that component's header comment —
 * so the exit animation still has real content to render while `AnimatePresence` plays it out.
 */
export function ToolDrawer({ skin, sk, groupLabel, formatTool, tool, open, onClose }: ToolDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<Element | null>(null)
  const drag = useDragControls()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // Focus management: remember what was focused before the drawer opened (the orbit dot / ledger row),
  // move focus into the panel, and give it back on close — never left dangling on a removed trigger.
  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement
    const id = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(focusableSelector)
      ;(first ?? panelRef.current)?.focus()
    }, 0)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(id)
      document.body.style.overflow = prevOverflow
      const el = returnFocusRef.current
      if (el instanceof HTMLElement && document.contains(el)) el.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter((el) => el.offsetParent !== null)
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onShowInIndex = () => {
    scrollToSection('shopify')
    onClose()
  }

  const backdropTransition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const }
  const panelTransition = reduced ? { duration: 0 } : { duration: OPEN_DURATION, ease: EASE_OUT_STRONG }
  const { panel, panelBg } = sheetTokens(skin)

  const content = (
    <AnimatePresence>
      {open && tool && (
        <m.div
          className={`fixed inset-0 z-[9998] flex ${isDesktop ? 'items-stretch justify-end' : 'items-end justify-center'} bg-black/60`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
          onClick={onClose}
        >
          <m.div
            ref={panelRef}
            id={DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={DRAWER_TITLE_ID}
            tabIndex={-1}
            onKeyDown={onPanelKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex w-full flex-col overflow-hidden outline-none ${panel} ${panelBg} shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${isDesktop ? 'top-24 h-[calc(100%-6rem)] max-w-[440px]' : 'max-h-[85vh]'}`}
            initial={isDesktop ? { x: '100%' } : { y: '100%' }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: '100%' } : { y: '100%' }}
            transition={panelTransition}
            drag={isDesktop ? false : 'y'}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
          >
            {!isDesktop && (
              <div className="flex shrink-0 justify-center py-2" onPointerDown={(e) => drag.start(e)} style={{ touchAction: 'none' }} aria-hidden="true">
                <span className={`h-1.5 w-10 rounded-full ${skin.dark ? 'bg-white/25' : 'bg-black/20'}`} />
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-6" data-lenis-prevent>
              <div className="flex min-h-full flex-col">
                <DrawerBody tool={tool} skin={skin} sk={sk} groupLabel={groupLabel} formatTool={formatTool} onShowInIndex={onShowInIndex} onClose={onClose} />
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
