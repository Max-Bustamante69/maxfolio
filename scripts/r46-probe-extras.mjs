// Round 46 lane "extras" probe — proves EngagementModels (models-b) + Process pinnedRail
// (process-a) on the Apple page at 1440/390, light/dark, zero console errors, no horizontal
// overflow. Run against `bunx vite preview` (see r46-probe cwd instructions).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.PROBE_BASE || 'http://localhost:4351'
const OUT = process.env.PROBE_OUT || 'C:/Users/Usuario/AppData/Local/Temp/claude/C--Users-Usuario-Desktop-P-Github-Digitdeck/75fa9a07-350d-4734-9d2e-ac255cc6dd8f/scratchpad/r44/r46/extras'
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]
const MODES = ['light', 'dark']

let failures = []
let shots = []

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  for (const mode of MODES) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: mode,
    })
    const page = await context.newPage()
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => pageErrors.push(String(err)))

    // Apple.tsx's ThemeProvider defaults to LIGHT regardless of OS preference (`defaultTheme="light"`
    // — a real house behavior, not a probe bug: verified live by reading src/pages/Apple.tsx and by
    // matchMedia() correctly reporting `dark` while the page still rendered light). The real toggle
    // is the nav's moon/sun button, which persists to localStorage['apple-theme'] — reproduce that
    // exactly instead of trusting prefers-color-scheme.
    if (mode === 'dark') {
      await page.addInitScript(() => localStorage.setItem('apple-theme', 'dark'))
    }

    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForSelector('#engagement', { state: 'attached', timeout: 15000 })

    const isDarkApplied = await page.evaluate(() => document.querySelector('main')?.parentElement?.className.includes('bg-apple-dark'))
    if (mode === 'dark' && !isDarkApplied) failures.push(`${vp.name}/${mode}: dark theme did not apply (bg-apple-dark class missing after forcing localStorage['apple-theme']='dark')`)
    if (mode === 'light' && isDarkApplied) failures.push(`${vp.name}/${mode}: dark theme leaked into a light run`)

    // Scroll to the engagement section and assert it rendered three cards with real copy (not the
    // struck-through contrarian pattern — no <s>/line-through decoration class should remain).
    const engagement = page.locator('#engagement')
    await engagement.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400) // let the whileInView cards settle
    const cardCount = await engagement.locator('li').count()
    if (cardCount !== 3) failures.push(`${vp.name}/${mode}: expected 3 engagement cards, found ${cardCount}`)

    const struckThrough = await engagement.locator('.line-through').count()
    if (struckThrough !== 0) failures.push(`${vp.name}/${mode}: found ${struckThrough} line-through elements — the banned contrarian pattern is still present`)

    const cardTitles = await engagement.locator('li h3').allTextContents()
    const cardBodies = await engagement.locator('li p').allTextContents()
    if (cardTitles.length !== 3 || cardBodies.some((b) => !b.trim())) {
      failures.push(`${vp.name}/${mode}: engagement cards missing title/body text — titles=${JSON.stringify(cardTitles)}`)
    }

    // No horizontal overflow anywhere on the page.
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth }
    })
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      failures.push(`${vp.name}/${mode}: horizontal overflow — scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`)
    }

    const engagementShot = `${OUT}/engagement-${vp.name}-${mode}.png`
    await engagement.screenshot({ path: engagementShot })
    shots.push(engagementShot)

    // Process pinned rail — mobile only (390). Scroll to the Process section and check the rail.
    if (vp.width < 768) {
      const process = page.locator('#process')
      await process.scrollIntoViewIfNeeded()
      // Scroll a bit further into the section body (past the top) so the IntersectionObserver flips
      // the rail to visible — scrollIntoViewIfNeeded lands at the very top edge of the section.
      await page.mouse.wheel(0, 300)
      await page.waitForTimeout(500)
      const rail = page.locator('#process > div.fixed').first()
      const railOpacity = await rail.evaluate((el) => getComputedStyle(el).opacity)
      if (railOpacity !== '1') failures.push(`${vp.name}/${mode}: process pinned rail did not become visible (opacity=${railOpacity})`)
      const dotCount = await rail.locator('button').count()
      if (dotCount !== 5) failures.push(`${vp.name}/${mode}: process rail expected 5 step dots, found ${dotCount}`)

      // Regression guard: ScrollRail's own site-wide 2px scroll-progress bar is ALSO fixed at
      // `top-11 z-40 lg:hidden` (src/components/common/ScrollRail.tsx) — it must not draw across
      // this rail's top edge. Caught once in round-46 "extras" QA as a stray blue sliver over the
      // dot row; the fix moved this rail to `top-[46px]`, clearing that bar entirely.
      const overlap = await page.evaluate(() => {
        const r = document.querySelector('#process > div.fixed')
        const bar = document.querySelector('.fixed.left-0.top-11')
        if (!r || !bar) return null
        const rr = r.getBoundingClientRect()
        const br = bar.getBoundingClientRect()
        return { railTop: rr.top, barBottom: br.top + br.height }
      })
      if (overlap && overlap.railTop < overlap.barBottom) {
        failures.push(`${vp.name}/${mode}: process pinned rail (top=${overlap.railTop}) overlaps ScrollRail's progress bar (bottom=${overlap.barBottom})`)
      }

      // Tap the 3rd dot and confirm `active` moved (aria-current appears on that button).
      if (dotCount === 5) {
        await rail.locator('button').nth(2).click()
        await page.waitForTimeout(400)
        const current = await rail.locator('button[aria-current="step"]').count()
        if (current !== 1) failures.push(`${vp.name}/${mode}: tapping a rail dot did not set aria-current`)
      }

      const railShot = `${OUT}/process-rail-${vp.name}-${mode}.png`
      await page.screenshot({ path: railShot })
      shots.push(railShot)
    } else {
      // Desktop: confirm the rail markup is entirely ABSENT (pinnedRail is mobile-only via lg:hidden,
      // but also confirm no dangling ?proposal= affordance / no desktop regression).
      const desktopRailVisible = await page.locator('#process > div.fixed').first().isVisible().catch(() => false)
      if (desktopRailVisible) failures.push(`${vp.name}/${mode}: pinned rail visible on desktop viewport (should be lg:hidden)`)
    }

    // Full-page shot for the visual record.
    const fullShot = `${OUT}/full-${vp.name}-${mode}.png`
    await page.screenshot({ path: fullShot, fullPage: true })
    shots.push(fullShot)

    if (consoleErrors.length) failures.push(`${vp.name}/${mode}: console errors: ${JSON.stringify(consoleErrors)}`)
    if (pageErrors.length) failures.push(`${vp.name}/${mode}: page errors: ${JSON.stringify(pageErrors)}`)

    await context.close()
  }
}

await browser.close()

console.log('SHOTS:')
shots.forEach((s) => console.log(' ', s))

if (failures.length) {
  console.log('\nFAIL — ' + failures.length + ' issue(s):')
  failures.forEach((f) => console.log(' -', f))
  process.exit(1)
} else {
  console.log('\nPASS — 4/4 viewport×mode combinations clean (0 console errors, 0 overflow, 3 engagement cards, no line-through, rail 5/5 dots on mobile, tap works).')
}
