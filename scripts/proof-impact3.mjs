// Proof captures for the rebuilt "Impact" block (2026-09-10 owner call): score rings, the
// performance dual ring, Core Web Vitals / LCP gauge and the three indexed lines. 6 stores x 2
// viewports x 2 themes x 2 locales, deep-linked straight to the sheet via `?store=<slug>` (no click
// needed). For every capture: assert the block-level small print is inside the viewport, collect
// console errors, and record whether the sheet's own scroller had to move (i.e. the block fits) or
// not — both are fine, this only documents which.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2] || 'proof-impact3'
const BASE = process.argv[3] || 'http://localhost:4271'
fs.mkdirSync(OUT, { recursive: true })

const STORES = [
  { slug: 'the-gummy-box', name: 'TGB' },
  { slug: 'nos-cafe', name: 'NOS' },
  { slug: 'valdo-cafe', name: 'Valdo' },
  { slug: 'nalua', name: 'Nalua' },
  { slug: 'peluna', name: 'Peluna' },
  { slug: 'factores-2x2', name: 'Factores' },
]
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]
const THEMES = ['light', 'dark']
const LOCALES = [
  { tag: 'en', locale: 'en-US' },
  { tag: 'es', locale: 'es-CO' },
]

const b = await chromium.launch({ executablePath: 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' })

const results = []
let anyConsoleErrors = false

for (const store of STORES) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const loc of LOCALES) {
        const consoleErrors = []
        const ctx = await b.newContext({ viewport: vp, isMobile: vp.width < 500, hasTouch: vp.width < 500, locale: loc.locale })
        const page = await ctx.newPage()
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text())
        })
        page.on('pageerror', (err) => consoleErrors.push(String(err)))

        // Theme first (plain load), then reload with the deep link so the sheet opens already themed.
        await page.goto(BASE + '/', { waitUntil: 'networkidle' })
        await page.evaluate((t) => localStorage.setItem('apple-theme', t), theme)
        await page.goto(`${BASE}/?store=${store.slug}`, { waitUntil: 'networkidle' })
        await page.waitForTimeout(300) // sheet mount

        const scroller = page.locator('[data-lenis-prevent]').last()
        await scroller.evaluate((el) => el.scrollTo({ top: 0 }))
        await page.waitForTimeout(150)

        // Scroll until the small print (the disclosure's <p>, matched by its stable dark/light muted
        // classes carrying the fixed disclaimer text) is in view, or give up after a bounded number of
        // steps — the block-level disclosure always follows the Impact charts in DOM order.
        let smallPrintVisible = false
        for (let i = 0; i < 14; i++) {
          const box = await page
            .locator('[data-lenis-prevent] p')
            .filter({ hasText: /confidential|confidenciales|非公開/ })
            .first()
            .boundingBox()
            .catch(() => null)
          if (box && box.y >= 0 && box.y + box.height <= vp.height) {
            smallPrintVisible = true
            break
          }
          const before = await scroller.evaluate((el) => el.scrollTop)
          await scroller.evaluate((el) => el.scrollBy({ top: 220 }))
          await page.waitForTimeout(60)
          const after = await scroller.evaluate((el) => el.scrollTop)
          if (after === before) break // reached the bottom
        }
        await page.waitForTimeout(1800) // well past every chart's delay+duration

        const tag = `${store.slug}-${vp.width}-${theme}-${loc.tag}`
        await page.screenshot({ path: path.join(OUT, `${tag}.png`) })

        if (consoleErrors.length) anyConsoleErrors = true
        results.push({ tag, smallPrintVisible, consoleErrors })
        console.log(tag, 'smallPrintVisible=', smallPrintVisible, consoleErrors.length ? `CONSOLE ERRORS: ${JSON.stringify(consoleErrors)}` : 'no console errors')

        await ctx.close()
      }
    }
  }
}
await b.close()

fs.writeFileSync(path.join(OUT, '_results.json'), JSON.stringify(results, null, 2))
const missingSmallPrint = results.filter((r) => !r.smallPrintVisible)
console.log(`\ndone -> ${OUT}`)
console.log(`captures: ${results.length}, small print not in viewport: ${missingSmallPrint.length}, any console errors: ${anyConsoleErrors}`)
if (missingSmallPrint.length) console.log('MISSING:', missingSmallPrint.map((r) => r.tag).join(', '))
