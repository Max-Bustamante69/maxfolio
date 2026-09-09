import { m } from 'framer-motion'

interface NeoPreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SURFACE = '#e6e9ef'
const SHADOW_DARK = '#b8bcc7'
const SHADOW_LIGHT = '#ffffff'
const ACCENT = '#4453d9'
const INK = '#3a3f4b'

/** Menu-card preview: a small raised chip that presses in on hover, echoing the theme's own extrusion. */
export function NeoPreview({ isHovered = false, size = 'md' }: NeoPreviewProps) {
  const scale = size === 'sm' ? 0.85 : size === 'lg' ? 1.15 : 1
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center" style={{ background: SURFACE }}>
      <div className="text-center" style={{ transform: `scale(${scale})` }}>
        <m.div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background: SURFACE,
            boxShadow: isHovered
              ? `inset 4px 4px 10px ${SHADOW_DARK}, inset -4px -4px 10px ${SHADOW_LIGHT}`
              : `6px 6px 16px ${SHADOW_DARK}, -6px -6px 16px ${SHADOW_LIGHT}`,
          }}
          animate={{ scale: isHovered ? 0.94 : 1 }}
          transition={{ duration: 0.25 }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT }} />
        </m.div>
        <p className="text-[11px] font-bold tracking-[0.08em]" style={{ color: INK, fontFamily: 'Manrope, Inter, sans-serif' }}>
          NEO
        </p>
      </div>
    </div>
  )
}
