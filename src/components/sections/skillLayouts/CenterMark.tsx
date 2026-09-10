// The orbit's fixed center ornament (2026-09-10, replacing the old center card). Owner feedback on
// the orbit3 preview: "for the orbit, all the numbers should go into the preview (the drawer), not
// in that card in the middle; use the middle for something different — a logo or something — that
// data looks horrible there." The fleet totals moved into `ToolDrawer`'s new "fleet-wide" strip
// (shown regardless of which tool is open); this component fills the vacated center with a small
// per-theme "MB" mark instead.
//
// Every experience already has its own nav-mark treatment — `LogoSelectorApple/Luxury/Brutalist`,
// Terminal's `MB$` wordmark, Persona's skewed-button lettering, Neo's raised-disc controls — so this
// reuses each one's *look* (colors, shape, type) without importing those components: they carry a
// menu/popover this decoration must not have, and this mark is purely `aria-hidden` (it opens
// nothing, links nowhere).
//
// Idle motion only, both transform-only: the disc itself breathes (scale 1 → 1.03, 8s ease-in-out,
// a full cycle every 8s — clears the ≥6s/cycle rule) and a dashed hairline ring behind it turns once
// every 90s counter to the innermost orbit ring's own direction (that ring is also 90s, clockwise —
// see `DURATIONS`/`ringSpecs` in `OrbitLayout`). A *uniform* stroke ring rotating would be invisible
// (a plain circle is rotationally symmetric); the dash pattern is what makes the 90s turn legible,
// same trick `.persona-ring` already uses elsewhere in this theme. Both animations are reset to
// static by the shared `prefers-reduced-motion` rule in `OrbitLayout`'s `ORBIT_CSS` — belt-and-
// suspenders, since `OrbitLayout` itself never mounts this component under reduced motion (the whole
// layout falls back to the ledger there).
import type { CSSProperties, ReactNode } from 'react'
import type { Skin } from '../../gallery'

interface MarkSpec {
  /** Full shape + size + color classes for the disc/slab/badge itself (never the breathing/rotation
   *  animation classes — those are applied once by the component, not per-theme). */
  discClass: string
  textClass: string
  /** Tailwind `stroke-*`/`text-*` classes for the SVG ring — reuses each skin's own accent exactly
   *  the way `OrbitLayout`'s ring/label paint does (`${skin.accent} stroke-current}`). */
  ringClass: string
  style?: CSSProperties
  content: ReactNode
}

function markFor(skin: Skin): MarkSpec {
  const dark = skin.dark
  switch (skin.frame) {
    case 'luxury':
      return {
        discClass: `h-[120px] w-[120px] rounded-full border ${dark ? 'border-deco-gold/50 bg-deco-navy/60' : 'border-luxury-gold/60 bg-white/80'}`,
        textClass: `font-display text-base tracking-[0.1em] ${dark ? 'text-deco-cream' : 'text-luxury-black'}`,
        ringClass: `${skin.accent} stroke-current`,
        content: 'MB',
      }
    case 'brutalist':
      return {
        discClass: 'h-[108px] w-[108px] border-2 border-red-600 bg-stone-950',
        textClass: 'font-mono text-base font-black uppercase tracking-tight text-stone-100',
        ringClass: `${skin.accent} stroke-current`,
        content: 'MB',
      }
    case 'neo':
      return {
        discClass: `h-[120px] w-[120px] rounded-full ${dark ? 'bg-neo-darkSurfaceRaised' : 'bg-neo-surfaceRaised'}`,
        textClass: `font-neo text-[15px] font-extrabold tracking-tight ${dark ? 'text-neo-darkInk' : 'text-neo-ink'}`,
        ringClass: dark ? 'stroke-white/12' : 'stroke-black/10',
        style: { boxShadow: dark ? '8px 8px 20px #16181e, -8px -8px 20px #333844' : '8px 8px 20px #b8bcc7, -8px -8px 20px #ffffff' },
        content: 'MB',
      }
    case 'terminal':
      return {
        discClass: 'h-[108px] w-[108px] rounded-none border border-[var(--term-line)] bg-[var(--term-panel)]',
        textClass: 'font-mono text-base font-bold',
        ringClass: `${skin.accent} stroke-current`,
        content: (
          <>
            <span className="text-[var(--term-accent)]">MB</span>
            <span className="text-[var(--term-muted)]">$</span>
          </>
        ),
      }
    case 'persona':
      return {
        discClass: `persona-skew-btn h-[108px] w-[108px] ${skin.accentBg}`,
        textClass: `font-persona-label text-sm font-bold uppercase tracking-[0.1em] ${dark ? 'text-[#f5f2ee]' : 'text-white'}`,
        ringClass: `${skin.accent} stroke-current`,
        content: 'MB',
      }
    case 'apple':
    default:
      // Always a white disc, exactly like `LogoSelectorApple`'s own nav mark — including in dark mode,
      // where the section's own surface (`bg-apple-darkSurface`, #1d1d1f) is the same color a near-black
      // disc would have used, so a dark-on-dark fill here would render with zero contrast against its
      // own background (measured: 0 border, 0 shadow, identical RGB). White reuses the nav's real
      // treatment and stays visible in both modes; only the shadow is light-only, same as the nav mark.
      return {
        discClass: `h-[120px] w-[120px] rounded-full bg-white ${dark ? '' : 'shadow-[0_4px_20px_rgba(0,0,0,0.10)]'}`,
        textClass: `font-sf text-[15px] font-semibold tracking-tight ${dark ? 'text-black' : 'text-[#1d1d1f]'}`,
        ringClass: dark ? 'stroke-white/15' : 'stroke-black/12',
        content: 'MB',
      }
  }
}

export function CenterMark({ skin }: { skin: Skin }) {
  const mark = markFor(skin)
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <svg viewBox="0 0 136 136" className="mfCenterRing absolute left-1/2 top-1/2 h-[136px] w-[136px] -translate-x-1/2 -translate-y-1/2">
        <circle cx="68" cy="68" r="64" fill="none" strokeWidth="1" strokeDasharray="3 11" className={mark.ringClass} />
      </svg>
      <span className={`mfCenterBreathe relative flex items-center justify-center ${mark.discClass}`} style={mark.style}>
        <span className={mark.textClass}>{mark.content}</span>
      </span>
    </div>
  )
}
