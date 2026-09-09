#!/usr/bin/env node
/**
 * qa-pages.mjs — behavioral QA harness for every switchable design (Apple, Neo, Arcade/Persona,
 * Luxury, Brutalist) plus the /menu page. Real Chromium via Playwright, real wheel/touch input,
 * real PerformanceObserver longtask counts — no synthetic scrollTo() shortcuts.
 *
 * Checks (see AGENTS task):
 *   (a) scroll stalls (wheel @1440/390, touch-drag @390) + longtask count
 *   (b) giant blank gaps between sections / oversized empty elements
 *   (c) sticky elements actually stick + the Process readout numeral/title/"Step n of N" agree
 *   (d) horizontal overflow @390
 *   (e) console errors
 *   (f) overlaps between fixed-position chrome (rail, FAB, bottom bars)
 *   (g) dark mode toggle per theme
 *   (h) theme switcher reachability, including Apple from a visitor pinned to neo (mf_v cookie)
 *
 * Usage: node scripts/qa-pages.mjs [--base http://localhost:4193] [--out <dir>]
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const BASE = flag('base', 'http://localhost:4193')
// Default output lives outside the repo (screenshots + JSON aren't meant to be committed); pass --out
// to point it elsewhere. This default path is this run's scratchpad — override it on a future rerun.
const OUT = resolve(flag('out', 'C:/Users/Usuario/AppData/Local/Temp/claude/C--Users-Usuario-Desktop-P-Github-Digitdeck/75fa9a07-350d-4734-9d2e-ac255cc6dd8f/scratchpad/proof-qa'))
mkdirSync(OUT, { recursive: true })

// route -> theme root class (for assertions + reporting)
const ROUTES = [
  { path: '/', theme: 'apple', label: 'Apple (/)' },
  { path: '/neo', theme: 'neo', label: 'Neo (/neo)' },
  { path: '/arcade', theme: 'persona', label: 'Arcade (/arcade)', arcade: true },
  { path: '/luxury', theme: 'luxury', label: 'Luxury (/luxury)' },
  { path: '/brutalist', theme: 'brutalist', label: 'Brutalist (/brutalist)' },
  { path: '/menu', theme: 'menu', label: 'Menu (/menu)' },
]

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }
const GAP_LIMIT_DESKTOP = 180
const GAP_LIMIT_MOBILE = 140
const STALL_WINDOW_MS = 600
const SAMPLE_MS = 100

const results = []
const log = (...a) => console.log(...a)

/** Injected before any page script runs: counts long tasks via PerformanceObserver. */
const LONGTASK_INIT = `
  window.__longtasks = [];
  try {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__longtasks.push({ start: e.startTime, dur: e.duration });
    });
    po.observe({ type: 'longtask', buffered: true });
  } catch (e) { window.__longtaskError = String(e); }
`

async function collectConsoleErrors(page) {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push('pageerror: ' + String(err)))
  return errors
}

/** Drives a real wheel scroll (many small ticks) while sampling scrollY + rAF-driven wall clock. */
async function wheelScrollStallTest(page, { steps = 60, dx = 0, dy = 220, intervalMs = 80 } = {}) {
  await page.evaluate(() => {
    window.__scrollSamples = []
    window.__sampleTimer = setInterval(() => {
      window.__scrollSamples.push({ t: performance.now(), y: window.scrollY })
    }, 100)
  })
  const cx = DESKTOP.width / 2
  const cy = DESKTOP.height / 2
  for (let i = 0; i < steps; i++) {
    await page.mouse.move(cx, cy)
    await page.mouse.wheel(dx, dy)
    await page.waitForTimeout(intervalMs)
  }
  await page.waitForTimeout(300)
  const samples = await page.evaluate(() => {
    clearInterval(window.__sampleTimer)
    return window.__scrollSamples
  })
  const maxScrollY = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  return analyzeStalls(samples, maxScrollY)
}

/** Simulates a touch drag scroll on mobile viewport via CDP touch input (Playwright's touchscreen). */
async function touchScrollStallTest(page, { swipes = 20, dy = 260, intervalMs = 120 } = {}) {
  await page.evaluate(() => {
    window.__scrollSamples = []
    window.__sampleTimer = setInterval(() => {
      window.__scrollSamples.push({ t: performance.now(), y: window.scrollY })
    }, 100)
  })
  const cx = MOBILE.width / 2
  for (let i = 0; i < swipes; i++) {
    const startY = MOBILE.height * 0.75
    const endY = MOBILE.height * 0.25
    await page.touchscreen.tap(cx, startY).catch(() => {})
    // Playwright's touchscreen has no native drag primitive; emulate via CDP Input.dispatchTouchEvent through mouse-like sequence
    await page.evaluate(
      ({ cx, startY, endY }) => {
        const target = document.elementFromPoint(cx, startY) || document.body
        // Lenis (and other touch listeners) read `event.targetTouches[0]` — the TouchEventInit spec
        // defaults targetTouches to `[]` (truthy!) when omitted, so `targetTouches[0]` silently becomes
        // `undefined` and any `const { clientX } = event.targetTouches[0]` throws. Real touches always
        // populate targetTouches, so the synthetic event must too, on every phase including touchend
        // (a real touchend still reports the lifting touch in changedTouches, and most libs read that).
        const mk = (type, y) => {
          const t = new Touch({ identifier: 1, target, clientX: cx, clientY: y })
          const list = type === 'touchend' ? [] : [t]
          return new TouchEvent(type, { bubbles: true, cancelable: true, touches: list, targetTouches: list, changedTouches: [t] })
        }
        target.dispatchEvent(mk('touchstart', startY))
        const steps = 6
        for (let s = 1; s <= steps; s++) {
          const y = startY + ((endY - startY) * s) / steps
          target.dispatchEvent(mk('touchmove', y))
          window.scrollBy(0, (startY - endY) / steps)
        }
        target.dispatchEvent(mk('touchend', endY))
      },
      { cx, startY, endY },
    )
    await page.waitForTimeout(intervalMs)
  }
  await page.waitForTimeout(300)
  const samples = await page.evaluate(() => {
    clearInterval(window.__sampleTimer)
    return window.__scrollSamples
  })
  const maxScrollY = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  return analyzeStalls(samples, maxScrollY)
}

function analyzeStalls(samples, maxScrollY = Infinity) {
  const stalls = []
  if (samples.length < 3) return { stalls, samples }
  const first = samples[0].y
  const last = samples[samples.length - 1].y
  const totalDelta = Math.abs(last - first)
  const CLAMP_EPS = 4 // px tolerance for "already at the top/bottom of the document"
  for (let i = 0; i < samples.length; i++) {
    const t0 = samples[i].t
    let j = i
    while (j < samples.length - 1 && samples[j + 1].t - t0 < STALL_WINDOW_MS) j++
    if (samples[j].t - t0 >= STALL_WINDOW_MS - SAMPLE_MS) {
      const dy = Math.abs(samples[j].y - samples[i].y)
      const atTop = samples[i].y <= CLAMP_EPS
      const atBottom = samples[i].y >= maxScrollY - CLAMP_EPS
      // Only a real stall if we were not already pinned at the top/bottom by the document's own
      // natural scroll clamp — continued wheel/touch input there can never move scrollY further,
      // and that's correct behavior, not jank.
      if (dy < 2 && !atTop && !atBottom) {
        stalls.push({ atMs: Math.round(t0), windowMs: Math.round(samples[j].t - t0), y: samples[i].y })
      }
    }
  }
  // collapse consecutive overlapping stall windows into ranges
  const merged = []
  for (const s of stalls) {
    const prev = merged[merged.length - 1]
    if (prev && s.atMs - prev.end <= 100) {
      prev.end = s.atMs + s.windowMs
    } else {
      merged.push({ start: s.atMs, end: s.atMs + s.windowMs, y: s.y })
    }
  }
  return { stalls: merged, totalScrolled: totalDelta, sampleCount: samples.length }
}

/** Gap detector: last visible text/img bottom of section A vs first visible text/img top of section B. */
async function findGaps(page, limit) {
  return page.evaluate((limit) => {
    function isVisible(el) {
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return false
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false
      return true
    }
    function hasOwnText(el) {
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) return true
      }
      return false
    }
    // "content nodes": leaf-ish elements carrying their own visible text, or media
    const MEDIA = new Set(['IMG', 'SVG', 'CANVAS', 'VIDEO', 'PICTURE'])
    const all = Array.from(document.querySelectorAll('body *'))
    const contentNodes = all.filter((el) => {
      if (!isVisible(el)) return false
      if (MEDIA.has(el.tagName)) return true
      return hasOwnText(el)
    })
    // Sections: prefer <section>, else direct children of <main>, else direct children of #root's first div
    let sectionEls = Array.from(document.querySelectorAll('section'))
    if (sectionEls.length < 2) {
      const main = document.querySelector('main') || document.getElementById('root')?.firstElementChild
      if (main) sectionEls = Array.from(main.children).filter((el) => isVisible(el))
    }
    sectionEls = sectionEls.filter(isVisible).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)

    const scrollY = window.scrollY
    const out = []
    for (let i = 0; i < sectionEls.length - 1; i++) {
      const A = sectionEls[i]
      const B = sectionEls[i + 1]
      const aRect = A.getBoundingClientRect()
      const bRect = B.getBoundingClientRect()
      if (bRect.top < aRect.top) continue // not actually stacked vertically (grid siblings etc.)
      const aContent = contentNodes.filter((n) => A.contains(n))
      const bContent = contentNodes.filter((n) => B.contains(n))
      const aBottom = aContent.length ? Math.max(...aContent.map((n) => n.getBoundingClientRect().bottom)) : aRect.bottom
      const bTop = bContent.length ? Math.min(...bContent.map((n) => n.getBoundingClientRect().top)) : bRect.top
      const gap = bTop - aBottom
      if (gap > limit) {
        out.push({
          gapPx: Math.round(gap),
          aId: A.id || A.className?.toString().slice(0, 60) || A.tagName,
          bId: B.id || B.className?.toString().slice(0, 60) || B.tagName,
          aBottomDoc: Math.round(aBottom + scrollY),
          bTopDoc: Math.round(bTop + scrollY),
        })
      }
    }
    return out
  }, limit)
}

/** Oversized-empty-element detector: height > 1.5x viewport, no visible text/media inside. */
async function findOversizedEmpty(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight
    function isVisible(el) {
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return false
      const cs = getComputedStyle(el)
      return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) !== 0
    }
    const MEDIA = new Set(['IMG', 'SVG', 'CANVAS', 'VIDEO', 'PICTURE'])
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      if (!isVisible(el)) continue
      const r = el.getBoundingClientRect()
      if (r.height < vh * 1.5) continue
      if (r.width < 40) continue // a thin decorative rail/line (e.g. the Process scroll-progress spine) isn't a "blank space"
      // does it have its own visible text or media anywhere inside, excluding aria-hidden decorations?
      const hasContent = el.querySelector('img, svg:not([aria-hidden="true"]), canvas, video') || (el.innerText && el.innerText.trim().length > 0)
      if (hasContent) continue
      // skip ancestors that just wrap smaller real content (only leaf-ish oversized wrappers matter);
      // require this element to have no children with height >= 90% of its own (i.e. it IS the blank space, not a container of one)
      const bigChild = Array.from(el.children).some((c) => {
        const cr = c.getBoundingClientRect()
        return cr.height >= r.height * 0.9
      })
      if (bigChild) continue
      out.push({
        tag: el.tagName,
        id: el.id || '',
        cls: el.className?.toString().slice(0, 80) || '',
        heightPx: Math.round(r.height),
        viewportH: vh,
        topDoc: Math.round(r.top + window.scrollY),
      })
    }
    return out
  })
}

/** Checks every position:sticky element actually holds its viewport-top across 3 scroll positions inside its stacking context. */
async function checkSticky(page) {
  const stickies = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('*').forEach((el, i) => {
      const cs = getComputedStyle(el)
      if (cs.position === 'sticky') {
        el.setAttribute('data-qa-sticky-id', String(i))
        out.push({ id: String(i), selector: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.toString().split(' ').slice(0, 2).join('.') : '') })
      }
    })
    return out
  })
  const findings = []
  for (const s of stickies) {
    // scroll the whole page through a range and sample this element's top 3 times
    const tops = []
    const positions = [0.1, 0.4, 0.7]
    for (const frac of positions) {
      await page.evaluate((frac) => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo(0, Math.max(0, max * frac))
      }, frac)
      await page.waitForTimeout(250)
      const top = await page.evaluate((id) => {
        const el = document.querySelector(`[data-qa-sticky-id="${id}"]`)
        if (!el) return null
        const r = el.getBoundingClientRect()
        // is it currently within its scrolling ancestor's bounds (i.e. actually "engaged")?
        return r.top
      }, s.id)
      tops.push(top)
    }
    const valid = tops.filter((t) => t !== null)
    // A sticky element that is meant to pin should show the SAME top across positions where it's engaged.
    // Flag only if it's onscreen (top between -50..viewport) in at least 2 samples yet the tops disagree by > 4px.
    const engaged = valid.filter((t) => t > -50 && t < 900)
    const spread = engaged.length ? Math.max(...engaged) - Math.min(...engaged) : 0
    if (engaged.length >= 2 && spread > 4) {
      findings.push({ selector: s.selector, tops, spreadPx: Math.round(spread) })
    }
  }
  return findings
}

/** Process readout: numeral, "Step n of N", and title must always name the same step. */
async function checkProcessReadout(page) {
  const has = await page.$('#process')
  if (!has) return { present: false, mismatches: [] }
  await page.evaluate(() => {
    const el = document.getElementById('process')
    el?.scrollIntoView({ block: 'start' })
  })
  const mismatches = []
  const stepTitles = await page.evaluate(() => {
    const ol = document.querySelector('#process ol')
    if (!ol) return []
    return Array.from(ol.querySelectorAll('li h3')).map((h) => h.textContent?.trim())
  })
  if (!stepTitles.length) return { present: true, mismatches: [], note: 'no step list found' }
  // scroll through the whole process section in small increments, reading numeral + title + stepOf each time
  const box = await page.$eval('#process', (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top + window.scrollY, height: r.height }
  })
  const increments = 14
  for (let i = 0; i <= increments; i++) {
    const y = box.top - 200 + (box.height / increments) * i
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(180)
    const state = await page.evaluate(() => {
      const wrap = document.querySelector('#process .lg\\:col-span-5')
      if (!wrap) return null
      const numeralEl = wrap.querySelector('p.font-sf')
      const stepOfEl = wrap.querySelector('p.uppercase')
      const titleEl = wrap.querySelector('p.mt-4.text-2xl') // stable class, unlike a positional index (breaks if a duplicate numeral node is mid-exit)
      return {
        numeral: numeralEl?.textContent?.trim() ?? null,
        stepOf: stepOfEl?.textContent?.trim() ?? null,
        title: titleEl?.textContent?.trim() ?? null,
      }
    })
    if (!state || state.numeral == null) continue
    const nIdx = parseInt(state.numeral, 10) - 1
    const stepOfMatch = state.stepOf?.match(/(\d+)/)
    const stepOfIdx = stepOfMatch ? parseInt(stepOfMatch[1], 10) - 1 : null
    const expectedTitle = stepTitles[nIdx]
    if (state.title && expectedTitle && state.title !== expectedTitle) {
      mismatches.push({ scrollY: Math.round(y), numeral: state.numeral, stepOf: state.stepOf, title: state.title, expectedTitleForNumeral: expectedTitle })
    }
    if (stepOfIdx !== null && stepOfIdx !== nIdx) {
      mismatches.push({ scrollY: Math.round(y), numeral: state.numeral, stepOf: state.stepOf, title: state.title, note: 'stepOf index != numeral index' })
    }
  }
  return { present: true, mismatches, stepCount: stepTitles.length }
}

async function checkOverlaps(page) {
  return page.evaluate(() => {
    function isVisible(el) {
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return false
      const cs = getComputedStyle(el)
      return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) !== 0
    }
    const fixed = Array.from(document.querySelectorAll('body *')).filter((el) => {
      const cs = getComputedStyle(el)
      // A non-interactive (pointer-events:none) full-bleed background layer sitting behind everything
      // (negative z-index) can never actually compete for a click or visually clash with the chrome on
      // top of it — that's an intentional decorative pattern, not the "FAB vs rail" collision this check
      // is after, so it would just be noise here.
      if (cs.pointerEvents === 'none' && parseInt(cs.zIndex || '0', 10) < 0) return false
      return cs.position === 'fixed' && isVisible(el)
    })
    // Only consider "leaf-most" fixed elements (not a fixed ancestor containing another fixed element we already counted)
    const leaves = fixed.filter((el) => !fixed.some((other) => other !== el && el.contains(other)))
    const boxes = leaves.map((el) => ({
      el,
      selector: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.toString().split(' ').slice(0, 2).join('.') : ''),
      r: el.getBoundingClientRect(),
    }))
    const out = []
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].r
        const b = boxes[j].r
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        if (ix > 4 && iy > 4) {
          out.push({ a: boxes[i].selector, b: boxes[j].selector, overlapPx: `${Math.round(ix)}x${Math.round(iy)}` })
        }
      }
    }
    return out
  })
}

/**
 * Gap/oversized-empty geometry is measured under `prefers-reduced-motion: reduce`. Reason: headings
 * and body copy render through <RevealText>, whose word spans start at `opacity:0` and only reach
 * `opacity:1` via a scroll-triggered `whileInView` animation (see src/components/common/RevealText.tsx).
 * Reading geometry right after `goto()` — before those animations have fired for anything below the
 * fold — makes every not-yet-revealed heading invisible to a content-node scan, which inflates the
 * measured gap to "wherever the next already-visible text happens to be". The app already renders
 * reveal text at its resting (visible) state when `useReducedMotion()` is true (`initial={reduced ?
 * false : {...}}`), so emulating that preference gives the SETTLED layout — what a real visitor sees
 * once scrolled there — without needing to scroll through the whole page first.
 */
async function measureGeometry(browser, viewport, url, gapLimit, extraCtx = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', ...extraCtx })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const gaps = await findGaps(page, gapLimit)
  const oversizedEmpty = await findOversizedEmpty(page)
  const hOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  await context.close()
  return { gaps, oversizedEmpty, horizontalOverflow: hOverflow.scrollWidth > hOverflow.clientWidth + 1 ? hOverflow : null }
}

async function main() {
  const browser = await chromium.launch()
  const report = { generatedAt: new Date().toISOString(), base: BASE, routes: [] }

  for (const route of ROUTES) {
    log(`\n=== ${route.label} ===`)
    const routeResult = { path: route.path, label: route.label, desktop: {}, mobile: {}, dark: {}, sticky: [], overlaps: [], errors: [] }

    // ---------- DESKTOP ----------
    {
      const context = await browser.newContext({ viewport: DESKTOP })
      await context.addInitScript(LONGTASK_INIT)
      const page = await context.newPage()
      const consoleErrors = await collectConsoleErrors(page)
      await page.goto(BASE + route.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      const geomD = await measureGeometry(browser, DESKTOP, BASE + route.path, GAP_LIMIT_DESKTOP)
      routeResult.desktop.gaps = geomD.gaps
      routeResult.desktop.oversizedEmpty = geomD.oversizedEmpty

      const scroll = await wheelScrollStallTest(page)
      routeResult.desktop.scroll = scroll
      const longtasks = await page.evaluate(() => window.__longtasks || [])
      routeResult.desktop.longtaskCount = longtasks.length
      routeResult.desktop.longtaskTotalMs = Math.round(longtasks.reduce((s, t) => s + t.dur, 0))

      if (!route.arcade) {
        routeResult.sticky = await checkSticky(page)
        if (route.path !== '/menu') routeResult.processReadout = await checkProcessReadout(page)
      }
      routeResult.overlaps = await checkOverlaps(page)

      // dark mode toggle
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(150)
      const toggle = await page.$('button[aria-label^="Switch to"]')
      if (toggle) {
        // Every theme's dark/light bg class lives on its own root wrapper (`role="document"`), not on
        // <body> — body's own background never changes, so reading it here would always read "false".
        const bgOf = () => getComputedStyle(document.querySelector('[role="document"]') || document.body).backgroundColor
        const before = await page.evaluate(bgOf)
        await toggle.click()
        await page.waitForTimeout(300)
        const after = await page.evaluate(bgOf)
        routeResult.dark.toggled = before !== after
        routeResult.dark.before = before
        routeResult.dark.after = after
        // screenshot for the record
        await page.screenshot({ path: resolve(OUT, `${route.theme}-desktop-dark.png`) }).catch(() => {})
      } else {
        routeResult.dark.toggled = null
        routeResult.dark.note = 'no theme toggle button found'
      }

      routeResult.errors.desktop = consoleErrors
      await page.screenshot({ path: resolve(OUT, `${route.theme}-desktop.png`), fullPage: false }).catch(() => {})
      await context.close()
    }

    // ---------- MOBILE ----------
    {
      const context = await browser.newContext({ viewport: MOBILE, hasTouch: true, isMobile: true })
      await context.addInitScript(LONGTASK_INIT)
      const page = await context.newPage()
      const consoleErrors = await collectConsoleErrors(page)
      await page.goto(BASE + route.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      const geomM = await measureGeometry(browser, MOBILE, BASE + route.path, GAP_LIMIT_MOBILE, { hasTouch: true, isMobile: true })
      routeResult.mobile.gaps = geomM.gaps
      routeResult.mobile.oversizedEmpty = geomM.oversizedEmpty
      routeResult.mobile.horizontalOverflow = geomM.horizontalOverflow

      const touchScroll = await touchScrollStallTest(page)
      routeResult.mobile.scroll = touchScroll
      const longtasks = await page.evaluate(() => window.__longtasks || [])
      routeResult.mobile.longtaskCount = longtasks.length
      routeResult.mobile.longtaskTotalMs = Math.round(longtasks.reduce((s, t) => s + t.dur, 0))

      routeResult.errors.mobile = consoleErrors
      await page.screenshot({ path: resolve(OUT, `${route.theme}-mobile.png`) }).catch(() => {})
      await context.close()
    }

    results.push(routeResult)
    report.routes.push(routeResult)
  }

  // ---------- (h) theme switcher reachability ----------
  const switcherFindings = []
  {
    const context = await browser.newContext({ viewport: DESKTOP })
    const page = await context.newPage()
    // pin mf_v=neo, then visit each theme and confirm every other-design link points to a reachable href,
    // then specifically: from /neo, click the Apple link and expect .theme-apple to render at /?v=apple
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      document.cookie = 'mf_v=neo; Path=/; Max-Age=999999'
    })
    await page.goto(BASE + '/neo', { waitUntil: 'networkidle' })
    // find a link to '/?v=apple'
    const appleHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'))
      const a = links.find((l) => l.getAttribute('href') === '/?v=apple')
      return a ? a.getAttribute('href') : null
    })
    switcherFindings.push({ step: 'find apple link on /neo while pinned to neo', found: !!appleHref })
    if (appleHref) {
      // Prefer a link that's actually in normal document flow (the "Explore" grid at the bottom of the
      // page) over one that might be inside a conditionally-unmounted drawer; scrollIntoView + click.
      const link = await page.$('a[href="/?v=apple"]')
      await link.scrollIntoViewIfNeeded()
      await link.click({ timeout: 5000 }).catch(async () => {
        await page.goto(BASE + appleHref, { waitUntil: 'networkidle' })
      })
      // TransitionLink's curtain animation defers the actual route change to 1200ms after click
      // (src/components/transitions/PageTransition.tsx), so this has to outwait that, not guess short.
      await page.waitForTimeout(1700)
      const hasAppleTheme = await page.evaluate(() => !!document.querySelector('.theme-apple'))
      switcherFindings.push({ step: 'click Apple link while pinned to neo -> expect .theme-apple', url: page.url(), pass: hasAppleTheme })
    }
    await context.close()
  }

  // ---------- markdown + json output ----------
  const jsonPath = resolve(OUT, 'qa-report.json')
  writeFileSync(jsonPath, JSON.stringify({ ...report, switcher: switcherFindings }, null, 2))

  const rows = []
  rows.push('| Route | Desktop stalls | Mobile stalls | Desktop longtasks | Mobile longtasks | Desktop gaps>180px | Mobile gaps>140px | Oversized-empty | Sticky broken | Process mismatch | H-overflow@390 | Overlaps | Console err (d/m) | Dark toggles |')
  rows.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const r of report.routes) {
    rows.push(
      `| ${r.label} | ${r.desktop.scroll?.stalls?.length ?? '-'} | ${r.mobile.scroll?.stalls?.length ?? '-'} | ${r.desktop.longtaskCount ?? '-'} | ${r.mobile.longtaskCount ?? '-'} | ${r.desktop.gaps?.length ?? '-'} | ${r.mobile.gaps?.length ?? '-'} | ${(r.desktop.oversizedEmpty?.length ?? 0) + (r.mobile.oversizedEmpty?.length ?? 0)} | ${r.sticky?.length ?? '-'} | ${r.processReadout?.mismatches?.length ?? '-'} | ${r.mobile.horizontalOverflow ? 'YES' : 'no'} | ${r.overlaps?.length ?? '-'} | ${r.errors.desktop?.length ?? 0}/${r.errors.mobile?.length ?? 0} | ${r.dark.toggled === null ? 'n/a' : r.dark.toggled} |`,
    )
  }
  rows.push('')
  rows.push('## Theme switcher (h)')
  for (const f of switcherFindings) rows.push(`- ${f.step}: ${JSON.stringify(f)}`)
  rows.push('')
  rows.push('## Detail dumps')
  for (const r of report.routes) {
    rows.push(`\n### ${r.label}`)
    if (r.desktop.gaps?.length) rows.push('Desktop gaps: ' + JSON.stringify(r.desktop.gaps))
    if (r.mobile.gaps?.length) rows.push('Mobile gaps: ' + JSON.stringify(r.mobile.gaps))
    if (r.desktop.oversizedEmpty?.length) rows.push('Desktop oversized-empty: ' + JSON.stringify(r.desktop.oversizedEmpty))
    if (r.mobile.oversizedEmpty?.length) rows.push('Mobile oversized-empty: ' + JSON.stringify(r.mobile.oversizedEmpty))
    if (r.desktop.scroll?.stalls?.length) rows.push('Desktop scroll stalls: ' + JSON.stringify(r.desktop.scroll.stalls))
    if (r.mobile.scroll?.stalls?.length) rows.push('Mobile scroll stalls: ' + JSON.stringify(r.mobile.scroll.stalls))
    if (r.sticky?.length) rows.push('Broken sticky: ' + JSON.stringify(r.sticky))
    if (r.processReadout?.mismatches?.length) rows.push('Process readout mismatches: ' + JSON.stringify(r.processReadout.mismatches))
    if (r.overlaps?.length) rows.push('Overlaps: ' + JSON.stringify(r.overlaps))
    if (r.errors.desktop?.length) rows.push('Console errors (desktop): ' + JSON.stringify(r.errors.desktop))
    if (r.errors.mobile?.length) rows.push('Console errors (mobile): ' + JSON.stringify(r.errors.mobile))
    if (r.mobile.horizontalOverflow) rows.push('Horizontal overflow: ' + JSON.stringify(r.mobile.horizontalOverflow))
  }
  writeFileSync(resolve(OUT, 'qa-report.md'), rows.join('\n'))
  log('\nWrote', jsonPath)
  log('Wrote', resolve(OUT, 'qa-report.md'))

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
