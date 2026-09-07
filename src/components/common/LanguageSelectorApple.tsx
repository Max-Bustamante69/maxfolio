import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { useI18n } from '../../hooks/useI18n'

const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ja: 'JA' }

/** Segmented control, the way iOS does language pickers: no menu, one tap. */
export function LanguageSelectorApple({ isDark }: { isDark: boolean }) {
  const { locale, setLocale } = useLanguage()
  const { t } = useI18n()

  return (
    <div
      role="radiogroup"
      aria-label={t('language.selector.ariaLabel')}
      className={`inline-flex h-8 items-center rounded-full p-0.5 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}
    >
      {supportedLocales.map((opt) => {
        const active = opt === locale
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(opt)}
            className={`press compact-touch h-7 min-w-[34px] px-2 rounded-full text-[11px] font-semibold tracking-wide ${
              active
                ? isDark
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white text-[#1d1d1f] shadow-sm'
                : isDark
                  ? 'text-[#a1a1a6] hover:text-white'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            {LABEL[opt]}
          </button>
        )
      })}
    </div>
  )
}
