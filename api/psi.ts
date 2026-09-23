// Server-side proxy for Google PageSpeed Insights v5, behind the Apple page's "Measure your store,
// right now" section (StoreCheck.tsx). Exists so a Google Cloud API key never reaches the client:
// PSI_KEY (no VITE_ prefix — never bundled) is read only here and appended to the upstream call when
// present, so the anonymous public quota isn't the only path. Node.js runtime, not edge: a real PSI
// run can take 10-40s (the brief's own estimate), comfortably inside this function's maxDuration but
// past what several edge runtimes reliably allow.
//
// Contract, deliberately minimal — category scores plus LCP/CLS/TBT only, no field/CrUX data, no
// per-audit "opportunities": GET /api/psi?url=<target>
//   200 { url, performance, accessibility, bestPractices, seo, lcp, cls, tbt, cachedAt }
//   400 { error: 'invalid_url' }
//   429 { error: 'quota' }     -- our own soft per-IP rate limit, or PSI's own quota
//   502 { error: 'upstream' }  -- PSI reachable but returned something else non-OK
//   405 for any method but GET
export const config = { runtime: 'nodejs', maxDuration: 60 }
import { ipAddress } from '@vercel/functions'
import { kv, pipeline, json } from './_kv'

const MAX_URL_LENGTH = 2048
// PSI itself commonly takes 10-40s; this is our own upstream fetch's ceiling so a hung request always
// resolves into a clean error instead of running until the platform kills the function.
const UPSTREAM_TIMEOUT_MS = 45_000
// Soft, per-IP: enough to stop one visitor hammering the endpoint (or a bot) from burning the shared
// PSI quota, generous enough that nobody testing a couple of pages ever notices it.
const RATE_LIMIT_WINDOW_S = 60
const RATE_LIMIT_MAX = 8
// 6 hours, matching the s-maxage below — repeat checks of the same store within a work session reuse
// one PSI run instead of spending quota on an identical number.
const CACHE_S_MAXAGE = 6 * 60 * 60

function isIPv4Literal(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
}
function isIPv6Literal(host: string): boolean {
  // URL#hostname keeps the brackets for IPv6, e.g. "[::1]"; a bare "a:b:c..." never resolves as a
  // hostname anyway once it fails the IPv4/dot check below, but reject explicitly for clarity.
  return host.startsWith('[') || (host.includes(':') && /^[0-9a-f:]+$/i.test(host))
}

/** http/https only, a real (non-IP) public-looking hostname, max length. Note this validates the
 *  string only — PSI itself is the one that actually fetches the target, we never do (we only ever
 *  hand Google's API a URL string), so this exists to keep this endpoint from being usable as an
 *  open relay for garbage input, not as a defense of Digitdeck's own network. */
function validateTargetUrl(raw: string): { ok: true; normalized: string } | { ok: false } {
  if (!raw || raw.length > MAX_URL_LENGTH) return { ok: false }
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let u: URL
  try {
    u = new URL(withScheme)
  } catch {
    return { ok: false }
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false }
  const host = u.hostname.toLowerCase()
  if (!host) return { ok: false }
  if (host === 'localhost' || host.endsWith('.localhost')) return { ok: false }
  if (isIPv6Literal(host)) return { ok: false }
  if (isIPv4Literal(host)) return { ok: false }
  if (!host.includes('.')) return { ok: false } // require a real-looking hostname, not a bare word
  return { ok: true, normalized: u.toString() }
}

interface PsiAudit {
  numericValue?: number
}
interface PsiResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score?: number }
      accessibility?: { score?: number }
      'best-practices'?: { score?: number }
      seo?: { score?: number }
    }
    audits?: Record<string, PsiAudit>
  }
}

const scorePct = (v: number | undefined) => Math.round((v ?? 0) * 100)

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return new Response(null, { status: 405 })

  const reqUrl = new URL(req.url)
  const target = validateTargetUrl(reqUrl.searchParams.get('url') ?? '')
  if (!target.ok) return json({ error: 'invalid_url' }, 400)

  // Soft per-IP rate limit — a no-op with no ip or no KV store configured (see api/ab.ts's own note:
  // the site never depends on either ledger existing).
  const ip = ipAddress(req)
  if (ip && kv()) {
    const key = `psi:rl:${ip}`
    try {
      const out = await pipeline([
        ['INCR', key],
        ['EXPIRE', key, String(RATE_LIMIT_WINDOW_S), 'NX'],
      ])
      const count = Number(out?.[0]?.result ?? 0)
      if (count > RATE_LIMIT_MAX) return json({ error: 'quota' }, 429)
    } catch {
      /* KV hiccup — never block a real measurement over a rate-limit bookkeeping failure */
    }
  }

  const params = new URLSearchParams({ url: target.normalized, strategy: 'mobile' })
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) params.append('category', c)
  const key = process.env.PSI_KEY
  if (key) params.set('key', key)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  let upstream: Response
  try {
    upstream = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`, { signal: controller.signal })
  } catch {
    clearTimeout(timeout)
    return json({ error: 'upstream' }, 502)
  }
  clearTimeout(timeout)

  if (!upstream.ok) {
    if (upstream.status === 429) return json({ error: 'quota' }, 429)
    if (upstream.status === 400) return json({ error: 'invalid_url' }, 400)
    return json({ error: 'upstream' }, 502)
  }

  let data: PsiResponse
  try {
    data = (await upstream.json()) as PsiResponse
  } catch {
    return json({ error: 'upstream' }, 502)
  }

  const categories = data.lighthouseResult?.categories ?? {}
  const audits = data.lighthouseResult?.audits ?? {}
  const payload = {
    url: target.normalized,
    performance: scorePct(categories.performance?.score),
    accessibility: scorePct(categories.accessibility?.score),
    bestPractices: scorePct(categories['best-practices']?.score),
    seo: scorePct(categories.seo?.score),
    lcp: (audits['largest-contentful-paint']?.numericValue ?? 0) / 1000,
    cls: audits['cumulative-layout-shift']?.numericValue ?? 0,
    tbt: audits['total-blocking-time']?.numericValue ?? 0,
    cachedAt: new Date().toISOString(),
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      // Keyed by the exact request URL Vercel's edge network sees — the client always sends the
      // already-normalized target (StoreCheck.tsx's own normalizeUrl), so the same store hits the
      // same cache entry across visitors for 6 hours regardless of how each one typed it.
      'cache-control': `public, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=86400`,
    },
  })
}
