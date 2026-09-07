import { motion } from 'framer-motion'

interface ApplePreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif'

export function ApplePreview({ isHovered = false, size = 'md' }: ApplePreviewProps) {
  const scale = size === 'sm' ? 0.8 : size === 'lg' ? 1.15 : 1

  return (
    <div className="w-full h-full bg-[#fbfbfd] relative overflow-hidden flex items-center justify-center">
      {/* frosted nav bar */}
      <motion.div
        className="absolute inset-x-0 top-0 h-5 bg-white/70 backdrop-blur border-b border-black/5"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
      />
      <div className="relative z-10 text-center" style={{ transform: `scale(${scale})`, fontFamily: SF }}>
        <motion.div
          className="mx-auto mb-2 w-9 h-9 rounded-[11px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center justify-center text-[11px] font-semibold text-[#1d1d1f]"
          animate={{ y: isHovered ? -3 : 0, boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.08)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          MB
        </motion.div>
        <p className="text-[#1d1d1f] text-sm font-semibold tracking-tight">Apple Clean</p>
        <motion.p className="text-[10px] text-[#0071e3]" animate={{ opacity: isHovered ? 1 : 0.7, x: isHovered ? 2 : 0 }}>
          Learn more ›
        </motion.p>
      </div>
    </div>
  )
}
