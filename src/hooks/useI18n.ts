import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage, Locale } from '../context/LanguageContext'

type Messages = Record<string, unknown>

const cache: Partial<Record<Locale, Messages>> = {}

function getByPath(obj: unknown, path: string): unknown {
  if (!obj) return undefined
  return path.split('.').reduce((acc: any, part) => (acc ? acc[part] : undefined), obj)
}

async function loadMessages(locale: Locale): Promise<Messages> {
  const res = await fetch(`/locales/${locale}.json`, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`Failed to load locale: ${locale}`)
  return (await res.json()) as Messages
}

export function useI18n() {
  const { locale } = useLanguage()

  const [messages, setMessages] = useState<Messages>(() => cache[locale] ?? {})
  const [ready, setReady] = useState<boolean>(() => Boolean(cache[locale] && cache['en']))

  useEffect(() => {
    let cancelled = false

    async function ensure() {
      // Always load English as fallback first.
      if (!cache.en) {
        cache.en = await loadMessages('en')
      }

      if (!cache[locale]) {
        cache[locale] = await loadMessages(locale)
      }

      if (!cancelled) {
        setMessages(cache[locale] ?? cache.en ?? {})
        setReady(true)
      }
    }

    setReady(false)
    ensure().catch(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [locale])

  const t = useCallback(
    (key: string) => {
      const fromCurrent = getByPath(messages, key)
      if (typeof fromCurrent === 'string') return fromCurrent

      const fromEn = cache.en ? getByPath(cache.en, key) : undefined
      if (typeof fromEn === 'string') return fromEn

      return key
    },
    [messages]
  )

  return useMemo(() => ({ t, locale, ready }), [t, locale, ready])
}

