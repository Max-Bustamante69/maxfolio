import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { TransitionLink } from './TransitionLink'

interface LogoSelectorLuxuryProps {
  isDark: boolean
}

export function LogoSelectorLuxury({ isDark }: LogoSelectorLuxuryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuBg = isDark ? 'bg-deco-navy' : 'bg-luxury-cream'
  const textPrimary = isDark ? 'text-deco-cream' : 'text-luxury-black'
  const textMuted = isDark ? 'text-deco-cream/50' : 'text-luxury-black/50'
  const accent = isDark ? 'text-deco-gold' : 'text-luxury-gold'
  const accentHex = isDark ? '#d4af37' : '#C9A962'
  const borderColor = isDark ? 'border-deco-gold/20' : 'border-luxury-black/10'

  return (
    <div className="relative">
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
        {/* Outer frame */}
        <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
          <path d="M0 8 L0 0 L8 0" stroke={accentHex} strokeWidth="1.5" />
          <path d="M32 0 L40 0 L40 8" stroke={accentHex} strokeWidth="1.5" />
          <path d="M40 32 L40 40 L32 40" stroke={accentHex} strokeWidth="1.5" />
          <path d="M8 40 L0 40 L0 32" stroke={accentHex} strokeWidth="1.5" />
          <path
            d="M20 8 L32 20 L20 32 L8 20 Z"
            stroke={accentHex}
            strokeWidth="0.5"
            fill="none"
            className="opacity-30 group-hover:opacity-60 transition-opacity"
          />
        </svg>
        <span className={`font-display text-xs tracking-[0.2em] font-medium ${textPrimary}`}>
          MB
        </span>
      </motion.button>

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

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-full left-0 mt-3 z-50 ${menuBg} border ${borderColor} min-w-[280px] shadow-2xl`}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Decorative top line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A962] to-transparent" aria-hidden="true" />

              {/* Header */}
              <div className={`px-5 py-4 border-b ${borderColor}`}>
                <p className={`font-display text-[10px] tracking-[0.3em] uppercase ${textMuted}`}>
                  Select Experience
                </p>
              </div>

              {/* Options */}
              <div className="py-2">
                {/* Luxury - Active */}
                <div className={`px-5 py-4 ${isDark ? 'bg-deco-gold/10' : 'bg-luxury-gold/10'}`} role="menuitem" aria-current="page">
                  <div className="flex items-start gap-4">
                    {/* Mini Logo */}
                    <div className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center" aria-hidden="true">
                      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none">
                        <path d="M0 6 L0 0 L6 0" stroke={accentHex} strokeWidth="1.5" />
                        <path d="M34 0 L40 0 L40 6" stroke={accentHex} strokeWidth="1.5" />
                        <path d="M40 34 L40 40 L34 40" stroke={accentHex} strokeWidth="1.5" />
                        <path d="M6 40 L0 40 L0 34" stroke={accentHex} strokeWidth="1.5" />
                      </svg>
                      <span className={`font-display text-[10px] tracking-wider ${textPrimary}`}>MB</span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-display text-sm ${accent}`}>Luxury Minimal</p>
                      <p className={`text-[11px] ${textMuted} mt-1`}>Elegant, refined aesthetics with sophisticated typography and golden accents</p>
                      <p className={`text-[10px] ${accent} mt-2 flex items-center gap-1`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Currently viewing
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brutalist */}
                <TransitionLink
                  to="/brutalist"
                  transitionColor="#1c1917"
                  transitionAccent="#dc2626"
                  transitionLabel="Brutalist Editorial"
                  className={`block px-5 py-4 hover:${isDark ? 'bg-white/5' : 'bg-black/5'} transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-4" role="menuitem">
                    {/* Mini Brutalist Logo */}
                    <div className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center bg-red-600" aria-hidden="true">
                      <div className="absolute -bottom-0.5 -right-0.5 w-full h-full border border-stone-400 opacity-30" />
                      <div className="flex flex-col items-center leading-none">
                        <span className="font-mono text-[10px] font-bold text-white">M</span>
                        <span className="font-mono text-[10px] font-bold text-white -mt-0.5">B</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-display text-sm ${textPrimary}`}>Brutalist Editorial</p>
                      <p className={`text-[11px] ${textMuted} mt-1`}>Bold, raw design with editorial typography and high-contrast elements</p>
                    </div>
                  </div>
                </TransitionLink>

                {/* Divider */}
                <div className={`my-2 mx-5 border-t ${borderColor}`} aria-hidden="true" />

                {/* All Designs */}
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel="Design Menu"
                  className={`block px-5 py-3 hover:${isDark ? 'bg-white/5' : 'bg-black/5'} transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-4" role="menuitem">
                    {/* Menu icon */}
                    <div className="w-10 h-10 flex items-center justify-center" aria-hidden="true">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="w-3 h-3 bg-[#C9A962]" />
                        <div className="w-3 h-3 bg-red-600" />
                        <div className="w-3 h-3 bg-red-600 opacity-50" />
                        <div className="w-3 h-3 bg-[#C9A962] opacity-50" />
                      </div>
                    </div>
                    <div>
                      <p className={`font-display text-sm ${textPrimary}`}>All Designs</p>
                      <p className={`text-[11px] ${textMuted}`}>Compare all experiences</p>
                    </div>
                  </div>
                </TransitionLink>
              </div>

              {/* Decorative bottom line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A962] to-transparent" aria-hidden="true" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
