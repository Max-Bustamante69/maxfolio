import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { supportedLocales, useLanguage, Locale } from '../../context/LanguageContext'
import { useI18n } from '../../hooks/useI18n'

function localeLabel(locale: Locale) {
  if (locale === 'en') return 'EN'
  if (locale === 'es') return 'ES'
  return 'JA'
}

export function LanguageSelectorBrutalist({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const buttonSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
  const letterSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

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
        whileHover={{ rotate: -1, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-red-600" aria-hidden="true" />
        <div className="absolute inset-0 border border-red-600/30" aria-hidden="true" />
        <span className={`relative z-10 font-mono uppercase font-bold ${letterSize} text-white tracking-wider`}>
          {localeLabel(locale)}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
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
              className="absolute right-0 mt-3 z-50 bg-stone-950 border-2 border-red-600 min-w-[160px] shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-red-600/40">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-stone-300">
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
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => {
                        setLocale(opt)
                        setOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-red-600/10 transition-colors ${
                        isActive ? 'bg-red-600/15' : ''
                      }`}
                    >
                      <span className={`font-mono uppercase ${letterSize} text-stone-100`}>{localeLabel(opt)}</span>
                      <span className={`text-[10px] font-mono ${isActive ? 'text-red-300' : 'text-stone-500'}`}>
                        {isActive ? '●' : ' '}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="h-1.5 bg-red-600" aria-hidden="true" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

