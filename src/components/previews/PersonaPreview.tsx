import { m } from 'framer-motion'

interface PersonaPreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/** Menu-screen-in-miniature: ice ground, a torn diagonal ink panel, a skewed accent tab, ring motif. */
export function PersonaPreview({ isHovered = false, size = 'md' }: PersonaPreviewProps) {
  const scale = size === 'sm' ? 0.85 : size === 'lg' ? 1.15 : 1

  return (
    <div className="w-full h-full bg-[#eef3f7] relative overflow-hidden flex items-center justify-center">
      {/* Torn diagonal ink panel */}
      <m.div
        className="absolute inset-y-0 right-0 bg-[#0a0f1a]"
        style={{ clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 22% 100%)' }}
        animate={{ width: isHovered ? '68%' : '58%' }}
        transition={{ duration: 0.3 }}
      />
      {/* Thin rotating ring motif */}
      <m.svg
        className="absolute w-16 h-16 opacity-30"
        style={{ left: '8%', top: '18%' }}
        viewBox="0 0 64 64"
        animate={{ rotate: isHovered ? 180 : 0 }}
        transition={{ duration: 3, ease: 'linear' }}
      >
        <circle cx="32" cy="32" r="26" fill="none" stroke="#1c6fb0" strokeWidth="1" strokeDasharray="3 4" />
      </m.svg>
      {/* Skewed accent tab */}
      <m.div
        className="absolute bottom-3 right-3 bg-[#3fa9dc]"
        style={{ clipPath: 'polygon(14% 0, 100% 0, 86% 100%, 0 100%)' }}
        animate={{ width: isHovered ? 28 : 22, height: 10 }}
        transition={{ duration: 0.2 }}
      />
      <div className="relative z-10 text-center" style={{ transform: `scale(${scale})` }}>
        <div className="font-persona-label text-[8px] uppercase tracking-[0.3em] text-[#1c6fb0]">— arcade —</div>
        <div className="font-persona-display text-lg text-[#0a0f1a] leading-none mt-1" style={{ fontStyle: 'oblique 8deg' }}>LOUD</div>
      </div>
    </div>
  )
}
