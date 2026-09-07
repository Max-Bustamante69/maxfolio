// Captures home + PDP, desktop + mobile, for every store in src/data/gallery-sources.json.
// Output: public/gallery/<slug>/{home,pdp}-{desktop,mobile}.webp + linkedin.webp + manifest.json
// Usage: node scripts/capture-gallery.mjs            (all)
//        node scripts/capture-gallery.mjs --only nos-cafe
import { chromium, devices } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { discoverPdp, settle, readShopifyTheme, toWebp, composite } from './capture-helpers.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'gallery')
const sources = JSON.parse(await readFile(path.join(ROOT, 'src/data/gallery-sources.json'), 'utf8'))
const onlyIdx = process.argv.indexOf('--only')
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null

const iphone = devices['iPhone 14']
const VIEWPORTS = {
  desktop: { context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, outWidth: 1200 },
  mobile: {
    context: { ...iphone, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
    outWidth: 780,
  },
}

function withPreview(url, id) {
  const u = new URL(url)
  if (id) {
    u.searchParams.set('preview_theme_id', id)
    u.searchParams.set('pb', '0')
  }
  return u.toString()
}

await mkdir(OUT, { recursive: true })
const manifestPath = path.join(OUT, 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'))
const browser = await chromium.launch()

for (const src of sources) {
  if (only && src.slug !== only) continue
  const dir = path.join(OUT, src.slug)
  await mkdir(dir, { recursive: true })
  const entry = {
    slug: src.slug,
    sourceUrl: src.url,
    status: src.status,
    previewThemeId: src.previewThemeId ?? null,
    capturedAt: new Date().toISOString(),
    shots: {},
  }
  try {
    const pdpPath = src.pdp ?? (await discoverPdp(src.url))
    const routes = { home: '/', pdp: pdpPath }
    const png = {}
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ ...vp.context, locale: 'es-CO', colorScheme: 'light' })
      const page = await context.newPage()
      for (const [routeName, routePath] of Object.entries(routes)) {
        const target = withPreview(new URL(routePath, src.url).toString(), src.previewThemeId)
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 })
        if (routeName === 'home' && vpName === 'desktop') {
          const theme = await readShopifyTheme(page)
          entry.theme = theme ? { id: theme.id, name: theme.name, role: theme.role } : null
          entry.pageTitle = await page.title()
          entry.finalUrl = page.url()
        }
        await settle(page)
        const buf = await page.screenshot({ type: 'png', fullPage: false })
        png[`${routeName}-${vpName}`] = buf
        const file = `${routeName}-${vpName}.webp`
        await toWebp(buf, vp.outWidth, path.join(dir, file))
        entry.shots[`${routeName}-${vpName}`] = `/gallery/${src.slug}/${file}`
      }
      await context.close()
    }
    await composite(png['home-desktop'], png['home-mobile'], path.join(dir, 'linkedin.webp'))
    entry.linkedin = `/gallery/${src.slug}/linkedin.webp`
    entry.pdp = pdpPath
    console.log(`✓ ${src.slug} (${entry.theme?.name ?? 'no Shopify.theme'}) ${entry.pageTitle ?? ''}`)
  } catch (err) {
    entry.error = String(err?.message ?? err)
    console.error(`✗ ${src.slug}: ${entry.error}`)
  }
  manifest[src.slug] = entry
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
await browser.close()
