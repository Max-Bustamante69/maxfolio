// Proof captures for the sheet-focus rebuild (2026-09-10, worktree feat/wt-sheetfocus): the
// case-study sheet trimmed to header -> captures -> tagline/description -> Impact -> stack -> Visit
// store, with the Impact block extended (Revenue indexed line, Delivery headline chip + "time to
// launch" bar, four-chip headline strip, Lighthouse delta in the rings caption). 8 stores x 2
// viewports x 2 themes x 2 locales, deep-linked straight to the open sheet via `?store=<slug>`. For
// every capture: assert the block-level small print is inside the viewport, collect console errors,
// and assert none of the removed strings (fleet median / share of catalog / discount ladder / price
// band / commits per week / Store facts / By the numbers / Visualized) appears anywhere in the
// rendered page text.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2] || 'proof-sheetfocus'
const BASE = process.argv[3] || 'http://localhost:4291'
fs.mkdirSync(OUT, { recursive: true })

const STORES = [
  { slug: 'the-gummy-box', name: 'TGB' },
  { slug: 'nos-cafe', name: 'NOS' },
  { slug: 'valdo-cafe', name: 'Valdo' },
  { slug: 'nalua', name: 'Nalua' },
  { slug: 'peluna', name: 'Peluna' },
  { slug: 'factores-2x2', name: 'Factores' },
  { slug: 'millennio', name: 'Millennio' },
  { slug: 'mindfuel', name: 'Mindfuel' },
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

// Verbatim strings the removed "By the numbers" / "Visualized" / "Store facts" blocks used to render
// — case-insensitive substring match against the whole page's rendered text (which, with the sheet
// open, still includes the rest of the homepage in the DOM — Gallery captions included). Spanish
// equivalents included (proof locales are EN/ES). Deliberately EXCLUDES phrases that collide with a
// different, still-shipping feature's copy: `commerce.offerKind.ladder` ("Bundle ladder" / "Escalón
// de descuento") legitimately still renders in Gallery captions for stores with a real `ladder` fact
// (e.g. The Gummy Box, NOS Café) and is NOT the removed chart's "Discount ladder" label (which used a
// different English phrase and is checked here); the Skyline theme's separate Instruments section
// ("Share of catalog on sale, fleet average") never renders on the pages this proof visits.
const BANNED = [
  'fleet median',
  'mediana de la flota',
  'discount ladder',
  'price band',
  'banda de precios',
  'commits per week',
  'commits por semana',
  'store facts',
  'datos de la tienda',
  'by the numbers',
  'en cifras',
  'visualized',
  'en gráficas',
]

const b = await chromium.launch({ executablePath: 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' })

const results = []
let anyConsoleErrors = false
let anyBanned = false

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

        // Scroll until the small print (the disclosure's <p>, matched by its stable fixed disclaimer
        // text) is in view, or give up after a bounded number of steps — the block-level disclosure
        // always follows the Impact charts in DOM order.
        let smallPrintVisible = false
        for (let i = 0; i < 16; i++) {
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

        const bodyText = (await page.evaluate(() => document.body.innerText)).toLowerCase()
        const bannedHits = BANNED.filter((s) => bodyText.includes(s.toLowerCase()))

        const tag = `${store.slug}-${vp.width}-${theme}-${loc.tag}`
        await page.screenshot({ path: path.join(OUT, `${tag}.png`) })

        if (consoleErrors.length) anyConsoleErrors = true
        if (bannedHits.length) anyBanned = true
        results.push({ tag, smallPrintVisible, bannedHits, consoleErrors })
        console.log(
          tag,
          'smallPrintVisible=',
          smallPrintVisible,
          bannedHits.length ? `BANNED STRINGS: ${JSON.stringify(bannedHits)}` : 'no banned strings',
          consoleErrors.length ? `CONSOLE ERRORS: ${JSON.stringify(consoleErrors)}` : 'no console errors',
        )

        await ctx.close()
      }
    }
  }
}
await b.close()

fs.writeFileSync(path.join(OUT, '_results.json'), JSON.stringify(results, null, 2))
const missingSmallPrint = results.filter((r) => !r.smallPrintVisible)
console.log(`\ndone -> ${OUT}`)
console.log(`captures: ${results.length}, small print not in viewport: ${missingSmallPrint.length}, any banned strings: ${anyBanned}, any console errors: ${anyConsoleErrors}`)
if (missingSmallPrint.length) console.log('MISSING SMALL PRINT:', missingSmallPrint.map((r) => r.tag).join(', '))
if (anyBanned) console.log('BANNED STRING HITS:', results.filter((r) => r.bannedHits.length).map((r) => `${r.tag}: ${r.bannedHits.join(', ')}`).join(' | '))
