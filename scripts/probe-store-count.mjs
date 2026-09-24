#!/usr/bin/env node
/**
 * probe-store-count.mjs — round 46, lane skills-claims.
 *
 * Max decided the public storefront-count claim is a fixed "20+" everywhere. This is the "unit-style"
 * probe the brief asked for: it never lets a stale "18+" or a bare, un-suffixed "23" (the real,
 * climbing `registry.stores.length`) sit next to the word "storefront"/"tiendas"/"ストア" anywhere the
 * site actually ships text — the built bundle (HTML shells + JS chunks) AND real rendered pages across
 * every route and all three locales.
 *
 * Two passes:
 *  (1) STATIC — greps `dist/**\/*.html` and `dist/**\/*.js` (source maps excluded) for both forbidden
 *      patterns. Requires `bun run build` to have produced `dist/` first.
 *  (2) RENDERED — starts its own `vite preview`, then for every route × locale combination renders the
 *      page with real Chromium and re-runs both checks against `document.body.innerText`, which is
 *      what a real visitor (or a text-only crawler) actually reads — catching anything the static pass
 *      could miss (e.g. text assembled at runtime from pieces that never sit adjacent in the bundle).
 *
 * A "bare 23" is digit-bounded (no digit immediately before or after) so it never flags "2023" (a
 * year) or "1,023" — only a real standalone count.
 *
 * Usage: node scripts/probe-store-count.mjs [--skip-build-check]
 */
import { chromium } from 'playwright'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'

/** `child.kill()` on Windows only signals the `cmd.exe` shell wrapper `{shell: true}` spawned under,
 *  never the actual `vite preview` grandchild — it survives, still bound to its port. `taskkill /t`
 *  kills the whole process tree; everywhere else, a plain kill is enough. */
function killTree(child) {
  if (!child.pid) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
  else child.kill()
}

const ROOT = resolve(import.meta.dirname, '..')
const DIST = join(ROOT, 'dist')

const findings = []
const fail = (msg) => {
  findings.push(msg)
  console.error('FAIL:', msg)
}
const ok = (msg) => console.log('ok:', msg)

// Digit-bounded "23" (never matches inside "2023", "1,023", "230", etc.) within ~50 chars of one of
// the storefront words in any of the three shipped locales.
const WORDS = ['storefront', 'storefronts', 'tiendas', 'tienda', 'ストア', '店舗']
const WORD_RE = new RegExp(`(?:${WORDS.join('|')})`, 'i')
// Digit- AND hyphen-bounded: a hyphen immediately before "23" means it's the day/month of an
// ISO date (e.g. "2026-09-23", "09-23") — this codebase's own changelog embeds commit dates right
// next to commit subjects that can legitimately mention the word "storefront" (this fix's own
// commit message, for one), which would otherwise false-positive here every single run.
const BARE_23_RE = /(?<![\d-])23(?!\d)/g
const EIGHTEEN_PLUS_RE = /18\+/g
// Tight window: real offending text has the number and the word directly adjacent ("23 tiendas",
// "23店舗"); a wide window risks bleeding across unrelated fields in a minified bundle or a dense
// changelog array.
const WINDOW = 30

/** Returns every offending window around a bare-23 or "18+" hit that also has one of the storefront
 *  words within `WINDOW` chars on either side. */
function scanText(text, sourceLabel) {
  const hits = []
  for (const m of text.matchAll(EIGHTEEN_PLUS_RE)) {
    hits.push({ pattern: '18+', at: m.index, window: text.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW) })
  }
  for (const m of text.matchAll(BARE_23_RE)) {
    const window = text.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW)
    if (WORD_RE.test(window)) hits.push({ pattern: 'bare 23 near a storefront word', at: m.index, window })
  }
  for (const h of hits) {
    fail(`${sourceLabel}: found "${h.pattern}" — context: ...${h.window.replace(/\s+/g, ' ')}...`)
  }
  return hits.length
}

function walk(dir, exts) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p, exts))
    else if (exts.includes(extname(name))) out.push(p)
  }
  return out
}

async function staticPass() {
  console.log('\n=== STATIC: built bundle ===')
  if (!existsSync(DIST)) {
    fail(`dist/ does not exist — run "bun run build" before this probe`)
    return
  }
  const files = walk(DIST, ['.html', '.js']).filter((f) => !f.endsWith('.map'))
  let totalHits = 0
  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    totalHits += scanText(text, `dist/${f.slice(DIST.length + 1).replace(/\\/g, '/')}`)
  }
  if (totalHits === 0) ok(`static pass clean across ${files.length} built file(s)`)
}

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.unref()
    srv.on('error', rej)
    // vite preview binds the IPv6 loopback for "localhost" on this machine, not 127.0.0.1 — probe the
    // same interface it will actually use.
    srv.listen(0, 'localhost', () => {
      const { port } = srv.address()
      srv.close(() => res(port))
    })
  })
}

function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now()
  return new Promise((res, rej) => {
    const tryOnce = () => {
      fetch(url)
        .then(() => res())
        .catch(() => {
          if (Date.now() - start > timeoutMs) rej(new Error(`preview server never answered at ${url}`))
          else setTimeout(tryOnce, 300)
        })
    }
    tryOnce()
  })
}

// Every real route this site serves (App.tsx routes + the three static A/B shell entry HTML files),
// crossed with all three shipped locales (LanguageProvider's `lang` localStorage key).
const ROUTES = ['/', '/luxury', '/brutalist', '/neo', '/arcade', '/terminal']
const LOCALES = ['en', 'es', 'ja']

async function renderedPass() {
  console.log('\n=== RENDERED: real pages, all routes × all locales ===')
  const port = await getFreePort()
  const base = `http://localhost:${port}`
  const preview = spawn('bunx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  try {
    await waitForServer(base)
    ok(`preview server up at ${base}`)
    const browser = await chromium.launch()
    let pages = 0
    for (const route of ROUTES) {
      for (const locale of LOCALES) {
        const context = await browser.newContext()
        await context.addInitScript((l) => {
          try {
            localStorage.setItem('lang', l)
          } catch {
            /* ignore */
          }
        }, locale)
        const page = await context.newPage()
        await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60_000 })
        await page.waitForTimeout(500)
        const text = await page.evaluate(() => document.body.innerText)
        const meta = await page.evaluate(() => {
          const d = document.querySelector('meta[name="description"]')
          const og = document.querySelector('meta[property="og:description"]')
          return [d?.getAttribute('content') ?? '', og?.getAttribute('content') ?? ''].join(' ')
        })
        const before = findings.length
        scanText(text, `${route} [${locale}] body text`)
        scanText(meta, `${route} [${locale}] meta description`)
        if (findings.length === before) ok(`${route} [${locale}] clean`)
        pages++
        await context.close()
      }
    }
    await browser.close()
    console.log(`\nRendered ${pages} route×locale page(s).`)
  } finally {
    killTree(preview)
  }
}

async function main() {
  await staticPass()
  await renderedPass()

  console.log('\n=== SUMMARY ===')
  if (findings.length) {
    console.log(`FAIL — ${findings.length} finding(s).`)
    process.exit(1)
  } else {
    console.log('PASS — no "18+" and no bare "23" next to a storefront word, anywhere.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
