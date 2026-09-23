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
  // Round 46 (owner call, 2026-09-23): the public claim is the fixed `registry.PUBLIC_STORE_COUNT`
  // ("20+"), not the real, climbing `registry.stores.length` (23) — that literal count used to leak
  // into this interpolation and drift out of sync with the hand-written "18+" elsewhere on the page.
  const storeCount = registry.PUBLIC_STORE_COUNT
  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat(INTL[locale], { month: 'short', year: 'numeric' })
    const formatPeriod = (start: string, end: string | null) =>
      `${fmt.format(new Date(`${start}-01T12:00:00`))} – ${end ? fmt.format(new Date(`${end}-01T12:00:00`)) : PRESENT[locale]}`
    // `{n}` in content strings is interpolated here, once, from the fixed public storefront count, so
    // every locale and every theme page reads the same "20+" a visitor sees anywhere else on the site.
    const withCount = (s: string) => s.replace(/\{n\}/g, String(storeCount))
    const interpolated = {
      ...strings,
      meta: { ...strings.meta, description: withCount(strings.meta.description) },
      hero: { ...strings.hero, lead: withCount(strings.hero.lead), ctaSecondary: withCount(strings.hero.ctaSecondary) },
      sections: {
        ...strings.sections,
        shopify: { ...strings.sections.shopify, lead: withCount(strings.sections.shopify.lead) },
        faq: { ...strings.sections.faq, items: strings.sections.faq.items.map((item) => ({ ...item, a: withCount(item.a) })) },
      },
    }
    return { strings: interpolated, registry, formatPeriod, locale, intlLocale: INTL[locale], monthFmt: fmt }
  }, [locale, strings, storeCount])
}
