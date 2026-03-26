import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { supportedLocales, useLanguage, Locale } from '../../context/LanguageContext'
import { useI18n } from '../../hooks/useI18n'

function localeLabel(locale: Locale) {
  if (locale === 'en') return 'EN'
  if (locale === 'es') return 'ES'
  return 'JA'
}

export function LanguageSelectorLuxury({
  isDark,
  size = 'md',
}: {
  isDark: boolean
  size?: 'sm' | 'md'
}) {
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const buttonSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  const menuBg = isDark ? 'bg-deco-navy' : 'bg-luxury-cream'
  const textPrimary = isDark ? 'text-deco-cream' : 'text-luxury-black'
  const textMuted = isDark ? 'text-deco-cream/60' : 'text-luxury-black/60'
  const accent = isDark ? 'text-deco-gold' : 'text-luxury-gold'
  const borderColor = isDark ? 'border-deco-gold/20' : 'border-luxury-gold/20'
  const buttonBg = isDark ? 'bg-deco-navy/40' : 'bg-luxury-cream/70'
  const buttonBorder = isDark ? 'border-deco-gold/30' : 'border-luxury-gold/30'

  const options = useMemo(() => supportedLocales, [])

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative ${buttonSize} flex items-center justify-center group`}
        aria-label={t('language.selector.ariaLabel')}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className={`absolute inset-0 rounded-md ${buttonBg} border ${buttonBorder}`} aria-hidden="true" />
        {/* Diamond frame corners */}
        <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
          <path
            d="M20 4 L36 20 L20 36 L4 20 Z"
            stroke={isDark ? '#d4af37' : '#C9A962'}
            strokeWidth="1"
            className="opacity-60 group-hover:opacity-100 transition-opacity"
          />
          <path
            d="M20 11 L29 20 L20 29 L11 20 Z"
            stroke={isDark ? '#d4af37' : '#C9A962'}
            strokeWidth="0.5"
            className="opacity-30"
          />
        </svg>

        <span className={`relative z-10 ${textSize} font-display tracking-[0.25em] ${textPrimary}`}>
          {localeLabel(locale)}
        </span>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2"
              aria-hidden="true"
            >
              <div className="w-2 h-2 rotate-45 bg-deco-gold/30 border border-deco-gold/40" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop click-to-close */}
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />

            <motion.div
              role="menu"
              aria-orientation="vertical"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={`absolute right-0 mt-3 z-50 ${menuBg} border ${borderColor} shadow-2xl overflow-hidden`}
            >
              <div className={`px-4 py-3 border-b ${borderColor}`}>
                <p className={`font-display text-[10px] tracking-[0.35em] uppercase ${textMuted}`}>
                  {t('language.selector.title')}
                </p>
              </div>
              <div className="py-1">
                {options.map((opt, idx) => {
                  const isActive = opt === locale
                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      role="menuitem"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => {
                        setLocale(opt)
                        setOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors ${
                        isActive ? `bg-deco-gold/10` : ''
                      }`}
                    >
                      <span className={`font-display uppercase tracking-wider ${textPrimary}`}>{localeLabel(opt)}</span>
                      <span className={`text-[10px] ${isActive ? accent : textMuted}`}>
                        {isActive ? '●' : ' '}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

