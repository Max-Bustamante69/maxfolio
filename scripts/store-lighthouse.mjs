// Real Lighthouse scores against each LIVE store URL in the registry — mobile + desktop, one run
// each, sequential, one browser (same launch pattern as scripts/lighthouse-local.mjs: CHROME_PATH
// env var or the default local chromium path). Feeds the case-study sheet's Impact block: the
// Lighthouse paired bars' "after" value and the Speed gauge's real mobile LCP are both read straight
// from this file — nothing here is illustrative. A store that fails (timeout, bot-block, DNS) is
// skipped with its reason recorded under `_skipped`, never invented.
//
// Output: src/data/lighthouse.json  { [slug]: { fetchedAt, mobile: {...}|null, desktop: {...}|null } }
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

// Same convention as scripts/measure-lighthouse.mjs / store-commerce.mjs: pull slug + url straight
// out of registry.ts's source text (no TS parser needed) — every store whose registry entry carries
// a real, publicly reachable URL, regardless of the `status` (live/dev) field, which tracks
// Digitdeck's own build/theme state, not whether the storefront itself is browsable.
const registrySrc = readFileSync(REGISTRY, 'utf8')
const storesBlock = registrySrc.match(/export const stores: StoreEntry\[\] = \[([\s\S]*?)\n\]/)
if (!storesBlock) throw new Error('Could not find `stores` array in registry.ts')
const stores = storesBlock[1]
  .split('\n')
  .filter((l) => l.trim().startsWith('{'))
  .map((line) => ({ slug: line.match(/slug: '([^']*)'/)?.[1] ?? '', url: line.match(/url: '([^']*)'/)?.[1] ?? '' }))
  .filter((s) => s.url && (!ONLY.length || ONLY.includes(s.slug)))

mkdirSync(path.join(ROOT, 'scripts/.capture-cache/lh-store'), { recursive: true })

function runLighthouse(url, slug, form) {
  const file = path.join(ROOT, `scripts/.capture-cache/lh-store/${slug}-${form}.json`)
  const preset = form === 'desktop' ? '--preset=desktop' : ''
  execSync(
    `npx --yes lighthouse "${url}" ${preset} --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="${file}"`,
    { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore', timeout: 180000 },
  )
  const j = JSON.parse(readFileSync(file, 'utf8'))
  const c = j.categories
  const a = j.audits
  const numeric = (id) => (typeof a[id]?.numericValue === 'number' ? a[id].numericValue : null)
  const lcpMs = numeric('largest-contentful-paint')
  return {
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: lcpMs !== null ? Math.round((lcpMs / 1000) * 100) / 100 : null, // seconds
    tbt: numeric('total-blocking-time'),
    cls: numeric('cumulative-layout-shift'),
    finalUrl: j.finalDisplayedUrl ?? j.finalUrl ?? url,
  }
}

const out = {}
const skipped = {}
console.log(`measuring ${stores.length} stores x 2 forms (sequential)`)
for (const s of stores) {
  const entry = { fetchedAt: new Date().toISOString(), mobile: null, desktop: null }
  let anyOk = false
  for (const form of ['mobile', 'desktop']) {
    try {
      entry[form] = runLighthouse(s.url, s.slug, form)
      anyOk = true
      console.log(s.slug, form, JSON.stringify(entry[form]))
    } catch (e) {
      const reason = String(e?.message ?? e).slice(0, 200).replace(/\s+/g, ' ')
      console.log(s.slug, form, 'FAILED —', reason)
      ;(skipped[s.slug] ??= {})[form] = reason
    }
  }
  if (anyOk) out[s.slug] = entry
  else skipped[s.slug] = { ...skipped[s.slug], both: 'no form measured' }
}
if (Object.keys(skipped).length) out._skipped = skipped
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(`\nwrote ${OUT} — ${Object.keys(out).filter((k) => k !== '_skipped').length} stores measured, ${Object.keys(skipped).length} skipped`)
