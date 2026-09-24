// Proof capture for round 46, lane "proof" — the Apple page's new live-measurement section
// (StoreCheck.tsx / api/psi.ts). Spawns `bunx vite preview` on a free port, drives real Chromium via
// Playwright, and proves: idle/error/running/done render correctly at 1440x900 and 390x844, light and
// dark, no horizontal overflow, zero console errors.
//
// The "done" state is reached by intercepting `**/api/psi**` with Playwright's own network mocking
// (page.route) rather than calling live PageSpeed Insights: a real PSI run takes 10-40s per the
// brief's own estimate, this machine's anonymous PSI quota was already reported exhausted in an
// earlier round's notes, and `vite preview` alone never runs the `api/*.ts` Vercel Functions anyway
// (no dev server behind them here) — a live call from this harness could not succeed regardless. The
// mocked payload uses the-gummy-box's own real, already-measured mobile Lighthouse numbers from
// src/data/lighthouse.json (the same file FeaturedBuild's Impact strip reads), never invented values.
// The invalid-URL error path needs no mock at all — client-side validation, zero network.
//
// Usage: node scripts/probe-storecheck.mjs [outDir]
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'
import lighthouseJson from '../src/data/lighthouse.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const outDir = path.resolve(process.argv[2] || path.join(repoRoot, 'proof-out'))

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]
const MODES = ['light', 'dark']

const gummyMobile = lighthouseJson['the-gummy-box'].mobile
const MOCK_PAYLOAD = {
  url: 'https://thegummyboxwellness.com/',
  performance: gummyMobile.perf,
  accessibility: gummyMobile.a11y,
  bestPractices: gummyMobile.bp,
  seo: gummyMobile.seo,
  lcp: gummyMobile.lcp,
  cls: gummyMobile.cls,
  tbt: gummyMobile.tbt,
  cachedAt: '2026-09-10T07:31:46.826Z',
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status === 404) return true
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Server at ${url} did not come up within ${timeoutMs}ms`)
}

async function findChromiumExecutable() {
  const cacheDir = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  try {
    const entries = await readdir(cacheDir)
    const revs = entries.filter((e) => /^chromium-\d+$/.test(e)).sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    for (const rev of revs) {
      const exe = path.join(cacheDir, rev, 'chrome-win64', 'chrome.exe')
      try {
        await readdir(path.dirname(exe))
        return exe
      } catch {
        /* try next revision */
      }
    }
  } catch {
    /* no cache dir */
  }
  return null
}

async function main() {
  await mkdir(outDir, { recursive: true })

  const port = await getFreePort()
  const base = `http://127.0.0.1:${port}`
  console.log(`Starting bunx vite preview on ${base} ...`)
  const server = spawn('bunx', ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })
  let serverOut = ''
  server.stdout.on('data', (d) => (serverOut += d.toString()))
  server.stderr.on('data', (d) => (serverOut += d.toString()))

  const results = []
  let browser
  try {
    await waitForServer(base + '/')

    let launchErr
    try {
      browser = await chromium.launch()
    } catch (e) {
      launchErr = e
      const exe = await findChromiumExecutable()
      if (!exe) throw e
      console.log(`Default chromium.launch() failed (${e.message.split('\n')[0]}), retrying with ${exe}`)
      browser = await chromium.launch({ executablePath: exe })
    }
    if (launchErr) console.log('(recovered via explicit executablePath)')

    for (const vp of VIEWPORTS) {
      for (const mode of MODES) {
        const label = `${vp.name}-${mode}`
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: mode,
        })
        await context.addInitScript(
          ([theme]) => {
            try {
              localStorage.setItem('apple-theme', theme)
              localStorage.setItem('lang', 'en')
            } catch {
              /* private mode etc. */
            }
          },
          [mode],
        )
        const page = await context.newPage()
        const consoleErrors = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text())
        })
        page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))

        const entry = { label, screenshots: {}, consoleErrors: [], overflow: null, checks: {} }
        try {
          await page.goto(base + '/', { waitUntil: 'load' })
          const proofSection = page.locator('#proof')
          await proofSection.scrollIntoViewIfNeeded()
          await page.waitForTimeout(1800) // let the heading's word-by-word reveal finish before the idle shot

          // No horizontal overflow, 1px tolerance for subpixel rounding.
          const overflowPx = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
          entry.overflow = overflowPx
          entry.checks.noOverflow = overflowPx <= 1

          // Idle state.
          await proofSection.screenshot({ path: path.join(outDir, `${label}-idle.png`) })
          entry.screenshots.idle = `${label}-idle.png`

          // Invalid-URL error path — pure client-side validation, no network. The form (with the
          // input still showing what the visitor typed) stays mounted alongside the error message —
          // that's the picked design, not a probe workaround — so scope the error text by its own
          // copy, not by class, to avoid matching the heading's unrelated lead paragraph.
          const input = proofSection.locator('input[type="text"]')
          const submit = proofSection.locator('button[type="submit"]')
          await input.fill('not a url')
          await submit.click()
          const errorText = proofSection.getByText(/doesn't look like a URL|no parece una URL|URLの形になっていません/)
          await errorText.waitFor({ state: 'visible', timeout: 5000 })
          entry.checks.invalidUrlError = true
          await proofSection.screenshot({ path: path.join(outDir, `${label}-error-invalid.png`) })
          entry.screenshots.errorInvalid = `${label}-error-invalid.png`

          // Mock the server call so the success render can be proven without a live 10-40s PSI run.
          await page.route('**/api/psi**', async (route) => {
            await new Promise((r) => setTimeout(r, 500))
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PAYLOAD) })
          })
          await input.fill('thegummyboxwellness.com')
          await submit.click()

          // Running state — the request is in flight behind the 500ms mocked delay.
          await page.waitForTimeout(200)
          entry.checks.runningVisible = await proofSection.locator('text=/Measuring|Midiendo|測定中/').isVisible().catch(() => false)
          await proofSection.screenshot({ path: path.join(outDir, `${label}-running.png`) })
          entry.screenshots.running = `${label}-running.png`

          // Done state — the four score rings + CTA.
          const cta = proofSection.locator('button', { hasText: /Get the free|Pide tu revisión|無料20分/ })
          await cta.waitFor({ state: 'visible', timeout: 10_000 })
          await page.waitForTimeout(400) // let the entrance transition finish
          entry.checks.doneVisible = true
          await proofSection.screenshot({ path: path.join(outDir, `${label}-done.png`) })
          entry.screenshots.done = `${label}-done.png`

          const overflowPxAfter = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
          entry.checks.noOverflowAfterRun = overflowPxAfter <= 1
        } catch (err) {
          entry.error = String(err && err.message ? err.message : err)
        }
        entry.consoleErrors = consoleErrors
        entry.checks.zeroConsoleErrors = consoleErrors.length === 0
        results.push(entry)
        await context.close()
      }
    }
  } finally {
    if (browser) await browser.close()
    server.kill()
  }

  let allPass = true
  console.log('\n=== StoreCheck probe results ===')
  for (const r of results) {
    const pass = !r.error && Object.values(r.checks).every(Boolean)
    if (!pass) allPass = false
    console.log(`\n[${r.label}] ${pass ? 'PASS' : 'FAIL'}`)
    console.log('  checks:', JSON.stringify(r.checks))
    console.log('  overflow px:', r.overflow)
    if (r.consoleErrors.length) console.log('  console errors:', r.consoleErrors)
    if (r.error) console.log('  error:', r.error)
    console.log('  screenshots:', Object.values(r.screenshots).map((f) => path.join(outDir, f)))
  }
  console.log(`\n${allPass ? 'ALL PASS' : 'SOME FAILED'} — server output tail:\n${serverOut.split('\n').slice(-15).join('\n')}`)
  process.exit(allPass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
