// Real performance/quality scores against each LIVE store URL in the registry — mobile + desktop,
// primary path PageSpeed Insights v5 (no API key: https://www.googleapis.com/pagespeedonline/v5/
// runPagespeed), which gives both a fresh lab run AND, when the origin has enough real-user traffic,
// CrUX FIELD data (p75 LCP/INP/CLS + whether the page passes Core Web Vitals) — something a local
// Lighthouse run can never produce. Rate-limited to one request every 3s, one retry on 429/5xx. If PSI
// still refuses after the retry, that form falls back to the local `lighthouse` package (CHROME_PATH
// env var or the default local chromium path), 3 runs on an idle machine, the BEST run kept. A store
// that fails on both paths is skipped with its reason recorded under `_skipped`, never invented.
//
// Feeds the case-study sheet's Impact block: the score-rings row (desktop performance/accessibility/
// SEO), the performance before→after dual ring's "after" arc, the Core Web Vitals strip (when field
// data exists) or the lab LCP gauge (when it doesn't), and the load-time pair's "after" leg. Nothing
// here is illustrative.
//
// Output: src/data/lighthouse.json  { [slug]: { fetchedAt, source, mobile: {...}|null, desktop: {...}|null } }
// Usage: node scripts/store-lighthouse.mjs [--only slug,slug]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const REGISTRY = path.join(ROOT, 'src/data/registry.ts')
const OUT = path.join(ROOT, 'src/data/lighthouse.json')
const CHROME = process.env.CHROME_PATH || 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d)
const ONLY = (arg('--only', '') || '').split(',').filter(Boolean)
const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const MIN_GAP_MS = 3000

const registrySrc = readFileSync(REGISTRY, 'utf8')
const storesBlock = registrySrc.match(/export const stores: StoreEntry\[\] = \[([\s\S]*?)\n\]/)
if (!storesBlock) throw new Error('Could not find `stores` array in registry.ts')
const stores = storesBlock[1]
  .split('\n')
  .filter((l) => l.trim().startsWith('{'))
  .map((line) => ({ slug: line.match(/slug: '([^']*)'/)?.[1] ?? '', url: line.match(/url: '([^']*)'/)?.[1] ?? '' }))
  .filter((s) => s.url && (!ONLY.length || ONLY.includes(s.slug)))

mkdirSync(path.join(ROOT, 'scripts/.capture-cache/lh-store'), { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let lastRequestAt = 0
/** Enforces the ≤1 request / 3s ceiling across every PSI call in this run, not per-store. */
async function paced() {
  const wait = MIN_GAP_MS - (Date.now() - lastRequestAt)
  if (wait > 0) await sleep(wait)
  lastRequestAt = Date.now()
}

/** CrUX field category → our own good/needs-improvement/poor read. PSI already applies the official
 *  thresholds (LCP ≤2.5s / INP ≤200ms / CLS ≤0.1 for "FAST"), so this only reshapes, never re-judges. */
function fieldFrom(loadingExperience) {
  const m = loadingExperience?.metrics
  if (!m) return null
  const lcp = m.LARGEST_CONTENTFUL_PAINT_MS
  const inp = m.INTERACTION_TO_NEXT_PAINT ?? m.FIRST_INPUT_DELAY_MS
  const cls = m.CUMULATIVE_LAYOUT_SHIFT_SCORE
  if (!lcp && !inp && !cls) return null
  const p75Lcp = lcp ? Math.round((lcp.percentile / 1000) * 100) / 100 : null // seconds
  const p75Inp = inp ? inp.percentile : null // ms
  const p75Cls = cls ? Math.round(cls.percentile) / 100 : null // CrUX reports CLS×100
  const passes = [lcp?.category, inp?.category, cls?.category].filter(Boolean).every((c) => c === 'FAST')
  return { p75Lcp, p75Inp, p75Cls, passes }
}

async function runPsi(url, strategy) {
  const qs = new URLSearchParams({ url, strategy })
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) qs.append('category', c)
  const full = `${PSI_ENDPOINT}?${qs.toString()}`
  for (let attempt = 0; attempt < 2; attempt++) {
    await paced()
    let res
    try {
      res = await fetch(full, { signal: AbortSignal.timeout(60000) })
    } catch (e) {
      if (attempt === 0) {
        await sleep(4000)
        continue
      }
      throw e
    }
    if (res.status === 429 || res.status >= 500) {
      if (attempt === 0) {
        await sleep(4000)
        continue
      }
      throw new Error(`PSI ${res.status} after retry`)
    }
    if (!res.ok) throw new Error(`PSI ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const json = await res.json()
    const c = json.lighthouseResult?.categories
    const a = json.lighthouseResult?.audits
    if (!c) throw new Error('PSI response missing lighthouseResult.categories')
    const numeric = (id) => (typeof a?.[id]?.numericValue === 'number' ? a[id].numericValue : null)
    const lcpMs = numeric('largest-contentful-paint')
    return {
      perf: Math.round(c.performance.score * 100),
      a11y: Math.round(c.accessibility.score * 100),
      bp: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      lcp: lcpMs !== null ? Math.round((lcpMs / 1000) * 100) / 100 : null,
      tbt: numeric('total-blocking-time'),
      cls: numeric('cumulative-layout-shift'),
      finalUrl: json.lighthouseResult?.finalDisplayedUrl ?? json.lighthouseResult?.finalUrl ?? url,
      field: fieldFrom(json.loadingExperience) ?? fieldFrom(json.originLoadingExperience),
    }
  }
  throw new Error('unreachable')
}

/** Local fallback: 3 sequential runs, the BEST (highest performance score) kept — same intent as the
 *  owner's "idle machine, 3 runs, best run" rule, applied only when PSI itself refuses. No field data
 *  is possible from a local run, so `field` is always null on this path. */
function runLocalBest(url, slug, form) {
  const preset = form === 'desktop' ? '--preset=desktop' : ''
  let best = null
  for (let i = 0; i < 3; i++) {
    const file = path.join(ROOT, `scripts/.capture-cache/lh-store/${slug}-${form}-${i}.json`)
    try {
      execSync(
        `npx --yes lighthouse "${url}" ${preset} --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="${file}"`,
        { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore', timeout: 180000 },
      )
    } catch (e) {
      if (!best) throw e
      continue
    }
    const j = JSON.parse(readFileSync(file, 'utf8'))
    const c = j.categories
    const a = j.audits
    const numeric = (id) => (typeof a[id]?.numericValue === 'number' ? a[id].numericValue : null)
    const lcpMs = numeric('largest-contentful-paint')
    const entry = {
      perf: Math.round(c.performance.score * 100),
      a11y: Math.round(c.accessibility.score * 100),
      bp: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      lcp: lcpMs !== null ? Math.round((lcpMs / 1000) * 100) / 100 : null,
      tbt: numeric('total-blocking-time'),
      cls: numeric('cumulative-layout-shift'),
      finalUrl: j.finalDisplayedUrl ?? j.finalUrl ?? url,
      field: null,
    }
    if (!best || entry.perf > best.perf) best = entry
  }
  if (!best) throw new Error('local lighthouse produced no successful run')
  return best
}

async function measure(url, slug, form) {
  try {
    return { entry: await runPsi(url, form), source: 'PageSpeed Insights' }
  } catch (e) {
    console.log(slug, form, 'PSI failed —', String(e?.message ?? e).slice(0, 160).replace(/\s+/g, ' '), '— falling back to local')
    return { entry: runLocalBest(url, slug, form), source: 'local, best of 3' }
  }
}

// Merge into whatever OUT already has — a scoped `--only` run must never blank out every other
// store's last-measured data (caught 2026-09-10: an --only run for 6 proof stores silently dropped
// the other 12 stores' entries because `out` started empty and clobbered the file unconditionally).
let out = {}
let skipped = {}
try {
  const prev = JSON.parse(readFileSync(OUT, 'utf8'))
  if (prev && typeof prev === 'object') {
    skipped = { ...(prev._skipped ?? {}) }
    for (const [k, v] of Object.entries(prev)) if (k !== '_skipped') out[k] = v
  }
} catch {
  /* no existing file yet — first run */
}
console.log(`measuring ${stores.length} stores x 2 forms (PSI primary, ≤1 req/3s, local fallback)`)
for (const s of stores) {
  const entry = { fetchedAt: new Date().toISOString(), source: null, mobile: null, desktop: null }
  let anyOk = false
  const sources = new Set()
  for (const form of ['mobile', 'desktop']) {
    try {
      const { entry: measured, source } = await measure(s.url, s.slug, form)
      entry[form] = measured
      sources.add(source)
      anyOk = true
      console.log(s.slug, form, source, JSON.stringify(measured))
    } catch (e) {
      const reason = String(e?.message ?? e).slice(0, 200).replace(/\s+/g, ' ')
      console.log(s.slug, form, 'FAILED —', reason)
      ;(skipped[s.slug] ??= {})[form] = reason
    }
  }
  if (anyOk) {
    entry.source = sources.size === 1 ? [...sources][0] : [...sources].join(' + ')
    out[s.slug] = entry
    delete skipped[s.slug] // a fresh success replaces any stale skip reason from a prior run
  } else {
    skipped[s.slug] = { ...skipped[s.slug], both: 'no form measured' }
  }
}
if (Object.keys(skipped).length) out._skipped = skipped
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
const measuredSlugs = Object.keys(out).filter((k) => k !== '_skipped')
const psiCount = measuredSlugs.filter((k) => out[k].source.includes('PageSpeed')).length
const localCount = measuredSlugs.filter((k) => out[k].source.includes('local')).length
console.log(`\nwrote ${OUT} — ${measuredSlugs.length} stores measured (${psiCount} PSI, ${localCount} local fallback), ${Object.keys(skipped).length} skipped`)
