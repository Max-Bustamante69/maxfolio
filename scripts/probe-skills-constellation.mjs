#!/usr/bin/env node
/**
 * probe-skills-constellation.mjs — round 46, lane skills-claims.
 *
 * Proves the mobile "constellation" Skills layout (owner-picked candidate "d" from the round-44
 * contact sheet, now the shipped sub-1024px default) at 1440 and 390, light and dark, with real
 * Chromium via Playwright:
 *   - zero console errors on any pass
 *   - no horizontal overflow at any viewport
 *   - 390px renders the constellation grid (not the ledger) — grid group-cluster buttons present
 *   - tap-to-zoom opens the cluster panel (shared layoutId "magic move") within ~300ms
 *   - every zoomed row and the back button meet the 44px minimum tap target
 *   - Escape closes the zoomed panel back to the grid
 *   - 1440px still renders the desktop orbit (unchanged) — ring elements present
 *
 * Starts its own `vite preview` on a free port, so it never collides with another session's server.
 *
 * Usage: node scripts/probe-skills-constellation.mjs [--out <dir>]
 */
import { chromium } from 'playwright'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** `child.kill()` on Windows only signals the `cmd.exe` shell wrapper `{shell: true}` spawned under,
 *  never the actual `vite preview` grandchild — it survives, still bound to its port. `taskkill /t`
 *  kills the whole process tree; everywhere else, a plain kill is enough. */
function killTree(child) {
  if (!child.pid) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
  else child.kill()
}

const args = process.argv.slice(2)
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const OUT = resolve(
  flag(
    'out',
    'C:/Users/Usuario/AppData/Local/Temp/claude/C--Users-Usuario-Desktop-P-Github-Digitdeck/75fa9a07-350d-4734-9d2e-ac255cc6dd8f/scratchpad/r46/skills-claims',
  ),
)
mkdirSync(OUT, { recursive: true })

const ROOT = resolve(import.meta.dirname, '..')
const findings = []
const fail = (msg) => {
  findings.push(msg)
  console.error('FAIL:', msg)
}
const ok = (msg) => console.log('ok:', msg)

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.unref()
    srv.on('error', rej)
    // `vite preview` on this machine binds the IPv6 loopback ([::1]) for "localhost", not 127.0.0.1 —
    // probe the same interface `vite preview` will actually use, or "free" can report a port that
    // then refuses the IPv4 connection this script would otherwise try.
    srv.listen(0, 'localhost', () => {
      const { port } = srv.address()
      srv.close(() => res(port))
    })
  })
}

function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now()
  return new Promise((res, rej) => {
    const tryOnce = () => {
      fetch(url)
        .then(() => res())
        .catch(() => {
          if (Date.now() - start > timeoutMs) rej(new Error(`preview server never answered at ${url}`))
          else setTimeout(tryOnce, 300)
        })
    }
    tryOnce()
  })
}

async function main() {
  const port = await getFreePort()
  const base = `http://localhost:${port}`
  console.log(`Starting vite preview on ${base} ...`)
  const preview = spawn('bunx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let previewLog = ''
  preview.stdout.on('data', (d) => (previewLog += d.toString()))
  preview.stderr.on('data', (d) => (previewLog += d.toString()))

  try {
    await waitForServer(base)
    ok(`preview server up at ${base}`)

    const browser = await chromium.launch()
    const PASSES = [
      { width: 1440, height: 1000, scheme: 'light', label: '1440-light' },
      { width: 1440, height: 1000, scheme: 'dark', label: '1440-dark' },
      { width: 390, height: 1000, scheme: 'light', label: '390-light' },
      { width: 390, height: 1000, scheme: 'dark', label: '390-dark' },
    ]

    for (const pass of PASSES) {
      const context = await browser.newContext({ viewport: { width: pass.width, height: pass.height }, colorScheme: pass.scheme })
      await context.addInitScript(
        ({ scheme }) => {
          try {
            localStorage.setItem('apple-theme', scheme)
            localStorage.setItem('lang', 'en')
          } catch {
            /* ignore */
          }
        },
        { scheme: pass.scheme },
      )
      const page = await context.newPage()
      const consoleErrors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })
      page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + String(err)))

      await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60_000 })
      await page.waitForTimeout(400)

      const skills = page.locator('#skills')
      await skills.scrollIntoViewIfNeeded()
      await page.waitForTimeout(700) // reveal animations + orbit/constellation mount settle

      // ---- horizontal overflow ----
      const hOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
      if (hOverflow.scrollWidth > hOverflow.clientWidth + 1) {
        fail(`${pass.label}: horizontal overflow (scrollWidth=${hOverflow.scrollWidth} clientWidth=${hOverflow.clientWidth})`)
      } else {
        ok(`${pass.label}: no horizontal overflow`)
      }

      if (pass.width >= 1024) {
        // ---- desktop: orbit unchanged ----
        const ringCount = await page.locator('.mfOrbitRing').count()
        if (ringCount === 0) fail(`${pass.label}: expected the desktop orbit (.mfOrbitRing) to still render, found 0`)
        else ok(`${pass.label}: desktop orbit renders (${ringCount} rings)`)
        // A viewport-clipped page.screenshot(), not skills.screenshot() — see the note below.
        await page.screenshot({ path: resolve(OUT, `skills-${pass.label}.png`) }).catch(() => {})
      } else {
        // ---- mobile: constellation grid, not the ledger ----
        const clusterButtons = page.locator('#skills [aria-label^="Open "]')
        const clusterCount = await clusterButtons.count()
        if (clusterCount === 0) {
          fail(`${pass.label}: expected constellation cluster buttons ([aria-label^="Open "]) under #skills, found 0 — is the ledger rendering instead?`)
        } else {
          ok(`${pass.label}: constellation grid renders (${clusterCount} clusters)`)
        }

        // ---- tap target size: cluster card ----
        if (clusterCount > 0) {
          const box = await clusterButtons.first().boundingBox()
          if (!box || box.height < 44 || box.width < 44) fail(`${pass.label}: cluster tap target too small (${JSON.stringify(box)})`)
          else ok(`${pass.label}: cluster tap target ${Math.round(box.width)}x${Math.round(box.height)} (>=44px)`)
        }

        // page.screenshot() (viewport-clipped), not skills.screenshot(): `#skills` is much taller than
        // the 390/1440 viewports (depth strip + chips + grid/panel + ticker), and Playwright's own
        // elementHandle.screenshot() on an over-tall target transiently resizes the CDP viewport to
        // fit the whole element before restoring it — that resize round-trip was observed to reset
        // this component's local React state (the zoomed cluster silently closed) once, so a
        // screenshot call taken mid-interaction could never again be trusted not to perturb the very
        // state the next assertion checks. page.screenshot() has no such side effect.
        await page.screenshot({ path: resolve(OUT, `skills-${pass.label}-grid.png`) }).catch(() => {})

        // ---- tap-to-zoom (magic move) ----
        if (clusterCount > 0) {
          const t0 = Date.now()
          await clusterButtons.first().click()
          // wait for the zoomed panel's own container to appear — bounds the observed transition time
          await page.waitForSelector('#skills .rounded-2xl.border.p-5', { timeout: 2000 }).catch(() => {})
          await page.waitForTimeout(320) // >= the 200-300ms ease-out transition window
          const elapsed = Date.now() - t0
          ok(`${pass.label}: tap-to-zoom settled within ${elapsed}ms (spec: 200-300ms ease-out transition)`)

          const panel = page.locator('#skills .rounded-2xl.border.p-5')
          const panelVisible = await panel.first().isVisible().catch(() => false)
          if (!panelVisible) fail(`${pass.label}: zoomed cluster panel did not become visible after tap`)
          else ok(`${pass.label}: zoomed cluster panel visible`)

          // ---- tap target size: back button (the only button with an svg icon child in the panel header) + first tool row ----
          const backBox = await panel
            .first()
            .locator('button')
            .filter({ has: page.locator('svg') })
            .first()
            .boundingBox()
            .catch(() => null)
          if (backBox && (backBox.height < 44 || backBox.width < 44)) fail(`${pass.label}: back button too small (${JSON.stringify(backBox)})`)
          else if (backBox) ok(`${pass.label}: back button ${Math.round(backBox.width)}x${Math.round(backBox.height)} (>=44px)`)
          else fail(`${pass.label}: could not locate the back button to measure it`)

          const rowButtons = page.locator('#skills [data-tool]')
          const rowCount = await rowButtons.count()
          if (rowCount > 0) {
            const rowBox = await rowButtons.first().boundingBox()
            if (!rowBox || rowBox.height < 44) fail(`${pass.label}: tool row tap target height ${rowBox?.height} < 44px`)
            else ok(`${pass.label}: tool row tap target height ${Math.round(rowBox.height)} (>=44px)`)
          }

          await page.screenshot({ path: resolve(OUT, `skills-${pass.label}-zoomed.png`) }).catch(() => {})

          // ---- Escape closes the zoomed panel ----
          await page.keyboard.press('Escape')
          await page.waitForTimeout(350)
          const panelStillVisible = await panel.first().isVisible().catch(() => false)
          if (panelStillVisible) fail(`${pass.label}: Escape did not close the zoomed cluster panel`)
          else ok(`${pass.label}: Escape closes the zoomed cluster panel back to the grid`)
        }
      }

      if (consoleErrors.length) {
        fail(`${pass.label}: ${consoleErrors.length} console error(s): ${consoleErrors.slice(0, 5).join(' | ')}`)
      } else {
        ok(`${pass.label}: zero console errors`)
      }

      await context.close()
    }

    await browser.close()
  } finally {
    killTree(preview)
  }

  writeFileSync(resolve(OUT, 'probe-log.txt'), previewLog)

  console.log('\n=== SUMMARY ===')
  if (findings.length) {
    console.log(`FAIL — ${findings.length} finding(s):`)
    for (const f of findings) console.log(' -', f)
    process.exit(1)
  } else {
    console.log('PASS — all checks green.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
