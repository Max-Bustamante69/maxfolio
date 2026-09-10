// Proof captures for the case-study sheet's "Impact" block: 4 stores x 2 viewports x 2 themes,
// each at mid-animation and at rest. One browser, sequential.
import { chromium } from 'playwright'
import fs from 'node:fs'

const OUT = process.argv[2] || 'proof-charts'
const BASE = process.argv[3] || 'http://localhost:4241'
fs.mkdirSync(OUT, { recursive: true })

const STORES = [
  { slug: 'the-gummy-box', name: 'The Gummy Box' },
  { slug: 'nos-cafe', name: 'NOS Café' },
  { slug: 'valdo-cafe', name: 'Valdo Café' },
  { slug: 'nalua', name: 'Nalua Skincare' },
]
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]
const THEMES = ['light', 'dark']

const b = await chromium.launch({ executablePath: 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' })

for (const store of STORES) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const ctx = await b.newContext({ viewport: vp, isMobile: vp.width < 500, hasTouch: vp.width < 500 })
      const page = await ctx.newPage()
      await page.goto(BASE + '/', { waitUntil: 'networkidle' })
      await page.evaluate((t) => localStorage.setItem('apple-theme', t), theme)
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(400)

      const trigger = page.getByRole('button', { name: new RegExp(store.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
      await trigger.first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      await trigger.first().click()
      await page.waitForTimeout(150) // sheet mount

      // Scroll the sheet's own scroller (not the page) to the Impact block.
      const scroller = page.locator('[data-lenis-prevent]').last()
      await scroller.evaluate((el) => el.scrollTo({ top: 0 }))
      await page.waitForTimeout(150)

      const tag = `${store.slug}-${vp.width}-${theme}`
      // Mid-animation: charts started drawing (delay ~0.1-0.25s) but haven't finished (duration ~0.7-1s).
      await page.screenshot({ path: `${OUT}/${tag}-mid.png` })
      // At rest: well past every chart's delay+duration.
      await page.waitForTimeout(1800)
      await page.screenshot({ path: `${OUT}/${tag}-rest.png` })

      await ctx.close()
      console.log('captured', tag)
    }
  }
}
await b.close()
console.log('done ->', OUT)
