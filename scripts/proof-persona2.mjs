// One-off proof capture for the Persona ("Arcade") menu rebuild — screenshots + measured gap table
// + scripted-scroll long-task counts, at 1440 and 390, light and dark. Not part of the app bundle;
// run manually against a live dev server: `node scripts/proof-persona2.mjs <baseUrl> <outDir>`.
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const base = process.argv[2] || 'http://localhost:4191'
const outDir = process.argv[3] || './proof'

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]
const SCREENS = ['', 'home', 'work', 'years', 'skills', 'contact']

async function setTheme(page, dark) {
  await page.evaluate((d) => {
    try {
      localStorage.setItem('persona-theme', d ? 'dark' : 'light')
    } catch {}
  }, dark)
}

async function measureGaps(page) {
  return page.evaluate(() => {
    const main = document.getElementById('main-content')
    if (!main) return []
    const nodes = Array.from(main.children)
    const rects = nodes.map((n) => ({ id: n.id || n.tagName, rect: n.getBoundingClientRect() }))
    const gaps = []
    for (let i = 1; i < rects.length; i++) {
      gaps.push({ from: rects[i - 1].id, to: rects[i].id, gap: Math.round(rects[i].rect.top - rects[i - 1].rect.bottom) })
    }
    return gaps
  })
}

async function measureLongTasks(page) {
  return page.evaluate(async () => {
    let longTasks = 0
    const obs = new PerformanceObserver((list) => {
      longTasks += list.getEntries().length
    })
    try {
      obs.observe({ entryTypes: ['longtask'] })
    } catch {
      return { longTasks: null }
    }
    const total = document.documentElement.scrollHeight - window.innerHeight
    const steps = 24
    for (let i = 0; i <= steps; i++) {
      window.scrollTo(0, Math.max(0, Math.round((total * i) / steps)))
      await new Promise((r) => setTimeout(r, 60))
    }
    await new Promise((r) => setTimeout(r, 200))
    obs.disconnect()
    return { longTasks }
  })
}

async function run() {
  await mkdir(outDir, { recursive: true })
  const browser = await chromium.launch()
  const report = { gaps: {}, longTasks: {} }

  for (const vp of VIEWPORTS) {
    for (const dark of [false, true]) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: dark ? 'dark' : 'light' })
      const page = await context.newPage()
      await page.goto(`${base}/arcade`, { waitUntil: 'networkidle' })
      await setTheme(page, dark)
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(500)

      const tag = `${vp.name}-${dark ? 'dark' : 'light'}`

      // Menu screen
      await page.screenshot({ path: path.join(outDir, `menu-${tag}.png`) })

      // Mid-wipe capture: click WORK in the bottom bar, screenshot ~120ms later.
      const workBtn = page.locator('nav[aria-label="Screen navigation"] button', { hasText: /work|trabajo|仕事/i })
      if (await workBtn.count()) {
        await workBtn.first().click()
        await page.waitForTimeout(120)
        await page.screenshot({ path: path.join(outDir, `wipe-${tag}.png`) })
        await page.waitForTimeout(500)
      }

      for (const screen of SCREENS) {
        if (screen === '') continue // already captured as menu-*
        await page.evaluate((h) => {
          window.location.hash = h ? `#${h}` : '#menu'
        }, screen)
        await page.waitForTimeout(700)
        await page.screenshot({ path: path.join(outDir, `${screen}-${tag}.png`), fullPage: true })

        if (!report.gaps[screen]) report.gaps[screen] = {}
        report.gaps[screen][tag] = await measureGaps(page)

        if (!report.longTasks[screen]) report.longTasks[screen] = {}
        const { longTasks } = await measureLongTasks(page)
        report.longTasks[screen][tag] = longTasks
      }

      await context.close()
    }
  }

  await browser.close()
  await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  console.log('Proof written to', outDir)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
