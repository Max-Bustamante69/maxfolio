import { m, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TransitionLink } from './TransitionLink'
import { useI18n } from '../../hooks'
import { otherDesigns, MENU } from '../../data/designs'

interface NavItem {
  label: string
  href: string
}

interface MobileMenuAppleProps {
  navItems: NavItem[]
  isDark: boolean
  onContactClick?: () => void
  contactLabel: string
}

const EASE = [0.32, 0.72, 0, 1] as const

/** Full-screen frosted sheet that slides down from the nav, iOS-style. */
export function MobileMenuApple({ navItems, isDark, onContactClick, contactLabel }: MobileMenuAppleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const text = isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
  const muted = isDark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ duration: 0.22 }}
          className={`fixed inset-0 z-[9999] ${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-2xl`}
          style={{ touchAction: 'none' }}
          onClick={() => setIsOpen(false)}
        >
          <m.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.28, ease: EASE }}
            className="h-full flex flex-col px-6 pt-4 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-11">
              <span className={`text-sm font-semibold ${text}`}>{t('mobileMenu.menu')}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`press w-9 h-9 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'} ${text} flex items-center justify-center compact-touch`}
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-8 flex-1">
              {navItems.map((item, i) => (
                <m.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}
                  className={`block py-3 text-3xl font-semibold tracking-[-0.02em] ${text}`}
                >
                  {item.label}
                </m.a>
              ))}
            </nav>

            {onContactClick && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onContactClick()
                }}
                className="press w-full rounded-full bg-[#0071e3] text-white py-3.5 text-sm font-medium"
              >
                {contactLabel}
              </button>
            )}

            <div className="mt-6">
              <p className={`text-[11px] uppercase tracking-[0.2em] ${muted} mb-3`}>{t('logoSelector.otherExperiences')}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {otherDesigns('apple').map((d) => (
                  <TransitionLink
                    key={d.id}
                    to={d.route}
                    transitionColor={d.transitionColor}
                    transitionAccent={d.transitionAccent}
                    transitionLabel={t(d.nameKey)}
                    className={isDark ? 'text-[#2997ff]' : 'text-[#0071e3]'}
                  >
                    {t(d.nameKey)} ›
                  </TransitionLink>
                ))}
                <TransitionLink
                  to={MENU.route}
                  transitionColor={isDark ? '#171717' : '#fafafa'}
                  transitionAccent={isDark ? '#ffffff' : '#171717'}
                  transitionLabel={t(MENU.labelKey)}
                  className={isDark ? 'text-[#2997ff]' : 'text-[#0071e3]'}
                >
                  {t(MENU.subtitleKey)} ›
                </TransitionLink>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`press w-9 h-9 rounded-full flex items-center justify-center compact-touch ${text}`}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {typeof document !== 'undefined' && createPortal(sheet, document.body)}
    </div>
  )
}
