import { useMemo, useSyncExternalStore } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getContent, subscribeContent } from '../content'
import * as registry from '../data/registry'

const INTL: Record<string, string> = { en: 'en-US', es: 'es-CO', ja: 'ja-JP' }
const PRESENT: Record<string, string> = { en: 'Present', es: 'Actualidad', ja: '現在' }

/** Merges the untranslated registry with the strings of the active locale (loaded lazily for es/ja). */
export function useContent() {
  const { locale } = useLanguage()
  const strings = useSyncExternalStore(subscribeContent, () => getContent(locale), () => getContent(locale))
  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat(INTL[locale], { month: 'short', year: 'numeric' })
    const formatPeriod = (start: string, end: string | null) =>
      `${fmt.format(new Date(`${start}-01T12:00:00`))} – ${end ? fmt.format(new Date(`${end}-01T12:00:00`)) : PRESENT[locale]}`
    return { strings, registry, formatPeriod, locale }
  }, [locale, strings])
}
