// Lighthouse against the production build served locally (vite preview), mobile + desktop.
// Prints the four scores per run, the median, and every non-passing audit with its savings.
// Usage: node scripts/lighthouse-local.mjs [--runs 3] [--route /] [--desktop-only|--mobile-only]
import { execSync, spawn } from 'node:child_process'
import { readFileSync, mkdirSync } from 'node:fs'

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d)
const RUNS = Number(arg('--runs', 3))
const ROUTE = arg('--route', '/')
const PORT = 4173
const CHROME = process.env.CHROME_PATH || 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'
const forms = process.argv.includes('--desktop-only') ? ['desktop'] : process.argv.includes('--mobile-only') ? ['mobile'] : ['mobile', 'desktop']
mkdirSync('scripts/.capture-cache/lh-local', { recursive: true })

execSync('bun run build', { stdio: 'ignore' })
const server = spawn('bunx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', shell: true })
await new Promise((r) => setTimeout(r, 2500))

const median = (xs) => { const a = [...xs].sort((p, q) => p - q); return a[Math.floor(a.length / 2)] }
const out = {}
try {
  for (const form of forms) {
    const runs = []
    let lastJson = null
    for (let i = 1; i <= RUNS; i++) {
      const file = `scripts/.capture-cache/lh-local/${form}-${i}.json`
      const preset = form === 'desktop' ? '--preset=desktop' : ''
      execSync(`npx --yes lighthouse http://localhost:${PORT}${ROUTE} ${preset} --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="${file}"`, { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'ignore', timeout: 240000 })
      const j = JSON.parse(readFileSync(file, 'utf8'))
      lastJson = j
      const c = j.categories
      runs.push({ perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100), lcp: j.audits['largest-contentful-paint'].displayValue, tbt: j.audits['total-blocking-time'].displayValue, cls: j.audits['cumulative-layout-shift'].displayValue })
      console.log(form, 'run', i, JSON.stringify(runs[runs.length - 1]))
    }
    const m = { perf: median(runs.map((r) => r.perf)), a11y: median(runs.map((r) => r.a11y)), bp: median(runs.map((r) => r.bp)), seo: median(runs.map((r) => r.seo)) }
    console.log(form, 'MEDIAN', JSON.stringify(m))
    const failing = Object.values(lastJson.audits)
      .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicative')
      .map((a) => `${a.id} (${a.score}) ${a.title}${a.displayValue ? ' — ' + a.displayValue : ''}`)
    console.log(form, 'NON-PASSING:', failing.length ? '\n  ' + failing.join('\n  ') : 'none')
    const lcpEl = lastJson.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet
    if (lcpEl) console.log(form, 'LCP element:', lcpEl.slice(0, 160))
    out[form] = { runs, median: m, failing }
  }
} finally {
  server.kill()
  try { execSync(`taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite" >nul 2>&1`, { stdio: 'ignore' }) } catch {}
}
console.log(JSON.stringify(out))
