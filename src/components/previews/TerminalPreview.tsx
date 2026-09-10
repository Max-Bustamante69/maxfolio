import { m } from 'framer-motion'

interface TerminalPreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const BG = '#0a0d0a'
const ACCENT = '#39ff88'
const LINE = '#1d251d'

/** Menu-card preview: a small bordered prompt that blinks its cursor on hover, echoing the theme's boot sequence. */
export function TerminalPreview({ isHovered = false, size = 'md' }: TerminalPreviewProps) {
  const scale = size === 'sm' ? 0.85 : size === 'lg' ? 1.15 : 1
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[length:14px_14px]"
      style={{
        background: BG,
        backgroundImage: `radial-gradient(${LINE} 1px, transparent 1px)`,
      }}
    >
      <div className="text-center" style={{ transform: `scale(${scale})` }}>
        <div
          className="mx-auto mb-2 flex h-10 w-16 items-center justify-center gap-1 border font-mono text-xs"
          style={{ borderColor: LINE, color: ACCENT }}
        >
          <span>&gt;_</span>
          <m.span animate={{ opacity: isHovered ? [1, 0, 1] : 1 }} transition={{ duration: 0.9, repeat: isHovered ? Infinity : 0 }} style={{ background: ACCENT, width: 6, height: 12, display: 'inline-block' }} />
        </div>
        <p className="text-[10px] font-mono font-bold tracking-[0.18em]" style={{ color: ACCENT }}>
          TERMINAL
        </p>
      </div>
    </div>
  )
}
