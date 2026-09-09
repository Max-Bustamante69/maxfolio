// Vercel Edge Middleware: assigns each new visitor of `/` to one variant (even split), pins it in a
// cookie, and rewrites the request to that variant's static shell. Crawlers and audit tools always get
// the control so search engines index one canonical page and Lighthouse measures a stable target.
// `?v=<id>` forces a variant (and re-pins the cookie) for QA. With one variant configured it is a no-op.
import { next, rewrite } from '@vercel/edge'
import { AB, isVariant } from './ab.config'

export const config = { matcher: ['/'] }

const BOT = /bot|crawl|spider|slurp|lighthouse|pagespeed|chrome-lighthouse|headless|preview|facebookexternalhit|whatsapp|telegram|discord|linkedin|twitter|pinterest|vercel-screenshot/i

const readCookie = (header: string, name: string) => {
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

export default function middleware(req: Request) {
  if (AB.variants.length < 2) return next()
  const url = new URL(req.url)
  const ua = req.headers.get('user-agent') || ''
  if (BOT.test(ua)) return next({ headers: { 'x-mf-variant': `${AB.variants[0].id}; bot` } })

  const forced = url.searchParams.get('v')
  const pinned = readCookie(req.headers.get('cookie') || '', AB.cookie)
  let id = isVariant(forced) ? forced : isVariant(pinned) ? pinned : undefined
  const fresh = id === undefined || (forced !== null && forced !== pinned)
  if (id === undefined) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0]
    id = AB.variants[r % AB.variants.length].id
  }
  const variant = AB.variants.find((v) => v.id === id) ?? AB.variants[0]

  const headers: Record<string, string> = { 'x-mf-variant': variant.id }
  if (fresh) headers['set-cookie'] = `${AB.cookie}=${variant.id}; Path=/; Max-Age=${AB.maxAge}; SameSite=Lax; Secure`
  if (variant.shell === 'index.html') return next({ headers })
  const target = new URL(`/${variant.shell}`, url)
  target.search = url.search
  return rewrite(target, { headers })
}
