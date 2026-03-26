import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { supportedLocales, useLanguage, Locale } from '../../context/LanguageContext'
import { useI18n } from '../../hooks/useI18n'

function localeLabel(locale: Locale) {
  if (locale === 'en') return 'EN'
  if (locale === 'es') return 'ES'
  return 'JA'
}

export function LanguageSelectorMenu({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const options = useMemo(() => supportedLocales, [])

  const buttonClass = size === 'sm' ? 'w-9 h-9 text-[10px]' : 'w-10 h-10'

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('language.selector.ariaLabel')}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`relative ${buttonClass} flex items-center justify-center border border-neutral-300/70 rounded-full overflow-hidden backdrop-blur-sm hover:border-neutral-900/50 transition-colors`}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0, scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(201,169,98,0.18), transparent 55%), radial-gradient(circle at 70% 70%, rgba(220,38,38,0.12), transparent 50%)',
          }}
          aria-hidden="true"
        />
        <span className="relative z-10 font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
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
              className="absolute right-0 mt-3 z-50 w-36 bg-white/95 dark:bg-neutral-950/95 border border-neutral-200/70 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-neutral-200/60 dark:border-neutral-800">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
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
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors ${
                        isActive ? 'bg-neutral-100 dark:bg-neutral-900' : ''
                      }`}
                    >
                      <span className="font-mono text-sm uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                        {localeLabel(opt)}
                      </span>
                      <span className={`text-[12px] ${isActive ? 'text-[#C9A962]' : 'text-neutral-400 dark:text-neutral-600'}`}>
                        {isActive ? '●' : ' '}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              <div className="h-1 bg-gradient-to-r from-[#C9A962] via-neutral-200 to-[#dc2626]" aria-hidden="true" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

