// One-off proof capture for the Skills sunburst rebuild — not part of the shipped build.
// node scripts/capture-skills-proof.mjs <baseUrl> <outDir>
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const [baseUrl = 'http://localhost:4295', outDir = 'docs/proof/2026-09-09-skills-sunburst'] = process.argv.slice(2)
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, outDir)
await mkdir(OUT, { recursive: true })

const ROUTES = [
  { theme: 'apple', path: '/', storageKey: 'apple-theme' },
  { theme: 'luxury', path: '/luxury', storageKey: 'luxury-theme' },
  { theme: 'brutalist', path: '/brutalist', storageKey: 'brutalist-theme' },
  { theme: 'neo', path: '/neo', storageKey: 'neo-theme' },
  { theme: 'arcade', path: '/arcade', storageKey: 'persona-theme' },
]
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 1400 },
  { name: '390', width: 390, height: 1400 },
]

const browser = await chromium.launch()
const only = process.env.THEME_FILTER?.split(',')

for (const route of ROUTES) {
  if (only && !only.includes(route.theme)) continue
  for (const vp of VIEWPORTS) {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme, deviceScaleFactor: vp.name === '390' ? 2 : 1 })
      const page = await context.newPage()
      const url = `${baseUrl}${route.path}`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
      // Force this route's own theme storage key so light/dark is deterministic, not system-dependent.
      await page.evaluate(
        ({ key, scheme }) => {
          try {
            localStorage.setItem(key, scheme)
          } catch {
            /* ignore */
          }
        },
        { key: route.storageKey, scheme: colorScheme },
      )
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      const target = page.locator('#skills').first()
      await target.scrollIntoViewIfNeeded()
      await page.waitForTimeout(2200) // let scroll-reveal / arc draw-in / count-up animations fully settle
      const file = path.join(OUT, `${route.theme}-${vp.name}-${colorScheme}.png`)
      await target.screenshot({ path: file })
      console.log(`✓ ${file}`)

      // Hover the first ring-2 arc (desktop only) to prove the interaction, if present.
      if (vp.name === '1440') {
        const arc = target.locator('svg [role="button"]').nth(8)
        if (await arc.count()) {
          await arc.hover({ force: true }).catch(() => {})
          await page.waitForTimeout(500)
          await target.screenshot({ path: path.join(OUT, `${route.theme}-${vp.name}-${colorScheme}-hover.png`) })
          console.log(`✓ ${route.theme}-${vp.name}-${colorScheme}-hover.png`)
        }
      }

      await context.close()
    }
  }
}

await browser.close()
console.log('done')
