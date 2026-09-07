// Captures non-Shopify surfaces (the agency platform, local audit dashboards, app pages)
// with the same viewports as the store gallery: home-desktop / home-mobile + linkedin composite.
// Usage: node scripts/capture-extra.mjs <slug> <url|file:///path.html> [waitMs] [status]
import { chromium, devices } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { settle, toWebp, composite } from './capture-helpers.mjs'

const [slug, url, waitArg = '2500', status = 'live'] = process.argv.slice(2)
if (!slug || !url) {
  console.error('usage: node scripts/capture-extra.mjs <slug> <url> [waitMs] [status]')
  process.exit(1)
}
const waitMs = Number(waitArg)
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'gallery')
const dir = path.join(OUT, slug)
await mkdir(dir, { recursive: true })

const iphone = devices['iPhone 14']
const VIEWPORTS = {
  desktop: { context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, outWidth: 1200 },
  mobile: { context: { ...iphone, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }, outWidth: 780 },
}

const browser = await chromium.launch()
const png = {}
const entry = { slug, sourceUrl: url, status, source: 'extra', capturedAt: new Date().toISOString(), shots: {} }
for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ ...vp.context, colorScheme: 'light' })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForTimeout(waitMs)
  await settle(page)
  await page.waitForTimeout(500)
  if (vpName === 'desktop') entry.pageTitle = await page.title()
  const buf = await page.screenshot({ type: 'png', fullPage: false })
  png[vpName] = buf
  const file = `home-${vpName}.webp`
  await toWebp(buf, vp.outWidth, path.join(dir, file))
  entry.shots[`home-${vpName}`] = `/gallery/${slug}/${file}`
  await context.close()
}
await composite(png.desktop, png.mobile, path.join(dir, 'linkedin.webp'))
entry.linkedin = `/gallery/${slug}/linkedin.webp`
await browser.close()

const manifestPath = path.join(OUT, 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'))
manifest[slug] = entry
await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`✓ ${slug} ${entry.pageTitle ?? ''}`)
