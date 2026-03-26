import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TransitionLink } from './TransitionLink'
import { useI18n } from '../../hooks'

interface NavItem {
  label: string
  href: string
}

interface MobileMenuLuxuryProps {
  navItems: NavItem[]
  isDark: boolean
  onContactClick?: () => void
}

export function MobileMenuLuxury({ navItems, isDark, onContactClick }: MobileMenuLuxuryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()

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
          {/* Large decorative background monogram */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span
              className={`font-display italic leading-none select-none ${
                isDark ? 'text-deco-gold/10' : 'text-luxury-gold/10'
              }`}
              style={{ fontSize: '44vw' }}
            >
              M
            </span>
          </div>

          {/* Decorative corner elements */}
          <div className={`absolute top-6 left-6 w-12 h-12 border-t border-l ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />
          <div className={`absolute top-6 right-6 w-12 h-12 border-t border-r ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />
          <div className={`absolute bottom-6 left-6 w-12 h-12 border-b border-l ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />
          <div className={`absolute bottom-6 right-6 w-12 h-12 border-b border-r ${isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'}`} />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setIsOpen(false)}
            className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center ${textMuted} hover:${accent} transition-colors z-10`}
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          {/* Content */}
          <div className="h-full flex flex-col items-center justify-center px-8 relative z-10" onClick={(e) => e.stopPropagation()}>
            {/* Logo/Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <span className={`font-display text-sm tracking-[0.3em] uppercase ${accent}`}>
                {t('mobileMenu.navigation')}
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
                {t('common.quickMessage')}
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
                {t('logoSelector.otherExperiences')}
              </p>
              <div className="flex gap-4">
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel={t('logoSelector.designMenu')}
                  className={`text-xs ${textMuted} hover:${accent} transition-colors`}
                >
                  {t('logoSelector.allDesigns')}
                </TransitionLink>
                <span className={textMuted}>·</span>
                <TransitionLink
                  to="/brutalist"
                  transitionColor="#1c1917"
                  transitionAccent="#dc2626"
                  transitionLabel={t('logoSelector.brutalistEditorial')}
                  className={`text-xs ${textMuted} hover:${accent} transition-colors`}
                >
                  {t('logoSelector.brutalistEditorial')}
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
