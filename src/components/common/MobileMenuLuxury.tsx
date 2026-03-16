import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TransitionLink } from './TransitionLink'

interface NavItem {
  label: string
  href: string
}

interface MobileMenuLuxuryProps {
  navItems: NavItem[]
  isDark: boolean
  onContactClick?: () => void
  onThemeToggle?: () => void
}

export function MobileMenuLuxury({ navItems, isDark, onContactClick, onThemeToggle }: MobileMenuLuxuryProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const menuBg = isDark ? 'bg-deco-navy' : 'bg-luxury-cream'
  const textPrimary = isDark ? 'text-deco-cream' : 'text-luxury-black'
  const textMuted = isDark ? 'text-deco-cream/40' : 'text-luxury-black/40'
  const accent = isDark ? 'text-deco-gold' : 'text-luxury-gold'
  const accentBg = isDark ? 'bg-deco-gold' : 'bg-luxury-gold'

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            overflow: 'hidden',
            touchAction: 'none',
          }}
          className={menuBg}
        >
          {/* Decorative corner elements */}
          <div className={`absolute top-6 left-6 w-12 h-12 border-t border-l ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />
          <div className={`absolute top-6 right-6 w-12 h-12 border-t border-r ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />
          <div className={`absolute bottom-6 left-6 w-12 h-12 border-b border-l ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />
          <div className={`absolute bottom-6 right-6 w-12 h-12 border-b border-r ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />

          {/* Top Actions: Theme Toggle & Close Button */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            {/* Theme Toggle Button */}
            {onThemeToggle && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onThemeToggle()
                }}
                className={`w-12 h-12 flex items-center justify-center ${isDark ? 'bg-deco-gold/10 border border-deco-gold/30' : 'bg-luxury-gold/10 border border-luxury-gold/30'} ${accent} transition-colors`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </motion.button>
            )}
            
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsOpen(false)}
              className={`w-12 h-12 flex items-center justify-center ${textMuted} hover:${accent} transition-colors`}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Content */}
          <div className="h-full flex flex-col items-center justify-center px-8" onClick={(e) => e.stopPropagation()}>
            {/* Logo/Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <span className={`font-display text-sm tracking-[0.3em] uppercase ${accent}`}>
                Navigation
              </span>
            </motion.div>

            {/* Navigation Links */}
            <nav className="text-center mb-12">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className={`block py-4 font-display text-3xl ${textPrimary} hover:${accent} transition-colors`}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            {/* Quick Message Button */}
            {onContactClick && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  setIsOpen(false)
                  onContactClick()
                }}
                className={`px-8 py-4 ${accentBg} ${isDark ? 'text-deco-navy' : 'text-white'} font-display tracking-wider flex items-center gap-3`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Quick Message
              </motion.button>
            )}

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={`w-16 h-px ${isDark ? 'bg-deco-gold/40' : 'bg-luxury-gold/40'} my-10`}
            />

            {/* Design Switcher */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className={`text-[10px] uppercase tracking-[0.3em] ${textMuted} mb-4`}>
                Other Experiences
              </p>
              <div className="flex gap-4">
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel="Design Menu"
                  className={`text-xs ${textMuted} hover:${accent} transition-colors`}
                >
                  All Designs
                </TransitionLink>
                <span className={textMuted}>·</span>
                <TransitionLink
                  to="/brutalist"
                  transitionColor="#1c1917"
                  transitionAccent="#dc2626"
                  transitionLabel="Brutalist Editorial"
                  className={`text-xs ${textMuted} hover:${accent} transition-colors`}
                >
                  Brutalist
                </TransitionLink>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 ${textPrimary}`}
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  )
}
