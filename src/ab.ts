import { AB, isVariant, type VariantId } from '../ab.config'

/**
 * Which A/B variant this page is: the shell stamps it in a meta tag (set by the edge rewrite), the cookie
 * carries it across navigations, and the control is the answer when neither exists (local dev, bots).
 */
export function currentVariant(): VariantId {
  if (typeof document === 'undefined') return AB.variants[0].id
  // A forced variant in the URL wins (theme links use it), and is pinned so the server agrees on the next request.
  const forced = new URLSearchParams(window.location.search).get('v')
  if (isVariant(forced)) {
    if (AB.variants.length > 1) document.cookie = `${AB.cookie}=${forced}; Path=/; Max-Age=${AB.maxAge}; SameSite=Lax; Secure`
    return forced
  }
  const meta = document.querySelector('meta[name="mf-variant"]')?.getAttribute('content')
  if (isVariant(meta)) return meta
  const pinned = document.cookie
    .split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${AB.cookie}=`))
    ?.slice(AB.cookie.length + 1)
  if (isVariant(pinned)) return pinned
  return AB.variants[0].id
}

export const splitActive = () => AB.variants.length > 1

/** Vercel Web Analytics reports `/` as `/v/<variant>` so exposures show per variant in the dashboard. */
export function attributeUrl(url: string): string {
  if (!splitActive()) return url
  try {
    const u = new URL(url)
    if (u.pathname === '/') u.pathname = `/v/${currentVariant()}`
    return u.toString()
  } catch {
    return url
  }
}

/** First-party counter (views, contacts) per variant; a no-op until /api/ab has a KV store behind it. */
export function recordAb(type: 'view' | 'contact', extra: Record<string, string> = {}) {
  if (typeof navigator === 'undefined') return
  try {
    const body = JSON.stringify({ type, variant: currentVariant(), path: window.location.pathname, ...extra })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/ab', new Blob([body], { type: 'application/json' }))
    else void fetch('/api/ab', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } })
  } catch {
    /* attribution is best-effort */
  }
}
