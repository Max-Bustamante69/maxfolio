// Per-theme skins for the shared gallery components. The frame geometry is shared;
// each experience only decides colors, radii and type.
import type { CSSProperties } from 'react'

export type FrameStyle = 'apple' | 'luxury' | 'brutalist' | 'neo' | 'persona' | 'terminal' | 'skyline'

/** Tokens the vendored house Carousel reads (`--color-control-*`, `--duration-base`). Without them the
 *  controls fall back to currentColor and an invalid transition, so every skin defines the full set. */
export function carouselTokens(frame: FrameStyle, isDark: boolean): CSSProperties {
  const t = {
    apple: { arrow: isDark ? '#f5f5f7' : '#1d1d1f', on: '#0071e3', dot: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.22)', active: isDark ? '#f5f5f7' : '#1d1d1f', brand: '#0071e3', surface: isDark ? '#000000' : '#fbfbfd' },
    luxury: { arrow: isDark ? '#d4af37' : '#C9A962', on: isDark ? '#f5f0e1' : '#1a1a1a', dot: isDark ? 'rgba(245,240,225,0.3)' : 'rgba(26,26,26,0.2)', active: isDark ? '#d4af37' : '#C9A962', brand: isDark ? '#d4af37' : '#C9A962', surface: isDark ? '#1a1f3c' : '#faf8f5' },
    brutalist: { arrow: '#dc2626', on: isDark ? '#f5f5f4' : '#1c1917', dot: isDark ? 'rgba(245,245,244,0.3)' : 'rgba(28,25,23,0.25)', active: '#dc2626', brand: '#dc2626', surface: isDark ? '#0c0a09' : '#f5f5f4' },
    neo: { arrow: isDark ? '#e7e9ee' : '#3a3f4b', on: isDark ? '#8b93ff' : '#4453d9', dot: isDark ? 'rgba(231,233,238,0.3)' : 'rgba(58,63,75,0.22)', active: isDark ? '#8b93ff' : '#4453d9', brand: isDark ? '#8b93ff' : '#4453d9', surface: isDark ? '#262a33' : '#e6e9ef' },
    // Ink variant (dark) = P5-evoking red; ice variant (light) = P3-evoking blue. One hero accent only.
    persona: isDark
      ? { arrow: '#c8102e', on: '#f5f2ee', dot: 'rgba(245,242,238,0.3)', active: '#c8102e', brand: '#c8102e', surface: '#111013' }
      : { arrow: '#1c6fb0', on: '#0a0f1a', dot: 'rgba(10,15,26,0.25)', active: '#1c6fb0', brand: '#1c6fb0', surface: '#eef3f7' },
    // Terminal is a single always-dark register; the reactive phosphor accent (green/amber) lives in
    // the CSS custom property `--term-accent` set on `.theme-terminal`, so these controls follow the
    // live toggle instead of freezing whichever color was true at render time.
    terminal: { arrow: 'var(--term-ink)', on: 'var(--term-bg)', dot: 'rgba(220,228,220,0.25)', active: 'var(--term-accent)', brand: 'var(--term-accent)', surface: 'var(--term-bg)' },
    // Skyline is a fixed dark register (no light mode) — every control token stays a neutral
    // ice-blue, never the reserved cyan #4fd1ff (that lands only on real numerals/chart fills, per skin.accentBg below).
    skyline: { arrow: '#c7d2e0', on: '#eaf2fb', dot: 'rgba(199,210,224,0.3)', active: '#eaf2fb', brand: '#7fb0d1', surface: '#141d2e' },
  }[frame]
  return {
    '--color-control-arrow': t.arrow,
    '--color-control-arrow-on': t.on,
    '--color-control-dot': t.dot,
    '--color-control-dot-active': t.active,
    '--color-brand-primary': t.brand,
    '--color-heading': t.arrow,
    '--color-surface': t.surface,
    '--duration-base': '200ms',
  } as CSSProperties
}

export interface Skin {
  frame: FrameStyle
  dark: boolean
  card: string // card container classes
  title: string // project name classes
  body: string // regular text
  muted: string
  accent: string
  chip: string // idle chip: shape + colors
  chipOn: string // active chip: shape + colors (never combined with `chip`)
  badgeLive: string
  badgeDev: string
  rowHover: string // list rows in Shopify Work
  divider: string // divide-y color for those rows
  line: string // hairline border color (editorial rows, stat bands, timelines)
  accentBg: string // accent as a background (indicators, dots, progress)
}

export const skins: Record<FrameStyle, (isDark: boolean) => Skin> = {
  apple: (d) => ({
    frame: 'apple',
    dark: d,
    card: `rounded-[22px] ${d ? 'bg-[#1d1d1f]' : 'bg-white'} shadow-[0_4px_24px_rgba(0,0,0,0.06)]`,
    title: `font-semibold tracking-tight ${d ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`,
    body: d ? 'text-[#d2d2d7]' : 'text-[#1d1d1f]',
    muted: d ? 'text-[#a1a1a6]' : 'text-[#6e6e73]',
    // Light accent is Apple's text-safe blue (#0066cc, 5.1:1 on white); the badge greens clear AA on their tints.
    accent: d ? 'text-[#2997ff]' : 'text-[#0066cc]',
    chip: `rounded-full px-2.5 py-1 text-[11px] ${d ? 'bg-white/10 text-[#d2d2d7]' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`,
    chipOn: `rounded-full px-2.5 py-1 text-[11px] font-medium ${d ? 'bg-white text-black' : 'bg-[#1d1d1f] text-white'}`,
    badgeLive: d ? 'bg-[#34c759]/20 text-[#5ee082]' : 'bg-[#34c759]/15 text-[#136329]',
    badgeDev: d ? 'bg-[#ff9f0a]/20 text-[#ffbf4d]' : 'bg-[#ff9f0a]/15 text-[#8a5300]',
    rowHover: d ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]',
    divider: d ? 'divide-white/10 border-white/10' : 'divide-black/10 border-black/10',
    line: d ? 'border-white/10' : 'border-black/10',
    accentBg: d ? 'bg-[#2997ff]' : 'bg-[#0066cc]',
  }),
  luxury: (d) => ({
    frame: 'luxury',
    dark: d,
    card: `border ${d ? 'border-deco-gold/20 bg-deco-navy/30' : 'border-luxury-black/10 bg-white/60'}`,
    title: `font-display ${d ? 'text-deco-cream' : 'text-luxury-black'}`,
    body: d ? 'text-deco-cream/80' : 'text-luxury-black/80',
    muted: d ? 'text-deco-cream/50' : 'text-luxury-black/50',
    accent: d ? 'text-deco-gold' : 'text-luxury-gold',
    chip: `border px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${d ? 'border-deco-gold/20 text-deco-cream/60' : 'border-luxury-black/10 text-luxury-black/60'}`,
    chipOn: `border px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${d ? 'bg-deco-gold text-deco-navy border-deco-gold' : 'bg-luxury-black text-luxury-cream border-luxury-black'}`,
    badgeLive: d ? 'bg-deco-gold text-deco-navy' : 'bg-luxury-black text-luxury-cream',
    badgeDev: `border ${d ? 'border-deco-gold text-deco-gold' : 'border-luxury-gold text-luxury-gold'}`,
    rowHover: d ? 'hover:bg-deco-gold/5' : 'hover:bg-luxury-gold/5',
    divider: d ? 'divide-deco-gold/20 border-deco-gold/20' : 'divide-luxury-black/10 border-luxury-black/10',
    line: d ? 'border-deco-gold/20' : 'border-luxury-black/10',
    accentBg: d ? 'bg-deco-gold' : 'bg-luxury-gold',
  }),
  brutalist: (d) => ({
    frame: 'brutalist',
    dark: d,
    card: `border-2 ${d ? 'border-stone-700 bg-stone-900' : 'border-stone-900 bg-stone-100'}`,
    title: `font-editorial italic ${d ? 'text-stone-100' : 'text-stone-900'}`,
    body: d ? 'text-stone-300' : 'text-stone-700',
    muted: 'text-stone-500',
    accent: 'text-red-600',
    chip: `font-mono text-[10px] px-2 py-1 ${d ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-600'}`,
    chipOn: 'font-mono text-[10px] px-2 py-1 bg-red-600 text-white',
    badgeLive: 'bg-red-600 text-white font-mono uppercase',
    badgeDev: 'border-2 border-red-600 text-red-600 font-mono uppercase',
    rowHover: d ? 'hover:bg-stone-800/60' : 'hover:bg-stone-200/60',
    divider: d ? 'divide-stone-700 border-stone-700' : 'divide-stone-900 border-stone-900',
    line: d ? 'border-stone-700' : 'border-stone-900',
    accentBg: 'bg-red-600',
  }),
  neo: (d) => ({
    frame: 'neo',
    dark: d,
    card: 'neo-raised neo-lg',
    title: `font-semibold ${d ? 'text-neo-darkInk' : 'text-neo-ink'}`,
    body: d ? 'text-neo-darkInk' : 'text-neo-ink',
    muted: d ? 'text-neo-darkInkMuted' : 'text-neo-inkMuted',
    accent: d ? 'text-neo-darkAccent' : 'text-neo-accent',
    // Idle = raised chip; active = inset chip with the flat accent fill (§2.5.4 — state never rides on shadow alone).
    chip: 'neo-chip',
    chipOn: 'neo-chip-on',
    badgeLive: d ? 'bg-neo-darkAccent/20 text-neo-darkAccent' : 'bg-neo-accent/15 text-neo-accent',
    badgeDev: d ? 'text-neo-darkInkMuted bg-white/5' : 'text-neo-inkMuted bg-black/5',
    rowHover: d ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]',
    divider: d ? 'divide-white/10 border-white/10' : 'divide-black/[0.06] border-black/[0.06]',
    line: d ? 'border-white/10' : 'border-black/[0.08]',
    accentBg: d ? 'bg-neo-darkAccent' : 'bg-neo-accent',
  }),
  // Ice variant is the default (light); Ink is the dark mode. Two-key-color law: ink/paper neutrals
  // plus exactly one hero accent per mode — no diluting sub-colors (wf4-persona.md idea #1).
  persona: (d) => ({
    frame: 'persona',
    dark: d,
    card: `border ${d ? 'border-[#c8102e]/25 bg-[#18161a]' : 'border-[#1c6fb0]/20 bg-white'} clip-corner-sm`,
    title: `font-persona-label uppercase tracking-wide ${d ? 'text-[#f5f2ee]' : 'text-[#0a0f1a]'}`,
    body: d ? 'text-[#f5f2ee]/80' : 'text-[#0a0f1a]/80',
    // /55 clears AA against every surface this theme puts under it (page ink, the lighter card bg);
    // paper needs /60 for the same 4.5:1 floor (measured against the page bg).
    muted: d ? 'text-[#f5f2ee]/55' : 'text-[#0a0f1a]/60',
    // Small text on ink (#111013) needs its own lighter tint of the hero red — #c8102e itself only
    // clears ~3.2:1 there, short of AA's 4.5:1 for text this size; #e8465f clears 4.9:1 (measured).
    accent: d ? 'text-[#e8465f]' : 'text-[#1c6fb0]',
    chip: `font-persona-label uppercase tracking-[0.15em] px-2.5 py-1 text-[11px] skew-chip ${d ? 'bg-[#f5f2ee]/10 text-[#f5f2ee]/70' : 'bg-[#0a0f1a]/5 text-[#0a0f1a]/70'}`,
    chipOn: `font-persona-label uppercase tracking-[0.15em] px-2.5 py-1 text-[11px] skew-chip ${d ? 'bg-[#c8102e] text-[#f5f2ee]' : 'bg-[#1c6fb0] text-white'}`,
    badgeLive: d ? 'bg-[#c8102e] text-[#f5f2ee] font-persona-label uppercase' : 'bg-[#1c6fb0] text-white font-persona-label uppercase',
    badgeDev: `border ${d ? 'border-[#c8102e] text-[#e8465f]' : 'border-[#1c6fb0] text-[#1c6fb0]'} font-persona-label uppercase`,
    rowHover: d ? 'hover:bg-[#c8102e]/[0.06] hover:skew-row' : 'hover:bg-[#1c6fb0]/[0.05] hover:skew-row',
    divider: d ? 'divide-[#f5f2ee]/10 border-[#f5f2ee]/10' : 'divide-[#0a0f1a]/10 border-[#0a0f1a]/10',
    line: d ? 'border-[#f5f2ee]/10' : 'border-[#0a0f1a]/10',
    accentBg: d ? 'bg-[#c8102e]' : 'bg-[#1c6fb0]',
  }),
  // Terminal ("engineer-for-engineers"): a single always-dark register, so `d` is ignored — every
  // color reads from the `--term-*` custom properties defined in terminal.css, which is what lets
  // the green/amber accent toggle (persisted in localStorage) update the whole page without a
  // React re-render. `accentBg` intentionally points at the darker `--term-fill` token, not the
  // bright `--term-accent` used for text/borders: shared sections (Contact's step badges,
  // Projects' hover monogram) hardcode `text-white` on top of it, and white-on-bright-phosphor-green
  // fails AA — the darker fill keeps the same hue family while staying readable under white text.
  terminal: () => ({
    frame: 'terminal',
    dark: true,
    card: 'border border-[var(--term-line)] bg-[var(--term-panel)]',
    title: 'font-mono font-semibold text-[var(--term-ink)]',
    body: 'font-mono text-[var(--term-ink)]',
    muted: 'font-mono text-[var(--term-muted)]',
    accent: 'font-mono text-[var(--term-accent)]',
    chip: 'font-mono text-[11px] px-2 py-1 border border-[var(--term-line)] text-[var(--term-muted)]',
    chipOn: 'font-mono text-[11px] px-2 py-1 border border-[var(--term-accent)] text-[var(--term-accent)]',
    badgeLive: 'font-mono uppercase text-[10px] border border-[var(--term-accent)] text-[var(--term-accent)]',
    badgeDev: 'font-mono uppercase text-[10px] border border-[var(--term-warn)] text-[var(--term-warn)]',
    rowHover: 'hover:bg-[var(--term-accent)]/[0.06]',
    divider: 'divide-[var(--term-line)] border-[var(--term-line)]',
    line: 'border-[var(--term-line)]',
    accentBg: 'bg-[var(--term-fill)]',
  }),
  // Skyline — the data-monument register. Fixed dark (the `d` toggle is accepted for type parity with
  // every other skin but ignored: this theme never runs a light mode). The one hard rule enforced right
  // here: `accent`/`chip`/`badge*` never carry the reserved cyan — those are copy and UI chrome, not
  // real numbers. Cyan (#4fd1ff) is confined to `accentBg` (the Years unit-chart fill, a real per-year
  // count) and to explicit `color` props the page hands to Gauge/CountUp for its own real readouts.
  skyline: () => ({
    frame: 'skyline',
    dark: true,
    card: 'rounded-lg border border-[#e7edf5]/10 bg-[#141d2e]',
    title: 'font-semibold tracking-tight text-[#eef3f9]',
    body: 'text-[#c7d2e0]',
    muted: 'text-[#8d9bb0]',
    accent: 'text-[#7fb0d1]',
    chip: 'rounded-[3px] border border-[#e7edf5]/15 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.08em] text-[#c7d2e0]',
    chipOn: 'rounded-[3px] border border-[#eaf2fb] px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.08em] bg-[#eaf2fb] text-[#0d1420]',
    badgeLive: 'bg-[#34c759]/15 text-[#5ee082] font-mono uppercase',
    badgeDev: 'border border-[#ff9f0a] text-[#ffbf4d] font-mono uppercase',
    rowHover: 'hover:bg-[#e7edf5]/[0.04]',
    divider: 'divide-[#e7edf5]/10 border-[#e7edf5]/10',
    line: 'border-[#e7edf5]/10',
    accentBg: 'bg-[#4fd1ff]',
  }),
}
