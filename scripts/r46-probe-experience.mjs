// Round 46 lane "experience" probe — proves MetricsAlive ("Métricas vivas", ?proposal=experience-a
// from round 44, now the Experience section's only implementation) on the Apple page at 1440/390,
// light/dark, zero console errors, no horizontal overflow. Run against `bunx vite preview` (see
// r46-probe cwd instructions).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.PROBE_BASE || 'http://localhost:4390'
const OUT =
  process.env.PROBE_OUT ||
  'C:/Users/Usuario/AppData/Local/Temp/claude/C--Users-Usuario-Desktop-P-Github-Digitdeck/75fa9a07-350d-4734-9d2e-ac255cc6dd8f/scratchpad/r46/experience'
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]
const MODES = ['light', 'dark']

// digitdeck-cto (registry.experience[0], the default role on mount) has 6 "what shipped" bullets —
// SHOWN_BULLETS=3 in MetricsAlive.tsx, so 3 stay hidden behind the showMore toggle on first render.
const DEFAULT_ROLE_METRIC_COUNT = 3
const DEFAULT_ROLE_HIDDEN_BULLETS = 3
// The first metric card for the default role: { id: 'storefronts', value: '18+' } — a plain count,
// so CountUp's final text is exactly "18+" (no locale grouping at this magnitude). Used to prove
// reduced motion shows the final value immediately instead of animating from 0.
const DEFAULT_ROLE_FIRST_METRIC_TEXT = '18+'

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
    // Headless Chromium can throttle/pause requestAnimationFrame on a backgrounded tab; with several
    // contexts opened sequentially in one browser process, a newly created page can start out of
    // focus and freeze CountUp mid-count. Force it to the foreground so the animation actually runs.
    await page.bringToFront()
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => pageErrors.push(String(err)))

    // Apple.tsx's ThemeProvider defaults to LIGHT regardless of OS preference (`defaultTheme="light"`).
    // The real toggle is the nav's moon/sun button, which persists to localStorage['apple-theme'] —
    // reproduce that exactly instead of trusting prefers-color-scheme.
    if (mode === 'dark') {
      await page.addInitScript(() => localStorage.setItem('apple-theme', 'dark'))
    }

    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForSelector('#experience', { state: 'attached', timeout: 15000 })

    const isDarkApplied = await page.evaluate(() => document.querySelector('main')?.parentElement?.className.includes('bg-apple-dark'))
    if (mode === 'dark' && !isDarkApplied) failures.push(`${vp.name}/${mode}: dark theme did not apply (bg-apple-dark class missing after forcing localStorage['apple-theme']='dark')`)
    if (mode === 'light' && isDarkApplied) failures.push(`${vp.name}/${mode}: dark theme leaked into a light run`)

    const experience = page.locator('#experience')
    await experience.scrollIntoViewIfNeeded()

    // Role rail: 7 tabs (registry.experience), one active with aria-selected="true".
    const tabs = experience.locator('[role="tab"]')
    const tabCount = await tabs.count()
    if (tabCount !== 7) failures.push(`${vp.name}/${mode}: expected 7 role tabs, found ${tabCount}`)
    const selectedCount = await experience.locator('[role="tab"][aria-selected="true"]').count()
    if (selectedCount !== 1) failures.push(`${vp.name}/${mode}: expected exactly 1 selected role tab, found ${selectedCount}`)

    // Default role (digitdeck-cto): 3 metric cards, first one a "count" kind (CountUp'd, no ring/bar).
    // The slowest card (i=2) starts at delay 0.16s and animates for 0.9s — wait comfortably past that.
    await page.waitForTimeout(1500)
    const cardCount = await experience.locator('.mt-7.grid.grid-cols-2 > div').count()
    if (cardCount !== DEFAULT_ROLE_METRIC_COUNT) failures.push(`${vp.name}/${mode}: expected ${DEFAULT_ROLE_METRIC_COUNT} metric cards for the default role, found ${cardCount}`)

    const firstNumeral = (await experience.locator('.mt-7.grid.grid-cols-2 > div').first().locator('p.tabular-nums').first().textContent())?.trim()
    if (firstNumeral !== DEFAULT_ROLE_FIRST_METRIC_TEXT) failures.push(`${vp.name}/${mode}: default role's first metric card reads "${firstNumeral}", expected "${DEFAULT_ROLE_FIRST_METRIC_TEXT}"`)

    // "What shipped" expand toggle: digitdeck-cto has 6 bullets, 3 shown + a "+3 more" button.
    const shownBullets = await experience.locator('ul > li').count()
    if (shownBullets !== 3) failures.push(`${vp.name}/${mode}: expected 3 always-shown bullets before expanding, found ${shownBullets}`)
    const expandBtn = experience.locator('button[aria-controls="experience-a-shipped-extra"]')
    const expandBtnVisible = await expandBtn.isVisible().catch(() => false)
    if (!expandBtnVisible) {
      failures.push(`${vp.name}/${mode}: showMore button not found for the default role (expected ${DEFAULT_ROLE_HIDDEN_BULLETS} hidden bullets)`)
    } else {
      const expandedBefore = await expandBtn.getAttribute('aria-expanded')
      if (expandedBefore !== 'false') failures.push(`${vp.name}/${mode}: showMore button should start collapsed (aria-expanded="false"), got "${expandedBefore}"`)
      await expandBtn.click()
      await page.waitForTimeout(700) // house { bounce: 0, duration: 0.6 } expand spring
      const expandedAfter = await expandBtn.getAttribute('aria-expanded')
      if (expandedAfter !== 'true') failures.push(`${vp.name}/${mode}: showMore click did not set aria-expanded="true"`)
      const extraItems = await page.locator('#experience-a-shipped-extra li').count()
      if (extraItems !== DEFAULT_ROLE_HIDDEN_BULLETS) failures.push(`${vp.name}/${mode}: expanded panel shows ${extraItems} bullets, expected ${DEFAULT_ROLE_HIDDEN_BULLETS}`)
      // collapse back so later assertions (role switch) start from a known state
      await expandBtn.click()
      await page.waitForTimeout(400)
    }

    // Role switching survives without remounting the metric grid — click role 'rh' (index 3), the
    // one Lighthouse "arrow" metric (70→95+ → the ring), and confirm the panel actually updated.
    // The heading text is locale-dependent (navigator.language picks es/en/ja), so this compares it
    // against the default role's own heading rather than hard-coding an English string.
    const initialHeading = (await experience.locator('h3').first().textContent())?.trim()
    const rhTab = experience.locator('[data-role="rh"]')
    const rhTabExists = (await rhTab.count()) > 0
    if (!rhTabExists) {
      failures.push(`${vp.name}/${mode}: role tab 'rh' not found`)
    } else {
      await rhTab.click()
      await page.waitForTimeout(600)
      const rhSelected = await rhTab.getAttribute('aria-selected')
      if (rhSelected !== 'true') failures.push(`${vp.name}/${mode}: clicking the 'rh' tab did not select it`)
      const heading = (await experience.locator('h3').first().textContent())?.trim()
      if (!heading || heading === initialHeading) failures.push(`${vp.name}/${mode}: panel heading did not change after switching to 'rh' (still "${heading}")`)
      const rhCardCount = await experience.locator('.mt-7.grid.grid-cols-2 > div').count()
      if (rhCardCount !== 3) failures.push(`${vp.name}/${mode}: expected 3 metric cards for 'rh', found ${rhCardCount}`)
      // Switch back to the default role for a consistent screenshot. This click restarts each
      // surviving MetricCard's CountUp from 'rh's values toward digitdeck-cto's (the whole point of
      // keying cards by grid position, not metric id — ticks instead of remounting) — wait past its
      // slowest card's delay+duration (0.16s + 0.9s) so the screenshot shows settled numbers.
      const defaultTab = experience.locator('[data-role="digitdeck-cto"]')
      await defaultTab.click()
      await page.waitForTimeout(1500)
    }

    // No horizontal overflow anywhere on the page.
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth }
    })
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      failures.push(`${vp.name}/${mode}: horizontal overflow — scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`)
    }

    const experienceShot = `${OUT}/experience-${vp.name}-${mode}.png`
    await experience.screenshot({ path: experienceShot })
    shots.push(experienceShot)

    const fullShot = `${OUT}/full-${vp.name}-${mode}.png`
    await page.screenshot({ path: fullShot, fullPage: true })
    shots.push(fullShot)

    if (consoleErrors.length) failures.push(`${vp.name}/${mode}: console errors: ${JSON.stringify(consoleErrors)}`)
    if (pageErrors.length) failures.push(`${vp.name}/${mode}: page errors: ${JSON.stringify(pageErrors)}`)

    await context.close()
  }
}

// Reduced motion: CountUp must show the final value immediately (useMotionValue seeded with `value`,
// no animate() call) instead of animating from 0 — checked well before the normal 0.9s CountUp
// duration would otherwise finish, at 1440/light.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.bringToFront()
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('#experience', { state: 'attached', timeout: 15000 })
  const experience = page.locator('#experience')
  await experience.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150) // well under the 0.9s CountUp duration and 0.8s ring/bar draw-ins
  const numeralUnderReducedMotion = (await experience.locator('.mt-7.grid.grid-cols-2 > div').first().locator('p.tabular-nums').first().textContent())?.trim()
  if (numeralUnderReducedMotion !== DEFAULT_ROLE_FIRST_METRIC_TEXT) {
    failures.push(`reduced-motion: metric card read "${numeralUnderReducedMotion}" at 150ms, expected the final value "${DEFAULT_ROLE_FIRST_METRIC_TEXT}" to render immediately`)
  }
  const reducedMotionShot = `${OUT}/experience-reduced-motion.png`
  await experience.screenshot({ path: reducedMotionShot })
  shots.push(reducedMotionShot)
  if (consoleErrors.length) failures.push(`reduced-motion: console errors: ${JSON.stringify(consoleErrors)}`)
  await context.close()
}

await browser.close()

console.log('SHOTS:')
shots.forEach((s) => console.log(' ', s))

if (failures.length) {
  console.log('\nFAIL — ' + failures.length + ' issue(s):')
  failures.forEach((f) => console.log(' -', f))
  process.exit(1)
} else {
  console.log('\nPASS — 4/4 viewport×mode combinations clean (0 console errors, 0 overflow, 7 role tabs, 3 metric cards, showMore toggle works, role switching updates the panel) + reduced motion shows final values immediately.')
}
