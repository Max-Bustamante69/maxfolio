// Proof capture for the skill-panel rebuild (Skills.tsx / SkillsSunburst.tsx / SkillPanel.tsx).
// node scripts/capture-skillpanel-proof.mjs <baseUrl> <outDir>
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [baseUrl = 'http://localhost:4213', outDir = 'proof-skillspanel'] = process.argv.slice(2)
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.resolve(outDir)
await mkdir(OUT, { recursive: true })

const CHROME = 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'

const ROUTES = [
  { theme: 'apple', path: '/', storageKey: 'apple-theme' },
  { theme: 'luxury', path: '/luxury', storageKey: 'luxury-theme' },
  { theme: 'brutalist', path: '/brutalist', storageKey: 'brutalist-theme' },
  { theme: 'neo', path: '/neo', storageKey: 'neo-theme' },
]
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 1400 },
  { name: '390', width: 390, height: 1600 },
]

let browser
try {
  browser = await chromium.launch({ executablePath: CHROME })
} catch {
  browser = await chromium.launch()
}

const consoleErrors = []
const contrastRows = []
const only = process.env.THEME_FILTER?.split(',')

for (const route of ROUTES) {
  if (only && !only.includes(route.theme)) continue
  for (const vp of VIEWPORTS) {
    for (const colorScheme of ['light', 'dark']) {
      for (const locale of ['en', 'es']) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme, deviceScaleFactor: vp.name === '390' ? 2 : 1 })
        const page = await context.newPage()
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(`${route.theme}/${vp.name}/${colorScheme}/${locale}: ${msg.text()}`)
        })
        const url = `${baseUrl}${route.path}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
        await page.evaluate(
          ({ key, scheme, lang }) => {
            try {
              localStorage.setItem(key, scheme)
              localStorage.setItem('lang', lang)
            } catch {
              /* ignore */
            }
          },
          { key: route.storageKey, scheme: colorScheme, lang: locale },
        )
        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForTimeout(500)

        const tag = `${route.theme}-${vp.name}-${colorScheme}-${locale}`
        const target = page.locator('#skills').first()
        await target.scrollIntoViewIfNeeded()
        await page.waitForTimeout(1600) // scroll-reveal / arc draw-in / count-up

        // scrollWidth check (only meaningful once per viewport/theme, but cheap enough to run every time)
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        if (scrollWidth > vp.width) consoleErrors.push(`${tag}: horizontal overflow, scrollWidth=${scrollWidth} > ${vp.width}`)

        // 1. default (nothing hovered/locked)
        await target.screenshot({ path: path.join(OUT, `${tag}-default.png`) })

        if (vp.name === '1440') {
          // 2. hover a ring-2 (tool) arc
          const arc = target.locator('svg [role="button"]').nth(9)
          if (await arc.count()) {
            const box = await arc.boundingBox()
            if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.waitForTimeout(400)
            await target.screenshot({ path: path.join(OUT, `${tag}-hover.png`) })

            // 3. click to lock, then move mouse away — panel/pinned chip must persist
            await arc.click({ force: true })
            await page.mouse.move(20, 20)
            await page.waitForTimeout(400)
            await target.screenshot({ path: path.join(OUT, `${tag}-locked.png`) })

            // 4. keyboard path: focus an arc directly (real Tab order is exercised separately in the
            //    a11y pass — this proves OUR component's Enter-locks/Esc-unlocks contract), then walk
            //    Tab forward from there to prove focus really moves through the ring afterward.
            await page.reload({ waitUntil: 'networkidle' })
            await target.scrollIntoViewIfNeeded()
            await page.waitForTimeout(1200)
            const kbdArc = target.locator('svg [role="button"]').nth(9)
            await kbdArc.focus()
            const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || '')
            if (focused) {
              await page.keyboard.press('Enter')
              await page.waitForTimeout(350)
              await target.screenshot({ path: path.join(OUT, `${tag}-kbd-enter-locked.png`) })
              await page.keyboard.press('Tab')
              const nextFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || '')
              if (!nextFocused || nextFocused === focused) consoleErrors.push(`${tag}: Tab did not move focus off the locked arc`)
              await page.keyboard.press('Escape')
              await page.waitForTimeout(350)
              await target.screenshot({ path: path.join(OUT, `${tag}-kbd-esc-unlocked.png`) })
            } else {
              consoleErrors.push(`${tag}: keyboard path — arc did not accept focus`)
            }
          }
        } else {
          // mobile: tap a legend chip to lock, then verify the inline panel below shows it
          const chip = target.locator('button[aria-pressed]').nth(1)
          if (await chip.count()) {
            await chip.click()
            await page.waitForTimeout(400)
            await target.screenshot({ path: path.join(OUT, `${tag}-locked.png`) })
          }
        }

        // contrast sample: compute effective text color vs panel background for the panel title
        const sample = await page.evaluate(() => {
          const panel = document.querySelector('#skills [aria-live="polite"].flex.h-full') || document.querySelector('#skills .flex.h-full')
          if (!panel) return null
          const title = panel.querySelector('p.mt-3, p.text-2xl')
          if (!title) return null
          const cs = getComputedStyle(title)
          const bg = getComputedStyle(panel).backgroundColor
          return { color: cs.color, backgroundColor: bg }
        })
        if (sample) contrastRows.push({ tag, ...sample })

        await context.close()
      }
    }
  }
}

await browser.close()

await writeFile(path.join(OUT, 'console-errors.json'), JSON.stringify(consoleErrors, null, 2))
await writeFile(path.join(OUT, 'contrast-samples.json'), JSON.stringify(contrastRows, null, 2))
console.log(`console errors: ${consoleErrors.length}`)
if (consoleErrors.length) console.log(consoleErrors.join('\n'))
console.log(`wrote ${OUT}`)
