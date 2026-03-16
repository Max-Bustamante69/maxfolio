import { motion } from 'framer-motion'

interface LuxuryPreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LuxuryPreview({ isHovered = false, size = 'md' }: LuxuryPreviewProps) {
  const scale = size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1
  
  return (
    <div className="w-full h-full bg-[#FAF8F5] relative overflow-hidden flex items-center justify-center">
      {/* Elegant gold frame */}
      <motion.div 
        className="absolute inset-3 border border-[#C9A962]/30"
        animate={{ 
          borderColor: isHovered ? 'rgba(201,169,98,0.6)' : 'rgba(201,169,98,0.3)',
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Corner accents */}
      <motion.div
        className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#C9A962]"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
      />
      <motion.div
        className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#C9A962]"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
      />
      <motion.div
        className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#C9A962]"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
      />
      <motion.div
        className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#C9A962]"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
      />
      
      {/* Center content */}
      <div className="text-center relative z-10" style={{ transform: `scale(${scale})` }}>
        <motion.div
          className="w-8 h-[1px] bg-[#C9A962] mx-auto mb-2"
          animate={{ width: isHovered ? 40 : 32 }}
          transition={{ duration: 0.3 }}
        />
        <div className="font-display text-[#1a1a1a] text-sm tracking-wide">
          <span className="italic text-[#C9A962]">Luxury</span>
        </div>
        <motion.div
          className="w-8 h-[1px] bg-[#C9A962] mx-auto mt-2"
          animate={{ width: isHovered ? 40 : 32 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Subtle pattern on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(201,169,98,0.1) 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}
