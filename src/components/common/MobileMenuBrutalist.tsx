import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TransitionLink } from './TransitionLink'

interface NavItem {
  label: string
  href: string
}

interface MobileMenuBrutalistProps {
  navItems: NavItem[]
  isDark: boolean
  onContactClick?: () => void
}

export function MobileMenuBrutalist({ navItems, isDark, onContactClick }: MobileMenuBrutalistProps) {
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

  const menuBg = isDark ? 'bg-stone-950' : 'bg-stone-100'
  const textPrimary = isDark ? 'text-stone-100' : 'text-stone-900'
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-500'

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
          {/* Red accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
          
          {/* Large background number */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span className={`font-editorial text-[50vw] italic ${isDark ? 'text-stone-900' : 'text-stone-200'} select-none`}>
              M
            </span>
          </div>

          {/* Content */}
          <div className="h-full flex flex-col items-center justify-center px-8 relative z-10" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-red-600 hover:text-red-500 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Section Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-red-600">
                Menu
              </span>
            </motion.div>

            {/* Navigation Links */}
            <nav className="text-center mb-10">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className={`block py-3 font-editorial text-4xl italic ${textPrimary} hover:text-red-600 transition-colors`}
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
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setIsOpen(false)
                  onContactClick()
                }}
                className="px-8 py-4 bg-red-600 text-white font-mono text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Quick Message
              </motion.button>
            )}

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.3 }}
              className="w-20 h-0.5 bg-red-600 my-8"
            />

            {/* Design Switcher */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${textMuted} mb-4`}>
                Switch Style
              </p>
              <div className="flex gap-6">
                <TransitionLink
                  to="/menu"
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel="Design Menu"
                  className={`font-mono text-xs uppercase tracking-wider ${textMuted} hover:text-red-600 transition-colors`}
                >
                  All
                </TransitionLink>
                <TransitionLink
                  to="/"
                  transitionColor="#FAF8F5"
                  transitionAccent="#C9A962"
                  transitionLabel="Luxury Minimal"
                  className={`font-mono text-xs uppercase tracking-wider ${textMuted} hover:text-red-600 transition-colors`}
                >
                  Luxury →
                </TransitionLink>
              </div>
            </motion.div>
          </div>

          {/* Bottom red bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  )
}
