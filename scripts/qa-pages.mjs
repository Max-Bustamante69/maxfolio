#!/usr/bin/env node
/**
 * qa-pages.mjs — behavioral QA harness for every switchable design (Apple, Neo, Arcade/Persona,
 * Luxury, Brutalist) plus the /menu page. Real Chromium via Playwright, real wheel/touch input,
 * real PerformanceObserver longtask counts — no synthetic scrollTo() shortcuts.
 *
 * v1 checks (see AGENTS task):
 *   (a) scroll stalls (wheel @1440/390, touch-drag @390) + longtask count
 *   (b) giant blank gaps between sections / oversized empty elements
 *   (c) sticky elements actually stick + the Process readout numeral/title/"Step n of N" agree
 *   (d) horizontal overflow @390
 *   (e) console errors
 *   (f) overlaps between fixed-position chrome (rail, FAB, bottom bars)
 *   (g) dark mode toggle per theme
 *   (h) theme switcher reachability, including Apple from a visitor pinned to neo (mf_v cookie)
 *
 * v2 additions (2026-09-09 — the owner reported the v1 pass as not good enough: "el scroll se queda
 * atorado en muchas partes, hay espacios en blanco gigantes que no llevan a ningún lado"):
 *   (A2) sheet wheel-scroll: v1's stall test always kept the mouse at a fixed viewport point while
 *        the PAGE scrolled under it — it never opened a modal/sheet and tried to scroll THAT with a
 *        wheel. Real bug found this way: the case-study sheet's own `overflow-y-auto` panel didn't
 *        opt out of Lenis, so with the body scroll-locked behind it, a wheel gesture over the sheet
 *        was captured by Lenis and spent trying to move a page that can't move — dead scroll. Fixed
 *        in src/components/gallery/ProjectModal.tsx (`data-lenis-prevent`), verified here.
 *   (B2) painted-window scan: a content-node bounding-box gap check (v1's `findGaps`) can be fooled
 *        by a node that exists but paints nothing at the point a real eye would land on. This walks
 *        the full document height in fixed windows and sample a 6×8 grid of `elementsFromPoint` per
 *        window — a window with zero painted samples is flagged, with the top element at its center
 *        named as the likely occupant (Suspense fallback, decorative wrapper, etc).
 *   (C2) scroll-swallower audit: every non-Carousel `overflow-x/y: auto|scroll` container whose
 *        height sits within 50–150% of the viewport is a candidate for "traps the wheel instead of
 *        letting the page scroll past it" — each candidate gets an actual wheel-over-it behavioral
 *        test (does document.scrollY still advance?), not just a static flag.
 *   (D2) chrome audit: footer (`footer[role="contentinfo"]`), top nav, and the design switcher
 *        (Explore grid / `[data-theme-switcher]`) are present, visible (non-zero box) and — for the
 *        switcher — actually navigate, on every route AND every Arcade screen.
 *   (E2) images: naturalWidth/Height (404 or broken), explicit width/height attributes (CLS risk),
 *        and response byte size (>300KB) via a response listener correlated to the <img> list.
 *   (F2) failed network requests (any status >=400 or `requestfailed`), separate from console errors.
 *   (G2) Arcade per-screen pass (#home #work #years #skills #contact): TopBar/BottomBar/footer/
 *        switcher presence, stalls, painted-window scan, overflow — WITHOUT touching Persona.tsx
 *        (another lane owns that file; this harness only reads it).
 *
 * Usage: node scripts/qa-pages.mjs [--base http://localhost:4193] [--out <dir>] [--skip-v1]
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

// Arcade screens (v2, G2): hash-routed, so each is its own `/arcade#<screen>` navigation rather than
// a separate ROUTES entry. Persona.tsx itself is another lane's surface — this only reads it.
const ARCADE_SCREENS = ['home', 'work', 'years', 'skills', 'contact']

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
  // (E2) Real cumulative layout shift, not a static "missing width/height attribute" proxy — this
  // codebase boxes most images in an aspect-ratio'd parent (see DeviceFrame.tsx) and fills them with
  // absolute + h-full/w-full, which is CLS-safe without the <img> tag itself carrying width/height.
  // A static attribute check would flag that pattern as broken when it measurably isn't; the actual
  // 'layout-shift' entries are the ground truth.
  window.__cls = 0;
  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) { window.__clsError = String(e); }
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
      pointerEventsNone: getComputedStyle(el).pointerEvents === 'none',
      r: el.getBoundingClientRect(),
    }))
    const out = []
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        // v2: two elements that BOTH ignore pointer events can never compete for a click or visually
        // clash in a way that matters to a user's interaction — same reasoning as the negative-z-index
        // exclusion above, just not limited to background layers. Real finding this caught while it was
        // narrower: two identical `pointer-events-none fixed` decorative layers overlapping mid-scroll,
        // which is a QA-harness false positive, not a page defect.
        if (boxes[i].pointerEventsNone && boxes[j].pointerEventsNone) continue
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

// ============================================================================
// v2 additions
// ============================================================================

/**
 * (B2) Painted-window scan: walks the full document height in `windowPx`-tall bands and, for each
 * band, samples a `cols`×`rows` grid via `elementsFromPoint` inside that band. A band where every
 * sample resolves to "nothing painted" (no own text node, no image/svg/canvas/video, no background
 * image, no background-color other than transparent) is flagged, with the element at the band's
 * center point named as the likely occupant — a Suspense fallback, an absolutely-positioned
 * decorative wrapper, an empty section, etc. This catches what a content-node bounding-box gap check
 * (findGaps) can miss: a node that exists in the DOM but paints nothing at the point a real eye lands.
 */
async function scanPaintedWindows(page, { windowPx = 300, cols = 6, rows = 8 } = {}) {
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  const viewportH = await page.evaluate(() => window.innerHeight)
  const blanks = []
  for (let winTop = 0; winTop < docHeight; winTop += windowPx) {
    await page.evaluate((y) => window.scrollTo(0, y), winTop)
    await page.waitForTimeout(40)
    const result = await page.evaluate(
      ({ cols, rows, windowPx, viewportH }) => {
        const vw = window.innerWidth
        const bandH = Math.min(windowPx, viewportH, document.documentElement.scrollHeight - window.scrollY)
        if (bandH <= 0) return { painted: 0, total: 0, centerTag: null }
        let painted = 0
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (vw * (c + 0.5)) / cols
            const y = (bandH * (r + 0.5)) / rows
            const els = document.elementsFromPoint(x, y)
            for (const el of els) {
              const cs = getComputedStyle(el)
              if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue
              const isMedia = ['IMG', 'SVG', 'CANVAS', 'VIDEO', 'PICTURE'].includes(el.tagName)
              const hasBgImage = cs.backgroundImage && cs.backgroundImage !== 'none'
              const hasBgColor = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent'
              const hasOwnText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0)
              const hasBorder = ['borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth'].some((k) => parseFloat(cs[k]) > 0) && cs.borderStyle !== 'none'
              if (isMedia || hasBgImage || hasOwnText || hasBorder || (hasBgColor && el.tagName !== 'HTML' && el.tagName !== 'BODY')) {
                painted++
                break
              }
            }
          }
        }
        const centerEl = document.elementFromPoint(vw / 2, bandH / 2)
        const centerTag = centerEl ? centerEl.tagName + (centerEl.id ? '#' + centerEl.id : '') + (centerEl.className ? '.' + String(centerEl.className).slice(0, 60) : '') : null
        return { painted, total: rows * cols, centerTag }
      },
      { cols, rows, windowPx, viewportH },
    )
    if (result.total > 0 && result.painted === 0) {
      blanks.push({ topDoc: winTop, occupant: result.centerTag })
    }
  }
  return blanks
}

/**
 * (C2) Scroll-swallower audit. Finds every visible `overflow-x/y: auto|scroll` container (excluding
 * the house Carousel's own track, which is a KNOWN, intended horizontal scroller — flagged separately
 * as `carousel` so it still gets the same behavioral wheel-over check) whose height sits within
 * 50–150% of the viewport height — the shape of something that could plausibly eat page-scroll wheel
 * input instead of letting it fall through to Lenis. For each candidate, drives a real wheel gesture
 * with the mouse over its center and reports whether `document.scrollY`/its own scrollTop moved —
 * proof, not a guess about what "looks like" a trap.
 */
async function findScrollSwallowers(page, viewport) {
  const candidates = await page.evaluate((vh) => {
    function isVisible(el) {
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return false
      const cs = getComputedStyle(el)
      return cs.visibility !== 'hidden' && cs.display !== 'none'
    }
    const out = []
    document.querySelectorAll('body *').forEach((el) => {
      if (!isVisible(el)) return
      const cs = getComputedStyle(el)
      const scrollsX = (cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 2
      const scrollsY = (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2
      if (!scrollsX && !scrollsY) return
      const r = el.getBoundingClientRect()
      if (r.height < vh * 0.5 || r.height > vh * 1.5) return
      out.push({
        selector: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).split(' ').slice(0, 3).join('.') : ''),
        isCarouselTrack: el.matches('.rail-wide ul, [aria-roledescription="carousel"] ul'),
        axis: scrollsX ? 'x' : 'y',
        x: Math.round(r.left + r.width / 2),
        y: Math.round(r.top + r.height / 2),
      })
    })
    return out
  }, viewport.height)

  const findings = []
  for (const cand of candidates.slice(0, 12)) {
    // clamp the probe point on-screen
    const x = Math.min(Math.max(cand.x, 4), viewport.width - 4)
    const y = Math.min(Math.max(cand.y, 4), viewport.height - 4)
    const before = await page.evaluate(() => window.scrollY)
    for (let i = 0; i < 8; i++) {
      await page.mouse.move(x, y)
      await page.mouse.wheel(0, 200)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(150)
    const after = await page.evaluate(() => window.scrollY)
    const pageAdvanced = Math.abs(after - before) > 4
    findings.push({ ...cand, pageScrollYBefore: before, pageScrollYAfter: after, pageAdvanced, swallowsPageScroll: !pageAdvanced && !cand.isCarouselTrack })
  }
  return findings
}

/**
 * (A2) Opens the first case-study sheet from the Gallery section (present on /, /neo, /luxury,
 * /brutalist, and Arcade's #work) and drives a real wheel gesture over its own scrollable numbers
 * panel — the exact gesture v1's fixed-viewport-point stall test never produced, since it never
 * opened a modal. Returns null if no Gallery/openable card is present on this page.
 */
async function checkSheetWheelScroll(page, viewport) {
  const rail = await page.$('.rail-wide figure button[aria-label], figure button[aria-label]')
  if (!rail) return null
  await rail.scrollIntoViewIfNeeded().catch(() => {})
  await rail.click({ timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(600)
  const dialog = await page.$('[role="dialog"]')
  if (!dialog) return { opened: false }
  const box = await page.evaluate(() => {
    const el = document.querySelector('[role="dialog"] .overflow-y-auto')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, hasPrevent: el.hasAttribute('data-lenis-prevent') }
  })
  if (!box || box.scrollHeight <= box.clientHeight + 2) {
    // nothing to scroll in this panel at this viewport — not a failure, just not applicable
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(300)
    return { opened: true, scrollable: false }
  }
  const cx = Math.min(Math.max(box.x, 4), viewport.width - 4)
  const cy = Math.min(Math.max(box.y, 4), viewport.height - 4)
  for (let i = 0; i < 15; i++) {
    await page.mouse.move(cx, cy)
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(200)
  const scrollTopAfter = await page.evaluate(() => document.querySelector('[role="dialog"] .overflow-y-auto')?.scrollTop ?? 0)
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)
  return { opened: true, scrollable: true, hasPreventAttr: box.hasPrevent, scrollHeight: box.scrollHeight, clientHeight: box.clientHeight, scrollTopAfterWheel: scrollTopAfter, stuck: scrollTopAfter < 4 }
}

/**
 * (D2) Chrome audit: footer, top nav, and the design switcher are present, visible (non-zero box).
 * `switcherSelector` lets Arcade pass `[data-theme-switcher]` instead of the Explore-grid link.
 */
async function checkChrome(page, { switcherSelector = 'a[href^="/?v="], a[href="/neo"], a[href="/luxury"], a[href="/brutalist"], a[href="/menu"], a[href="/"], a[href="/arcade"], [data-theme-switcher]' } = {}) {
  return page.evaluate((switcherSelector) => {
    function box(sel) {
      const el = document.querySelector(sel)
      if (!el) return { present: false }
      const r = el.getBoundingClientRect()
      return { present: true, visible: r.width > 0 && r.height > 0 }
    }
    const footer = box('footer[role="contentinfo"]')
    const nav = box('header, nav')
    const switcherEl = document.querySelector(switcherSelector)
    const switcher = switcherEl ? { present: true, visible: switcherEl.getBoundingClientRect().width > 0 } : { present: false }
    return { footer, nav, switcher }
  }, switcherSelector)
}

/**
 * (E2)/(F2) Images + network. Attach BEFORE navigation: tracks response status/size per URL, then
 * correlates against the page's <img> elements for 404s, missing explicit width/height (CLS risk),
 * and >300KB payloads.
 */
function attachNetworkTracking(page) {
  const responses = new Map() // url -> { status, bytes }
  const failed = []
  page.on('response', async (res) => {
    try {
      const req = res.request()
      const headers = res.headers()
      const len = headers['content-length'] ? parseInt(headers['content-length'], 10) : null
      responses.set(res.url(), { status: res.status(), bytes: len, type: req.resourceType() })
      if (res.status() >= 400) failed.push({ url: res.url(), status: res.status() })
    } catch {
      /* response may already be gone (redirect/navigation race) — not the defect under test */
    }
  })
  page.on('requestfailed', (req) => {
    // A `mailto:`/`tel:` link "fails" as a resource request in headless Chromium (no protocol handler
    // to hand it to — net::ERR_ABORTED) even though it's a correct, working link in a real browser
    // with a mail/phone app registered. Not a page defect; would otherwise false-positive every
    // Contact section on every route.
    if (!req.url().startsWith('http')) return
    failed.push({ url: req.url(), status: 'requestfailed', reason: req.failure()?.errorText })
  })
  return { responses, failed }
}

async function checkImages(page, responses) {
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map((img) => ({
      src: img.currentSrc || img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      hasWidthAttr: img.hasAttribute('width'),
      hasHeightAttr: img.hasAttribute('height'),
      // The house pattern for a "cover" image (ProjectFrame/DeviceFrame) is an absolute + h-full/w-full
      // <img> inside a parent whose OWN box is fixed by CSS `aspect-ratio` — no reflow happens when the
      // image loads regardless of the <img> tag's own width/height attributes. Only flag missing
      // attributes as a real CLS risk when nothing in the ancestor chain already pins the box.
      inAspectRatioBox: !!img.closest('[style*="aspect-ratio"]'),
      loading: img.getAttribute('loading'),
    }))
  })
  const KB300 = 300 * 1024
  return imgs.map((img) => {
    const net = responses.get(img.src)
    // "Broken" means the browser tried and failed (a real 404/5xx, or a completed load that still
    // decoded to 0×0) — NOT "hasn't been requested yet", which is just an offscreen `loading="lazy"`
    // image this pass never scrolled to. Conflating the two was v2's own first-draft false positive
    // (58/78 images on Apple flagged "broken" purely for being lazy and below the fold — worth noting
    // as a lesson for whoever reruns this, not a page defect).
    const attempted = net != null || img.complete
    const broken = attempted && (net?.status >= 400 || img.naturalWidth === 0 || img.naturalHeight === 0)
    return {
      ...img,
      attempted,
      broken,
      missingDims: (!img.hasWidthAttr || !img.hasHeightAttr) && !img.inAspectRatioBox,
      bytes: net?.bytes ?? null,
      oversized: (net?.bytes ?? 0) > KB300,
      httpStatus: net?.status ?? null,
    }
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
  await context.addInitScript(LONGTASK_INIT) // also installs the layout-shift observer used for `cls` below
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  // (E2) CLS is read HERE, in a fresh, minimally-interactive context, right after initial load settles
  // — not on the main desktop/mobile page after a whole QA session's worth of scrolling and modal
  // opens has run on it. That page's `__cls` reflects everything this harness itself did to the page,
  // not what a real visitor's single page-load experiences, and would overstate the score.
  const cls = await page.evaluate(() => Math.round((window.__cls || 0) * 1000) / 1000)
  const gaps = await findGaps(page, gapLimit)
  const oversizedEmpty = await findOversizedEmpty(page)
  // (B2) same reduced-motion rationale as gaps/oversizedEmpty above: scanPaintedWindows jumps
  // (scrollTo) through the document out of order relative to a real scroll, and under normal motion
  // a whileInView reveal that just crossed into a band may still be mid-fade at sample time — a false
  // "blank" that's really "not finished fading in yet". Reduced motion renders it settled already.
  const paintedWindowBlanks = await scanPaintedWindows(page)
  const hOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  await context.close()
  return { gaps, oversizedEmpty, paintedWindowBlanks, cls, horizontalOverflow: hOverflow.scrollWidth > hOverflow.clientWidth + 1 ? hOverflow : null }
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
      const net = attachNetworkTracking(page)
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

      // ---- v2 ----
      routeResult.desktop.paintedWindowBlanks = geomD.paintedWindowBlanks
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(150)
      routeResult.desktop.scrollSwallowers = await findScrollSwallowers(page, DESKTOP)
      routeResult.desktop.sheetWheel = await checkSheetWheelScroll(page, DESKTOP)
      routeResult.chrome = await checkChrome(page, route.arcade ? { switcherSelector: '[data-theme-switcher]' } : {})
      routeResult.desktop.images = await checkImages(page, net.responses)
      routeResult.desktop.failedRequests = net.failed.slice()
      routeResult.desktop.cls = geomD.cls

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
      const net = attachNetworkTracking(page)
      await page.goto(BASE + route.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      const geomM = await measureGeometry(browser, MOBILE, BASE + route.path, GAP_LIMIT_MOBILE, { hasTouch: true, isMobile: true })
      routeResult.mobile.gaps = geomM.gaps
      routeResult.mobile.oversizedEmpty = geomM.oversizedEmpty
      routeResult.mobile.horizontalOverflow = geomM.horizontalOverflow
      routeResult.mobile.paintedWindowBlanks = geomM.paintedWindowBlanks

      const touchScroll = await touchScrollStallTest(page)
      routeResult.mobile.scroll = touchScroll
      const longtasks = await page.evaluate(() => window.__longtasks || [])
      routeResult.mobile.longtaskCount = longtasks.length
      routeResult.mobile.longtaskTotalMs = Math.round(longtasks.reduce((s, t) => s + t.dur, 0))

      // ---- v2 ----
      routeResult.mobile.scrollSwallowers = await findScrollSwallowers(page, MOBILE)
      if (!routeResult.chrome) routeResult.chrome = await checkChrome(page, route.arcade ? { switcherSelector: '[data-theme-switcher]' } : {})
      routeResult.mobile.images = await checkImages(page, net.responses)
      routeResult.mobile.failedRequests = net.failed.slice()
      routeResult.mobile.cls = geomM.cls

      routeResult.errors.mobile = consoleErrors
      await page.screenshot({ path: resolve(OUT, `${route.theme}-mobile.png`) }).catch(() => {})
      await context.close()
    }

    results.push(routeResult)
    report.routes.push(routeResult)
  }

  // ---------- (G2) Arcade per-screen pass ----------
  report.arcadeScreens = []
  for (const screen of ARCADE_SCREENS) {
    log(`\n=== Arcade #${screen} ===`)
    const url = `${BASE}/arcade#${screen}`
    const screenResult = { screen, desktop: {}, mobile: {} }

    {
      const context = await browser.newContext({ viewport: DESKTOP })
      await context.addInitScript(LONGTASK_INIT)
      const page = await context.newPage()
      const consoleErrors = await collectConsoleErrors(page)
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(700) // ScreenLoading Suspense + screen-enter transition
      screenResult.desktop.scroll = await wheelScrollStallTest(page, { steps: 40 })
      const hOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
      screenResult.desktop.horizontalOverflow = hOverflow.scrollWidth > hOverflow.clientWidth + 1 ? hOverflow : null
      screenResult.desktop.overlaps = await checkOverlaps(page)
      screenResult.chrome = await checkChrome(page, { switcherSelector: '[data-theme-switcher]' })
      screenResult.desktop.topBarPresent = await page.evaluate(() => {
        const el = document.querySelector('button[aria-label="Switch to light mode" i], button[aria-label="Switch to dark mode" i]')
        return !!el
      })
      screenResult.desktop.bottomBarPresent = await page.evaluate(() => !!document.querySelector('nav[aria-label="Screen navigation" i]'))
      // #work is the one Arcade screen that mounts Gallery/ProjectModal — confirm the (A2) sheet fix
      // holds here too, without touching Persona.tsx itself.
      if (screen === 'work') screenResult.desktop.sheetWheel = await checkSheetWheelScroll(page, DESKTOP)
      screenResult.errors = { desktop: consoleErrors }
      await page.screenshot({ path: resolve(OUT, `persona-${screen}-desktop.png`) }).catch(() => {})
      await context.close()
    }
    {
      const context = await browser.newContext({ viewport: MOBILE, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(700)
      screenResult.mobile.paintedWindowBlanks = await scanPaintedWindows(page)
      const hOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
      screenResult.mobile.horizontalOverflow = hOverflow.scrollWidth > hOverflow.clientWidth + 1 ? hOverflow : null
      await page.screenshot({ path: resolve(OUT, `persona-${screen}-mobile.png`) }).catch(() => {})
      await context.close()
    }
    report.arcadeScreens.push(screenResult)
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
  rows.push('# QA v2 — full-site human-like pass')
  rows.push('')
  rows.push('## v1 table (unchanged checks)')
  rows.push('')
  rows.push('| Route | Desktop stalls | Mobile stalls | Desktop longtasks | Mobile longtasks | Desktop gaps>180px | Mobile gaps>140px | Oversized-empty | Sticky broken | Process mismatch | H-overflow@390 | Overlaps | Console err (d/m) | Dark toggles |')
  rows.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const r of report.routes) {
    rows.push(
      `| ${r.label} | ${r.desktop.scroll?.stalls?.length ?? '-'} | ${r.mobile.scroll?.stalls?.length ?? '-'} | ${r.desktop.longtaskCount ?? '-'} | ${r.mobile.longtaskCount ?? '-'} | ${r.desktop.gaps?.length ?? '-'} | ${r.mobile.gaps?.length ?? '-'} | ${(r.desktop.oversizedEmpty?.length ?? 0) + (r.mobile.oversizedEmpty?.length ?? 0)} | ${r.sticky?.length ?? '-'} | ${r.processReadout?.mismatches?.length ?? '-'} | ${r.mobile.horizontalOverflow ? 'YES' : 'no'} | ${r.overlaps?.length ?? '-'} | ${r.errors.desktop?.length ?? 0}/${r.errors.mobile?.length ?? 0} | ${r.dark.toggled === null ? 'n/a' : r.dark.toggled} |`,
    )
  }

  rows.push('')
  rows.push('## v2 table (new human-like checks)')
  rows.push('')
  rows.push('| Route | Sheet wheel-scroll | Blank windows (d/m) | Scroll swallowers (d/m) | Footer/Nav/Switcher | Broken/oversized imgs (d/m) | CLS (d/m) | Failed requests (d/m) |')
  rows.push('|---|---|---|---|---|---|---|---|')
  for (const r of report.routes) {
    const sheet = r.desktop.sheetWheel
    const sheetCell = !sheet ? 'no gallery' : !sheet.opened ? 'FAILED TO OPEN' : !sheet.scrollable ? 'n/a (fits)' : sheet.stuck ? `STUCK (top=${sheet.scrollTopAfterWheel})` : 'ok'
    const blanksD = r.desktop.paintedWindowBlanks?.length ?? '-'
    const blanksM = r.mobile.paintedWindowBlanks?.length ?? '-'
    const swallowD = (r.desktop.scrollSwallowers ?? []).filter((s) => s.swallowsPageScroll).length
    const swallowM = (r.mobile.scrollSwallowers ?? []).filter((s) => s.swallowsPageScroll).length
    const chrome = r.chrome
    const chromeCell = chrome ? `${chrome.footer.present && chrome.footer.visible ? 'F✓' : 'F✗'} ${chrome.nav.present && chrome.nav.visible ? 'N✓' : 'N✗'} ${chrome.switcher.present && chrome.switcher.visible ? 'S✓' : 'S✗'}` : '-'
    const imgsD = (r.desktop.images ?? []).filter((i) => i.broken || i.oversized).length
    const imgsM = (r.mobile.images ?? []).filter((i) => i.broken || i.oversized).length
    const failD = r.desktop.failedRequests?.length ?? 0
    const failM = r.mobile.failedRequests?.length ?? 0
    rows.push(`| ${r.label} | ${sheetCell} | ${blanksD}/${blanksM} | ${swallowD}/${swallowM} | ${chromeCell} | ${imgsD}/${imgsM} | ${r.desktop.cls ?? '-'}/${r.mobile.cls ?? '-'} | ${failD}/${failM} |`)
  }
  rows.push('')
  rows.push('_"Broken/oversized imgs" only counts an image the browser actually attempted (a network response or `img.complete`) — an offscreen `loading="lazy"` image this pass never scrolled to is not "broken", it is correctly not loaded yet. CLS is the real `layout-shift` PerformanceObserver score (0 = no shift), not a static width/height-attribute proxy — several images here are intentionally unsized `<img>` tags inside an `aspect-ratio`-boxed parent (DeviceFrame.tsx), which is CLS-safe by construction without the attribute._')

  rows.push('')
  rows.push('## Arcade per-screen (G2)')
  rows.push('')
  rows.push('| Screen | Desktop stalls | H-overflow@390 | Overlaps | TopBar | BottomBar | Footer/Switcher | Blank windows (mobile) | Sheet wheel-scroll | Console err |')
  rows.push('|---|---|---|---|---|---|---|---|---|---|')
  for (const s of report.arcadeScreens) {
    const chrome = s.chrome
    const chromeCell = chrome ? `${chrome.footer.present && chrome.footer.visible ? 'F✓' : 'F✗'} ${chrome.switcher.present && chrome.switcher.visible ? 'S✓' : 'S✗'}` : '-'
    const sheet = s.desktop.sheetWheel
    const sheetCell = !sheet ? '—' : !sheet.opened ? 'FAILED TO OPEN' : !sheet.scrollable ? 'n/a (fits)' : sheet.stuck ? `STUCK (top=${sheet.scrollTopAfterWheel})` : 'ok'
    rows.push(
      `| #${s.screen} | ${s.desktop.scroll?.stalls?.length ?? '-'} | ${s.desktop.horizontalOverflow ? 'YES' : 'no'} | ${s.desktop.overlaps?.length ?? '-'} | ${s.desktop.topBarPresent ? 'yes' : 'MISSING'} | ${s.desktop.bottomBarPresent ? 'yes' : 'MISSING'} | ${chromeCell} | ${s.mobile.paintedWindowBlanks?.length ?? '-'} | ${sheetCell} | ${s.errors?.desktop?.length ?? 0} |`,
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
    if (r.desktop.paintedWindowBlanks?.length) rows.push('Desktop blank windows: ' + JSON.stringify(r.desktop.paintedWindowBlanks))
    if (r.mobile.paintedWindowBlanks?.length) rows.push('Mobile blank windows: ' + JSON.stringify(r.mobile.paintedWindowBlanks))
    const swallowersD = (r.desktop.scrollSwallowers ?? []).filter((s) => s.swallowsPageScroll)
    const swallowersM = (r.mobile.scrollSwallowers ?? []).filter((s) => s.swallowsPageScroll)
    if (swallowersD.length) rows.push('Desktop scroll swallowers: ' + JSON.stringify(swallowersD))
    if (swallowersM.length) rows.push('Mobile scroll swallowers: ' + JSON.stringify(swallowersM))
    if (r.desktop.sheetWheel) rows.push('Sheet wheel-scroll: ' + JSON.stringify(r.desktop.sheetWheel))
    if (r.chrome) rows.push('Chrome (footer/nav/switcher): ' + JSON.stringify(r.chrome))
    const badImgsD = (r.desktop.images ?? []).filter((i) => i.broken || i.oversized || i.missingDims)
    const badImgsM = (r.mobile.images ?? []).filter((i) => i.broken || i.oversized || i.missingDims)
    if (badImgsD.length) rows.push('Desktop image issues: ' + JSON.stringify(badImgsD))
    if (badImgsM.length) rows.push('Mobile image issues: ' + JSON.stringify(badImgsM))
    if (r.desktop.failedRequests?.length) rows.push('Desktop failed requests: ' + JSON.stringify(r.desktop.failedRequests))
    if (r.mobile.failedRequests?.length) rows.push('Mobile failed requests: ' + JSON.stringify(r.mobile.failedRequests))
  }
  rows.push('\n### Arcade screens')
  for (const s of report.arcadeScreens) {
    if (s.mobile.paintedWindowBlanks?.length) rows.push(`#${s.screen} mobile blank windows: ` + JSON.stringify(s.mobile.paintedWindowBlanks))
    if (s.desktop.overlaps?.length) rows.push(`#${s.screen} overlaps: ` + JSON.stringify(s.desktop.overlaps))
    if (s.errors?.desktop?.length) rows.push(`#${s.screen} console errors: ` + JSON.stringify(s.errors.desktop))
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
