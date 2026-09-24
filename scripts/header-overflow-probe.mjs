#!/usr/bin/env node
/**
 * header-overflow-probe.mjs — measures the top header/nav bar of every switchable theme across the
 * full responsive width matrix, in both light and dark color-scheme, and reports:
 *   - every interactive control's getBoundingClientRect (left/right vs innerWidth = 0..width)
 *   - the header container's own scrollWidth vs clientWidth (internal overflow)
 *   - pairwise bounding-box overlaps between header controls
 *   - page-level horizontal overflow (document.documentElement.scrollWidth vs clientWidth)
 *
 * The header container is found generically (works across all themes without per-theme selectors):
 * the shallowest element at scrollY=0 whose own computed style is `position: fixed` with
 * `top` within 4px of 0 (every theme's top bar is a `fixed top-0 inset-x-0` wrapper), falling back to
 * `header` for the one theme (Terminal `<header>`, Menu `<header role="banner">`) where that's it,
 * and finally the first `nav[aria-label="Main navigation"]` in the rare case neither matches.
 *
 * Usage:
 *   node scripts/header-overflow-probe.mjs --base http://localhost:4501 --out <dir> [--label candidate]
 *
 * Run once with --base against production and once against a local preview of the worktree, then
 * pass both JSON reports to scripts/header-overflow-diff.mjs.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const BASE = flag('base', 'http://localhost:4501')
const LABEL = flag('label', BASE)
const OUT = resolve(flag('out', 'C:/Users/Usuario/AppData/Local/Temp/claude/C--Users-Usuario-Desktop-P-Github-Digitdeck/75fa9a07-350d-4734-9d2e-ac255cc6dd8f/scratchpad/header-probe'))
mkdirSync(OUT, { recursive: true })

const ROUTES = [
  { path: '/', theme: 'apple' },
  { path: '/luxury', theme: 'luxury' },
  { path: '/brutalist', theme: 'brutalist' },
  { path: '/neo', theme: 'neo' },
  { path: '/arcade', theme: 'arcade' },
  { path: '/terminal', theme: 'terminal' },
  { path: '/menu', theme: 'menu' },
]

const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 834, 1024, 1440]
const SCHEMES = ['light', 'dark']
const HEIGHT = 900

/** Runs inside the page. Finds the header container, its controls, overlaps, and page overflow. */
function measure() {
  function isVisible(el) {
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) return false
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) !== 0
  }

  // Find the header container generically.
  let header = null
  const all = Array.from(document.querySelectorAll('body *'))
  for (const el of all) {
    if (!isVisible(el)) continue
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (cs.position === 'fixed' && Math.abs(r.top) <= 4 && r.height > 0 && r.height < 160 && r.width > window.innerWidth * 0.3) {
      header = el
      break
    }
  }
  if (!header) header = document.querySelector('header')
  if (!header) header = document.querySelector('nav[aria-label="Main navigation"]')

  if (!header) {
    return {
      headerFound: false,
      controls: [],
      overlaps: [],
      headerInternalOverflow: null,
      pageOverflow: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, innerWidth: window.innerWidth, overflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) },
    }
  }

  const hRect = header.getBoundingClientRect()
  const vw = window.innerWidth

  const controlEls = Array.from(header.querySelectorAll('a[href], button, input, select, [role="button"], [tabindex]')).filter((el) => el.getAttribute('tabindex') !== '-1' && isVisible(el))

  function labelOf(el) {
    const aria = el.getAttribute('aria-label')
    if (aria) return aria.slice(0, 60)
    const txt = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ')
    if (txt) return txt.slice(0, 60)
    const href = el.getAttribute('href')
    if (href) return `href=${href}`
    return el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').slice(0, 2).join('.') : '')
  }

  const controls = controlEls.map((el) => {
    const r = el.getBoundingClientRect()
    return {
      label: labelOf(el),
      tag: el.tagName.toLowerCase(),
      left: Math.round(r.left * 10) / 10,
      right: Math.round(r.right * 10) / 10,
      top: Math.round(r.top * 10) / 10,
      bottom: Math.round(r.bottom * 10) / 10,
      width: Math.round(r.width * 10) / 10,
      offRight: Math.round((r.right - vw) * 10) / 10, // >0 = overflows past the right edge
      offLeft: Math.round(-r.left * 10) / 10, // >0 = overflows past the left edge
    }
  })

  const overlaps = []
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i]
      const b = controls[j]
      const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left)
      const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      if (ix > 3 && iy > 3) overlaps.push({ a: a.label, b: b.label, overlapPx: `${Math.round(ix)}x${Math.round(iy)}` })
    }
  }

  return {
    headerFound: true,
    headerSelector: header.tagName.toLowerCase() + (header.getAttribute('aria-label') ? `[aria-label="${header.getAttribute('aria-label')}"]` : ''),
    headerRect: { left: Math.round(hRect.left), right: Math.round(hRect.right), width: Math.round(hRect.width), height: Math.round(hRect.height) },
    headerInternalOverflow: { scrollWidth: header.scrollWidth, clientWidth: header.clientWidth, overflowPx: Math.max(0, header.scrollWidth - header.clientWidth) },
    controls,
    overlaps,
    pageOverflow: {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      innerWidth: window.innerWidth,
      overflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    },
  }
}

async function main() {
  const browser = await chromium.launch()
  const report = { generatedAt: new Date().toISOString(), base: BASE, label: LABEL, rows: [] }
  let total = 0
  let done = 0
  total = ROUTES.length * WIDTHS.length * SCHEMES.length

  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      for (const scheme of SCHEMES) {
        done++
        const context = await browser.newContext({ viewport: { width, height: HEIGHT }, colorScheme: scheme })
        const page = await context.newPage()
        const url = BASE + route.path
        let ok = true
        let errMsg = null
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
        } catch (e) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
          } catch (e2) {
            ok = false
            errMsg = String(e2)
          }
        }
        if (ok) await page.waitForTimeout(500)
        let result
        if (ok) {
          try {
            result = await page.evaluate(measure)
          } catch (e) {
            ok = false
            errMsg = String(e)
          }
        }
        const row = { path: route.path, theme: route.theme, width, scheme, ok, error: errMsg, ...(result || {}) }
        report.rows.push(row)
        await context.close()
        process.stdout.write(`\r[${done}/${total}] ${LABEL} ${route.path} @${width} ${scheme}      `)
      }
    }
  }
  console.log('')
  await browser.close()

  const safeLabel = LABEL.replace(/[^a-z0-9]+/gi, '_')
  const outPath = resolve(OUT, `header-probe-${safeLabel}.json`)
  writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log('Wrote', outPath)

  // Quick console summary: any overflow > 1px past either edge, any header internal overflow, any
  // page-level horizontal overflow, any control overlap.
  const findings = []
  for (const r of report.rows) {
    if (!r.ok) {
      findings.push(`${r.path} @${r.width} ${r.scheme}: LOAD FAILED — ${r.error}`)
      continue
    }
    if (!r.headerFound) {
      findings.push(`${r.path} @${r.width} ${r.scheme}: header not found`)
      continue
    }
    for (const c of r.controls) {
      if (c.offRight > 1) findings.push(`${r.path} @${r.width} ${r.scheme}: "${c.label}" right edge ${c.right}px (overflow ${c.offRight}px past ${r.width}px viewport)`)
      if (c.offLeft > 1) findings.push(`${r.path} @${r.width} ${r.scheme}: "${c.label}" left edge ${c.left}px (overflow ${c.offLeft}px before 0)`)
    }
    if (r.headerInternalOverflow?.overflowPx > 1) findings.push(`${r.path} @${r.width} ${r.scheme}: header scrollWidth ${r.headerInternalOverflow.scrollWidth} > clientWidth ${r.headerInternalOverflow.clientWidth} (+${r.headerInternalOverflow.overflowPx}px)`)
    if (r.pageOverflow?.overflowPx > 1) findings.push(`${r.path} @${r.width} ${r.scheme}: PAGE horizontal overflow +${r.pageOverflow.overflowPx}px (scrollWidth ${r.pageOverflow.scrollWidth} vs clientWidth ${r.pageOverflow.clientWidth})`)
    for (const o of r.overlaps || []) findings.push(`${r.path} @${r.width} ${r.scheme}: overlap "${o.a}" x "${o.b}" (${o.overlapPx})`)
  }
  console.log(`\n${findings.length} finding(s) for ${LABEL}:`)
  for (const f of findings) console.log('  - ' + f)
  writeFileSync(resolve(OUT, `header-probe-${safeLabel}-findings.txt`), findings.join('\n'))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
