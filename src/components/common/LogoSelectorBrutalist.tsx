import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { TransitionLink } from './TransitionLink'

interface LogoSelectorBrutalistProps {
  isDark: boolean
}

export function LogoSelectorBrutalist({ isDark }: LogoSelectorBrutalistProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuBg = isDark ? 'bg-stone-950' : 'bg-stone-100'
  const textPrimary = isDark ? 'text-stone-100' : 'text-stone-900'
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-500'
  const borderColor = isDark ? 'border-stone-700' : 'border-stone-300'

  return (
    <div className="relative flex items-center gap-2">
      {/* Logo Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 relative flex items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open design selector"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bold square background */}
        <div className="absolute inset-0 bg-red-600" aria-hidden="true" />
        {/* Offset accent square */}
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-full h-full border-2 opacity-30"
          style={{ borderColor: isDark ? '#fafaf9' : '#dc2626' }}
          aria-hidden="true"
        />
        {/* Stacked initials */}
        <div className="relative z-10 flex flex-col items-center leading-none">
          <span className="font-mono text-sm font-bold text-white">M</span>
          <span className="font-mono text-sm font-bold text-white -mt-1">B</span>
        </div>
      </motion.button>
      
      {/* Subtle indicator - small arrow */}
      <motion.div 
        className={`hidden md:flex items-center ${textMuted} font-mono text-[10px] uppercase tracking-wider`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.span
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 2 }}
        >
          →
        </motion.span>
      </motion.div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown - Brutalist Style */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full left-0 mt-2 z-50 ${menuBg} border-2 ${borderColor} min-w-[300px]`}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Red top bar */}
              <div className="h-1.5 bg-red-600" aria-hidden="true" />

              {/* Header */}
              <div className={`px-5 py-3 border-b-2 ${borderColor}`}>
                <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${textMuted}`}>
                  Switch Experience
                </p>
              </div>

              {/* Options */}
              <div>
                {/* Brutalist - Active */}
                <div className={`px-5 py-4 ${isDark ? 'bg-red-600/10' : 'bg-red-600/5'} border-l-4 border-red-600`} role="menuitem" aria-current="page">
                  <div className="flex items-start gap-4">
                    {/* Mini Logo */}
                    <div className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center bg-red-600" aria-hidden="true">
                      <div className="absolute -bottom-0.5 -right-0.5 w-full h-full border border-stone-400 opacity-30" />
                      <div className="flex flex-col items-center leading-none">
                        <span className="font-mono text-[10px] font-bold text-white">M</span>
                        <span className="font-mono text-[10px] font-bold text-white -mt-0.5">B</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-editorial text-base italic text-red-600">Brutalist Editorial</p>
                      <p className={`font-mono text-[10px] ${textMuted} mt-1 leading-relaxed`}>
                        Bold, raw design with editorial typography and high-contrast elements
                      </p>
                      <p className="font-mono text-[10px] text-red-600 mt-2 flex items-center gap-1">
                        ● Active
                      </p>
                    </div>
                  </div>
                </div>

                {/* Luxury */}
                <TransitionLink
                  to="/"
                  transitionColor="#FAF8F5"
                  transitionAccent="#C9A962"
                  transitionLabel="Luxury Minimal"
                  className={`block px-5 py-4 hover:bg-red-600/5 transition-colors cursor-pointer border-l-4 border-transparent hover:border-stone-400`}
                >
                  <div className="flex items-start gap-4" role="menuitem">
                    {/* Mini Luxury Logo */}
                    <div className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center bg-luxury-cream" aria-hidden="true">
                      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none">
                        <path d="M0 6 L0 0 L6 0" stroke="#C9A962" strokeWidth="1.5" />
                        <path d="M34 0 L40 0 L40 6" stroke="#C9A962" strokeWidth="1.5" />
                        <path d="M40 34 L40 40 L34 40" stroke="#C9A962" strokeWidth="1.5" />
                        <path d="M6 40 L0 40 L0 34" stroke="#C9A962" strokeWidth="1.5" />
                      </svg>
                      <span className="font-display text-[10px] tracking-wider text-luxury-black">MB</span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-editorial text-base italic ${textPrimary}`}>Luxury Minimal</p>
                      <p className={`font-mono text-[10px] ${textMuted} mt-1 leading-relaxed`}>
                        Elegant, refined aesthetics with sophisticated typography and golden accents
                      </p>
                    </div>
                  </div>
                </TransitionLink>

                {/* Divider */}
                <div className={`border-t-2 ${borderColor}`} aria-hidden="true" />

                {/* All Designs */}
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel="Design Menu"
                  className={`block px-5 py-4 hover:bg-red-600/5 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-4" role="menuitem">
                    {/* Menu icon */}
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-stone-500" aria-hidden="true">
                      <div className="flex flex-col gap-1">
                        <div className="w-5 h-0.5 bg-stone-500" />
                        <div className="w-5 h-0.5 bg-stone-500" />
                        <div className="w-5 h-0.5 bg-stone-500" />
                      </div>
                    </div>
                    <div>
                      <p className={`font-mono text-xs uppercase tracking-wider ${textPrimary}`}>All Designs</p>
                      <p className={`font-mono text-[10px] ${textMuted}`}>Compare experiences</p>
                    </div>
                  </div>
                </TransitionLink>
              </div>

              {/* Red bottom bar */}
              <div className="h-1.5 bg-red-600" aria-hidden="true" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
