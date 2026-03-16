import { motion } from 'framer-motion'

interface BrutalistPreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function BrutalistPreview({ isHovered = false, size = 'md' }: BrutalistPreviewProps) {
  const scale = size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1
  
  return (
    <div className="w-full h-full bg-stone-100 relative overflow-hidden flex items-center justify-center">
      {/* Top red bar */}
      <motion.div 
        className="absolute top-0 left-0 h-1 bg-red-600"
        initial={{ width: '30%' }}
        animate={{ width: isHovered ? '100%' : '30%' }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[200%] w-[1px] bg-stone-900"
            style={{
              left: `${i * 15}%`,
              top: '-50%',
              transform: 'rotate(45deg)',
            }}
            animate={{ 
              opacity: isHovered ? 0.5 : 0.2,
            }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          />
        ))}
      </div>
      
      {/* Center content */}
      <div className="text-center relative z-10" style={{ transform: `scale(${scale})` }}>
        <motion.div
          className="font-mono text-stone-900 font-black text-lg tracking-tighter"
          animate={{ 
            letterSpacing: isHovered ? '-0.1em' : '-0.05em',
          }}
          transition={{ duration: 0.2 }}
        >
          BOLD
        </motion.div>
        <div className="font-mono text-[8px] uppercase tracking-[0.3em] text-stone-500 mt-1">
          Editorial
        </div>
      </div>
      
      {/* Bottom red square */}
      <motion.div
        className="absolute bottom-2 right-2 bg-red-600"
        animate={{ 
          width: isHovered ? 16 : 12,
          height: isHovered ? 16 : 12,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Grid lines on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}
