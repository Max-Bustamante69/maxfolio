import { motion } from 'framer-motion'

interface MenuPreviewProps {
  isHovered?: boolean
  isDark?: boolean
}

export function MenuPreview({ isHovered = false, isDark = false }: MenuPreviewProps) {
  const bg = isDark ? '#171717' : '#fafafa'
  const line = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'
  const lineHover = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
  
  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4"
      style={{ backgroundColor: bg }}
    >
      {/* Simple menu icon lines */}
      <div className="flex flex-col gap-1.5 items-center">
        <motion.div
          className="h-[2px] rounded-full"
          style={{ backgroundColor: isHovered ? lineHover : line }}
          animate={{ width: isHovered ? 32 : 28 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="h-[2px] rounded-full"
          style={{ backgroundColor: isHovered ? lineHover : line }}
          animate={{ width: isHovered ? 24 : 20 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        />
        <motion.div
          className="h-[2px] rounded-full"
          style={{ backgroundColor: isHovered ? lineHover : line }}
          animate={{ width: isHovered ? 28 : 24 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        />
      </div>
      
      {/* Subtle dots indicating multiple options */}
      <motion.div 
        className="flex gap-1.5 mt-3"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: line }}
        />
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: line }}
        />
      </motion.div>
    </div>
  )
}
