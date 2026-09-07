// Per-theme skins for the shared gallery components. The frame geometry is shared;
// each experience only decides colors, radii and type.
export type FrameStyle = 'apple' | 'luxury' | 'brutalist'

export interface Skin {
  frame: FrameStyle
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
}

export const skins: Record<FrameStyle, (isDark: boolean) => Skin> = {
  apple: (d) => ({
    frame: 'apple',
    card: `rounded-[22px] ${d ? 'bg-[#1d1d1f]' : 'bg-white'} shadow-[0_4px_24px_rgba(0,0,0,0.06)]`,
    title: `font-semibold tracking-tight ${d ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`,
    body: d ? 'text-[#d2d2d7]' : 'text-[#1d1d1f]',
    muted: d ? 'text-[#a1a1a6]' : 'text-[#6e6e73]',
    accent: d ? 'text-[#2997ff]' : 'text-[#0071e3]',
    chip: `rounded-full px-2.5 py-1 text-[11px] ${d ? 'bg-white/10 text-[#d2d2d7]' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`,
    chipOn: `rounded-full px-2.5 py-1 text-[11px] font-medium ${d ? 'bg-white text-black' : 'bg-[#1d1d1f] text-white'}`,
    badgeLive: d ? 'bg-[#34c759]/20 text-[#5ee082]' : 'bg-[#34c759]/15 text-[#1b7a34]',
    badgeDev: d ? 'bg-[#ff9f0a]/20 text-[#ffbf4d]' : 'bg-[#ff9f0a]/15 text-[#8a5300]',
    rowHover: d ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]',
    divider: d ? 'divide-white/10 border-white/10' : 'divide-black/10 border-black/10',
  }),
  luxury: (d) => ({
    frame: 'luxury',
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
  }),
  brutalist: (d) => ({
    frame: 'brutalist',
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
  }),
}
