import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export type Locale = 'en' | 'es' | 'ja'

export const supportedLocales: Locale[] = ['en', 'es', 'ja']

interface LanguageContextType {
  locale: Locale
  setLocale: (next: Locale) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'

  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.startsWith('es')) return 'es'
  if (lang.startsWith('ja')) return 'ja'
  return 'en'
}

export function LanguageProvider({
  children,
  storageKey = 'lang',
  defaultLocale = 'en',
}: {
  children: ReactNode
  storageKey?: string
  defaultLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return defaultLocale

    const saved = localStorage.getItem(storageKey) as Locale | null
    if (saved && supportedLocales.includes(saved)) return saved

    return detectLocale() ?? defaultLocale
  })

  const setLocale = (next: Locale) => setLocaleState(next)

  useEffect(() => {
    localStorage.setItem(storageKey, locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale, storageKey])

  const value = useMemo(() => ({ locale, setLocale }), [locale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

