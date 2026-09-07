// Measures the live fleet with Google's PageSpeed Insights API (Lighthouse on Google's servers,
// so the numbers do not depend on this machine's CPU). Mobile strategy, home route.
// Usage: node scripts/measure-psi.mjs [--out src/data/metrics.json]
import { readFileSync, writeFileSync } from 'node:fs'
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'src/data/metrics.json'
const src = readFileSync('src/data/registry.ts', 'utf8')
const stores = [...src.matchAll(/\{ slug: '([^']+)',[^\n]*?url: '([^']*)', status: '(\w+)'[^\n]*/g)]
  .map((m) => ({ slug: m[1], url: m[2], status: m[3], legacy: /legacy: true/.test(m[0]) }))
  .filter((s) => s.url && s.status === 'live' && !s.legacy)
const KEY = process.env.PSI_KEY ? `&key=${process.env.PSI_KEY}` : ''
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function measure(s, attempt = 1) {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(s.url)}&strategy=mobile&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO${KEY}`
  const res = await fetch(api)
  if (!res.ok) {
    if (attempt < 3) { await sleep(20000 * attempt); return measure(s, attempt + 1) }
    return { slug: s.slug, error: `${res.status}` }
  }
  const j = await res.json()
  const c = j.lighthouseResult.categories
  const a = j.lighthouseResult.audits
  const pct = (x) => Math.round(x.score * 100)
  return {
    slug: s.slug,
    perf: pct(c.performance), a11y: pct(c.accessibility), bp: pct(c['best-practices']), seo: pct(c.seo),
    lcp: a['largest-contentful-paint']?.displayValue ?? null,
    cls: a['cumulative-layout-shift']?.displayValue ?? null,
    tbt: a['total-blocking-time']?.displayValue ?? null,
    fieldLcp: j.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
    measured: j.analysisUTCTimestamp?.slice(0, 10),
    strategy: 'mobile', finalUrl: j.lighthouseResult.finalDisplayedUrl ?? j.lighthouseResult.finalUrl,
  }
}
const results = {}
// two at a time — keyless quota is small
for (let i = 0; i < stores.length; i += 2) {
  const batch = stores.slice(i, i + 2)
  const rs = await Promise.all(batch.map(measure))
  for (const r of rs) { results[r.slug] = r; console.log(JSON.stringify(r)) }
  await sleep(4000)
}
writeFileSync(out, JSON.stringify(results, null, 2) + '\n')
console.log('wrote', out, Object.keys(results).length)
