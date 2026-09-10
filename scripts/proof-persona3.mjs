// Proof capture for the Arcade (Persona) "deepen the Persona-evoking theme" lane (wt-persona3).
// Real Chromium via Playwright — screenshots per screen x viewport x theme x locale, mid-transition
// frames, a measured contrast table (real rendered pixels, not computed-style guesses), a scripted
// wheel-scroll long-task count per screen, and an image-size table for the new art.
//
// Usage: node scripts/proof-persona3.mjs [baseUrl] [outDir]
import { chromium } from 'playwright'
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CHROME = 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'
const base = process.argv[2] || 'http://localhost:4211'
const outDir = process.argv[3] || './proof'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]
const SCREENS = ['', 'home', 'work', 'years', 'skills', 'contact']
const LOCALES = ['en', 'es']

async function setLocale(page, locale) {
  await page.evaluate((l) => {
    try {
      localStorage.setItem('lang', l)
    } catch {}
  }, locale)
}
async function setTheme(page, dark) {
  await page.evaluate((d) => {
    try {
      localStorage.setItem('persona-theme', d ? 'dark' : 'light')
    } catch {}
  }, dark)
}

// PerformanceObserver must live in the page across the whole scroll — stash the count on `window`.
async function armLongTaskCounter(page) {
  await page.evaluate(() => {
    window.__ptLongTasks = 0
    const obs = new PerformanceObserver((list) => {
      window.__ptLongTasks += list.getEntries().length
    })
    try {
      obs.observe({ entryTypes: ['longtask'] })
    } catch {
      window.__ptLongTasks = null
    }
  })
}

async function wheelScrollAndCount(page) {
  await armLongTaskCounter(page)
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 220)
    await page.waitForTimeout(50)
  }
  await page.waitForTimeout(250)
  return page.evaluate(() => window.__ptLongTasks)
}

/** WCAG relative luminance + contrast ratio from two sRGB triples. */
function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const [rl, gl, bl] = [f(r), f(g), f(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}
function contrastRatio(a, b) {
  const la = luminance(a) + 0.05
  const lb = luminance(b) + 0.05
  return la > lb ? la / lb : lb / la
}

/** Reads the actual rendered RGB at (x,y) of a PNG buffer via a real Chromium canvas — the same
 *  technique scripts/png-to-webp.mjs uses, so the contrast table reflects real composited pixels
 *  (art + scrim), never an estimate from computed CSS alone. */
async function samplePixel(pixelPage, pngBuffer, x, y) {
  const dataUrl = 'data:image/png;base64,' + pngBuffer.toString('base64')
  return pixelPage.evaluate(
    async ({ dataUrl, x, y }) => {
      const img = new Image()
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
        img.src = dataUrl
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const cx = Math.max(0, Math.min(x, canvas.width - 1))
      const cy = Math.max(0, Math.min(y, canvas.height - 1))
      const d = ctx.getImageData(cx, cy, 1, 1).data
      return [d[0], d[1], d[2]]
    },
    { dataUrl, x, y },
  )
}

function parseRgb(str) {
  const m = str.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0]
}

async function measureHeadingContrast(page, pixelPage) {
  // Find the first visible heading (h1 or h2) whose ancestor section carries the backdrop art.
  const target = await page.evaluate(() => {
    const el = document.querySelector('main h1, main h2')
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return { x: Math.round(r.left + 4), y: Math.round(r.top + r.height / 2), color: cs.color }
  })
  if (!target) return null
  const shot = await page.screenshot()
  const bg = await samplePixel(pixelPage, shot, Math.max(0, target.x - 30), target.y)
  const fg = parseRgb(target.color)
  const ratio = contrastRatio(fg, bg)
  return { fg, bg, ratio: Math.round(ratio * 100) / 100 }
}

async function run() {
  await mkdir(outDir, { recursive: true })
  const browser = await chromium.launch({ executablePath: CHROME })
  const pixelPage = await (await browser.newContext()).newPage() // headless canvas sampler, never navigated to the app

  const report = { longTasks: {}, contrast: {}, consoleErrors: [], scrollWidth: {} }

  for (const vp of VIEWPORTS) {
    for (const dark of [false, true]) {
      for (const locale of LOCALES) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: dark ? 'dark' : 'light' })
        const page = await context.newPage()
        const errors = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text())
        })
        page.on('pageerror', (err) => errors.push(String(err)))

        await page.goto(`${base}/arcade`, { waitUntil: 'networkidle' })
        await setTheme(page, dark)
        await setLocale(page, locale)
        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForTimeout(500)

        const tag = `${vp.name}-${dark ? 'dark' : 'light'}-${locale}`

        // Menu screen
        await page.screenshot({ path: path.join(outDir, `menu-${tag}.png`) })

        // Mid-burst capture: click the second menu row, screenshot ~90ms later (burst + wipe overlap).
        const rows = page.locator('nav[aria-label="Choose a screen"] button')
        if ((await rows.count()) > 1) {
          await rows.nth(1).hover()
          await page.waitForTimeout(180) // let the selector trail fire once before confirming
          await rows.nth(1).click()
          await page.waitForTimeout(90)
          await page.screenshot({ path: path.join(outDir, `menu-burst-${tag}.png`) })
          await page.waitForTimeout(600)
        }

        for (const screen of SCREENS) {
          if (screen === '') continue
          await page.evaluate((h) => {
            window.location.hash = h ? `#${h}` : '#menu'
          }, screen)
          // Mid cut-in capture for the heading: the route wipe swaps displayRoute at 260ms and clears
          // at 560ms, so ~330ms lands just after the swap while the cut-in slab/title pop are running.
          if (screen !== 'home') {
            await page.waitForTimeout(330)
            await page.screenshot({ path: path.join(outDir, `${screen}-cutin-${tag}.png`) })
          }
          await page.waitForTimeout(700)
          await page.screenshot({ path: path.join(outDir, `${screen}-${tag}.png`), fullPage: true })

          if (locale === 'en') {
            const sw = await page.evaluate(() => document.documentElement.scrollWidth)
            report.scrollWidth[`${screen}-${tag}`] = sw

            // Contrast is measured with the heading still in its just-navigated (top-of-screen)
            // position — the wheel-scroll long-task test runs after and scrolls the page away.
            if (!report.contrast[screen]) report.contrast[screen] = {}
            report.contrast[screen][tag] = await measureHeadingContrast(page, pixelPage)

            const longTasks = await wheelScrollAndCount(page)
            if (!report.longTasks[screen]) report.longTasks[screen] = {}
            report.longTasks[screen][tag] = longTasks
            await page.evaluate(() => window.scrollTo(0, 0))
          }
        }

        if (errors.length) report.consoleErrors.push({ tag, errors })
        await context.close()
      }
    }
  }

  await browser.close()

  // Image-size table for the committed art.
  const artDir = path.resolve(__dirname, '..', 'public', 'art', 'arcade')
  const files = (await readdir(artDir)).filter((f) => f.endsWith('.webp'))
  const sizes = {}
  for (const f of files) sizes[f] = (await stat(path.join(artDir, f))).size
  report.imageSizes = sizes

  await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  console.log('Proof written to', outDir)
  console.log(JSON.stringify(report, null, 2))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
