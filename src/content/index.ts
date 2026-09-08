import type { Locale } from '../context/LanguageContext'
import type { PortfolioContent } from './types'
import { en } from './en'

export type { PortfolioContent }

/** English ships in the main bundle; the other locales arrive as their own chunks the first time they are asked for. */
const loaded: Partial<Record<Locale, PortfolioContent>> = { en }
const loaders: Record<Locale, () => Promise<PortfolioContent>> = {
  en: () => Promise.resolve(en),
  es: () => import('./es').then((mod) => mod.es),
  ja: () => import('./ja').then((mod) => mod.ja),
}
const pending = new Set<Locale>()
const listeners = new Set<() => void>()

/** The locale's strings, or English while that locale's chunk is still loading (subscribers are told when it lands). */
export function getContent(locale: Locale): PortfolioContent {
  const ready = loaded[locale]
  if (ready) return ready
  if (!pending.has(locale)) {
    pending.add(locale)
    loaders[locale]()
      .then((value) => {
        loaded[locale] = value
        pending.delete(locale)
        listeners.forEach((fn) => fn())
      })
      .catch(() => pending.delete(locale))
  }
  return en
}

export function subscribeContent(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
