// Lighthouse (mobile, simulated throttling) against the live non-legacy fleet, home route,
// N runs per store → median per category. PSI keyless is quota-blocked (429), so this runs the
// same Lighthouse locally; the sheet labels the numbers as lab, dated, median of N.
// Usage: node scripts/measure-lighthouse.mjs [--runs 3] [--out src/data/metrics.json] [--only slug,slug]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d)
const RUNS = Number(arg('--runs', 3))
const OUT = arg('--out', 'src/data/metrics.json')
const ONLY = arg('--only', '')?.split(',').filter(Boolean)
const CHROME = process.env.CHROME_PATH || 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'
const src = readFileSync('src/data/registry.ts', 'utf8')
const stores = [...src.matchAll(/\{ slug: '([^']+)',[^\n]*?url: '([^']*)', status: '(\w+)'[^\n]*/g)]
  .map((m) => ({ slug: m[1], url: m[2], status: m[3], legacy: /legacy: true/.test(m[0]) }))
  .filter((s) => s.url && s.status === 'live' && !s.legacy && (!ONLY.length || ONLY.includes(s.slug)))
mkdirSync('scripts/.capture-cache/lh', { recursive: true })
const median = (xs) => { const a = [...xs].sort((p, q) => p - q); return a[Math.floor(a.length / 2)] }
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const results = { ...prev }
for (const s of stores) {
  const runs = []
  for (let i = 1; i <= RUNS; i++) {
    const file = `scripts/.capture-cache/lh/${s.slug}-${i}.json`
    try {
      execSync(`npx --yes lighthouse "${s.url}" --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="${file}"`, { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore', timeout: 180000 })
      const j = JSON.parse(readFileSync(file, 'utf8'))
      const c = j.categories, a = j.audits
      runs.push({ perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100), lcp: a['largest-contentful-paint']?.displayValue ?? null, cls: a['cumulative-layout-shift']?.displayValue ?? null, tbt: a['total-blocking-time']?.displayValue ?? null, finalUrl: j.finalDisplayedUrl ?? j.finalUrl })
    } catch (e) { console.log(s.slug, 'run', i, 'failed', String(e).slice(0, 120)) }
  }
  if (!runs.length) { console.log(s.slug, 'NO DATA'); continue }
  const perf = median(runs.map((r) => r.perf))
  const pick = runs.find((r) => r.perf === perf) ?? runs[0]
  results[s.slug] = { perf, a11y: median(runs.map((r) => r.a11y)), bp: median(runs.map((r) => r.bp)), seo: median(runs.map((r) => r.seo)), lcp: pick.lcp, cls: pick.cls, tbt: pick.tbt, runs: runs.length, measured: new Date().toISOString().slice(0, 10), strategy: 'mobile', finalUrl: pick.finalUrl, allPerf: runs.map((r) => r.perf) }
  console.log(JSON.stringify(results[s.slug]))
  writeFileSync(OUT, JSON.stringify(results, null, 2) + '\n')
}
console.log('wrote', OUT, Object.keys(results).length)
