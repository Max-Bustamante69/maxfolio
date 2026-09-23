import type { DesignId } from '../../data/designs'

export interface DesignMarkProps {
  id: DesignId
  /** sm ~36px (nav triggers), md ~48px (dropdown rows), lg ~56px (roomier dropdown rows). */
  size?: 'sm' | 'md' | 'lg'
  /** Only meaningful for designs whose mark differs between light/dark (neo, persona, apple's shadow). */
  isDark?: boolean
}

const BOX = { sm: 'h-9 w-9', md: 'h-12 w-12', lg: 'h-14 w-14' } as const
const PX = { sm: 36, md: 48, lg: 56 } as const
const TEXT = { sm: 'text-[10px]', md: 'text-sm', lg: 'text-base' } as const
const MICRO = { sm: 'text-[7px]', md: 'text-[9px]', lg: 'text-[10px]' } as const

/**
 * The single source of truth for every design's small brand mark — used anywhere a selector lists
 * all six experiences (trigger discs, dropdown rows, mobile "other experiences" rows). Each case
 * reuses the visual decisions already made per-theme (LogoSelectorApple/Luxury/Brutalist's own
 * marks, CenterMark's `markFor`) so the brand stays consistent everywhere it appears — including
 * when a mark for one theme is shown INSIDE another theme's page, which is why every case below
 * uses portable values (global Tailwind theme colors or hardcoded hex) instead of another theme's
 * scoped CSS custom properties (e.g. terminal's `--term-*`, only defined under `.theme-terminal`).
 */
export function DesignMark({ id, size = 'md', isDark = false }: DesignMarkProps) {
  const box = BOX[size]
  const text = TEXT[size]
  const micro = MICRO[size]

  switch (id) {
    case 'luxury':
      return (
        <div className={`${box} relative shrink-0 flex items-center justify-center rounded-[2px] border ${isDark ? 'border-deco-gold/50 bg-deco-navy/70' : 'border-luxury-gold/60 bg-[#FAF8F5]'}`}>
          <span className={`font-display ${text} tracking-[0.1em] ${isDark ? 'text-deco-cream' : 'text-luxury-black'}`}>MB</span>
        </div>
      )
    case 'brutalist':
      return (
        <div className={`${box} relative shrink-0 flex flex-col items-center justify-center gap-0 leading-none bg-red-600`}>
          <span className={`font-mono ${text} font-bold text-white`}>M</span>
          <span className={`font-mono ${text} font-bold text-white -mt-1`}>B</span>
        </div>
      )
    case 'neo':
      return (
        <div
          className={`${box} relative shrink-0 flex items-center justify-center rounded-full ${isDark ? 'bg-neo-darkSurfaceRaised' : 'bg-neo-surfaceRaised'}`}
          style={{ boxShadow: isDark ? '4px 4px 10px #16181e, -4px -4px 10px #333844' : '4px 4px 10px #b8bcc7, -4px -4px 10px #ffffff' }}
        >
          <span className={`font-neo ${text} font-extrabold tracking-tight ${isDark ? 'text-neo-darkInk' : 'text-neo-ink'}`}>MB</span>
        </div>
      )
    case 'persona':
      return (
        <div className="persona-skew-btn relative shrink-0 flex items-center justify-center" style={{ width: PX[size], height: PX[size], background: isDark ? '#c8102e' : '#1c6fb0' }}>
          <span className={`font-persona-label ${micro} font-bold uppercase tracking-[0.08em] ${isDark ? 'text-[#f5f2ee]' : 'text-white'}`}>MB</span>
        </div>
      )
    case 'terminal':
      return (
        <div className={`${box} relative shrink-0 flex items-center justify-center border`} style={{ background: '#0a0d0a', borderColor: '#1d251d' }}>
          <span className={`font-mono ${text} font-bold inline-flex items-center`}>
            <span style={{ color: '#39ff88' }}>MB</span>
            <span style={{ color: '#93a293' }}>$</span>
            <span aria-hidden="true" className="ml-0.5 inline-block h-[0.85em] w-[0.4em] align-middle" style={{ background: '#39ff88' }} />
          </span>
        </div>
      )
    case 'apple':
    default:
      // Always white, even in dark mode — see CenterMark's `markFor` for why (a dark disc would
      // render with ~0 contrast against Apple's own dark-mode surface, which is nearly the same tone).
      return (
        <div className={`${box} relative shrink-0 flex items-center justify-center rounded-[10px] bg-white ${isDark ? '' : 'shadow-[0_1px_6px_rgba(0,0,0,0.12)]'}`}>
          <span className={`font-sf ${text} font-semibold text-[#1d1d1f]`}>MB</span>
        </div>
      )
  }
}
