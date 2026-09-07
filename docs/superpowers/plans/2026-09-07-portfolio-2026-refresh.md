# Maxfolio 2026 Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update maxfolio.dev with the 2026 work (CTO at Digitdeck, 18+ Shopify storefronts, app suite), add Shopify Work + Gallery sections with real uniform screenshots, ship an Apple-style default theme, carry all content in EN/ES/JA, then standardize LinkedIn and publish one CRO-consulting post.

**Architecture:** One untranslated registry (`src/data/registry.ts`) + three typed string files (`src/content/{en,es,ja}.ts`) merged by `useContent()`; a single design registry (`src/data/designs.ts`) feeding routes, menus and previews; a Playwright script that produces every gallery image deterministically; shared section components (`ShopifyWork`, `Gallery`, `ProjectFrame`) skinned per theme; a new `Apple.tsx` page as the `/` route.

**Tech Stack:** React 19, Vite 6, TypeScript 5.6, Tailwind 3.4, framer-motion 11, react-router 7, Playwright 1.61 + sharp (dev), Bun.

Spec: `docs/superpowers/specs/2026-09-07-portfolio-2026-refresh-design.md`. Repo root for every path below: `C:\Users\Usuario\Desktop\P\Github\Personal\max-folio-skills`. Branch: `feat/2026-refresh`.

---

## File map

| Path | Responsibility |
|---|---|
| `src/data/registry.ts` | Untranslated facts: experience entries, stores, products, personal projects, stats, skills lists |
| `src/data/designs.ts` | The four experiences (route, i18n keys, colors, Preview, favicon) |
| `src/data/gallery-sources.json` | Capture inputs per store (url, status, preview theme id, pdp override, dismiss selectors) |
| `src/content/types.ts` | `PortfolioContent` type |
| `src/content/en.ts`, `es.ts`, `ja.ts` | Strings per locale |
| `src/hooks/useContent.ts` | Merge registry + strings; `formatPeriod` |
| `src/components/gallery/ProjectFrame.tsx` | CSS device frames + lazy images + badge |
| `src/components/gallery/GalleryLightbox.tsx` | Four-shot lightbox |
| `src/components/gallery/skins.ts` | `Skin` type + per-theme skins |
| `src/components/sections/ShopifyWork.tsx` | Storefronts / Apps & Platform tabs |
| `src/components/sections/Gallery.tsx` | Filterable grid |
| `src/components/sections/ExploreDesigns*.tsx` | Rewritten on top of `designs.ts` |
| `src/components/previews/ApplePreview.tsx` | Menu/explore card preview |
| `src/components/common/{LanguageSelectorApple,MobileMenuApple,LogoSelectorApple}.tsx` | Apple chrome |
| `src/pages/Apple.tsx` | New default page |
| `src/pages/Design4.tsx`, `Design1.tsx`, `Home.tsx` | Consume registry/content; add new sections / fourth card |
| `scripts/capture-gallery.mjs` | Playwright capture → `public/gallery/**` + `manifest.json` |
| `public/gallery/**` | Generated images |
| `public/locales/*.json` | UI chrome strings (extended) |
| `index.html`, `public/sitemap.xml`, `public/og-image.png`, `public/favicon-apple.svg`, `public/Maximiliano-Bustamante-CV.pdf` | SEO/assets |
| `docs/linkedin/2026-09-experience.md`, `docs/linkedin/2026-09-post.md` | LinkedIn texts for approval |

---

### Task 1: Commit spec, add dev dependencies, capture inputs

**Files:**
- Modify: `package.json`
- Create: `src/data/gallery-sources.json`
- Create: `.gitignore` entry for `scripts/.capture-cache/`

- [ ] **Step 1: Commit the spec**

```bash
git add docs/superpowers/specs/2026-09-07-portfolio-2026-refresh-design.md bun.lock
git commit -m "docs: 2026 refresh design spec"
```

- [ ] **Step 2: Add Playwright + sharp as dev dependencies and a script**

```bash
bun add -d playwright@1.61.0 sharp@0.34.3
```

Then in `package.json` `scripts` add:

```json
"gallery:capture": "node scripts/capture-gallery.mjs",
"gallery:capture:one": "node scripts/capture-gallery.mjs --only"
```

- [ ] **Step 3: Write the capture inputs**

`src/data/gallery-sources.json`:

```json
[
  { "slug": "the-gummy-box", "url": "https://thegummyboxwellness.com", "status": "live" },
  { "slug": "nos-cafe", "url": "https://cafesnos.com", "status": "live" },
  { "slug": "millennio", "url": "https://perfumeriamillennio.com", "status": "live" },
  { "slug": "mindfuel", "url": "https://joinmindfuel.com", "status": "live" },
  { "slug": "nalua", "url": "https://naluaskincare.co", "status": "live" },
  { "slug": "sebum", "url": "https://www.sebumcremas.com", "status": "live" },
  { "slug": "valdo-cafe", "url": "https://valdocafe.co", "status": "live" },
  { "slug": "factores-2x2", "url": "https://factoresdetransferenciaacc.com.co", "status": "live" },
  { "slug": "pixxiesx", "url": "https://www.pixxiesx.co", "status": "live" },
  { "slug": "luxe-shine", "url": "https://luxeshiine.com", "status": "live" },
  { "slug": "atmosfera", "url": "https://atmosferatecnologica.com", "status": "live" },
  { "slug": "saint-theory", "url": "https://www.saint-theory.com", "status": "live" },
  { "slug": "peluna", "url": "https://pelunapets.com", "status": "dev" },
  { "slug": "en-amor-a-dos", "url": "https://enamoradosaccesorios.com", "status": "dev", "previewThemeId": "163940401371" },
  { "slug": "unik", "url": "https://www.unikjeans.com", "status": "dev", "previewThemeId": "142761787463" },
  { "slug": "origen-vital", "url": "https://www.origenvital.com.co", "status": "dev", "previewThemeId": "190230987040" },
  { "slug": "para-machos", "url": "https://www.paramachos.us", "status": "dev", "previewThemeId": "160311017621" },
  { "slug": "tierramont", "url": "https://tierramont.com", "status": "dev", "previewThemeId": "165861556464" },
  { "slug": "alma-de-aviador", "url": "https://jgnqhc-f1.myshopify.com", "status": "dev" }
]
```

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock src/data/gallery-sources.json
git commit -m "chore: playwright + sharp, gallery capture inputs"
```

---

### Task 2: Gallery capture script

**Files:**
- Create: `scripts/capture-gallery.mjs`
- Create: `scripts/capture-helpers.mjs`

- [ ] **Step 1: Helpers (PDP discovery, popup dismissal, image post-processing)**

`scripts/capture-helpers.mjs`:

```js
import sharp from 'sharp'

const GIFT_RE = /gift|regalo|tarjeta|card|bono|e-?card/i

export async function discoverPdp(baseUrl) {
  const res = await fetch(`${baseUrl}/products.json?limit=12`, {
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128' },
  })
  if (!res.ok) throw new Error(`products.json ${res.status} for ${baseUrl}`)
  const { products } = await res.json()
  const pick = products.find((p) => p.images?.length && !GIFT_RE.test(p.handle) && !GIFT_RE.test(p.title))
  if (!pick) throw new Error(`no product with images at ${baseUrl}`)
  return `/products/${pick.handle}`
}

export const DISMISS_SELECTORS = [
  '[aria-label*="close" i]',
  '[aria-label*="cerrar" i]',
  '.klaviyo-close-form',
  'button.needsclick[aria-label]',
  '.shopify-pc__banner__btn-decline',
  '#shopify-pc__banner__btn-decline',
  '[data-testid="age-gate"] button',
  '.age-gate button',
  'button:has-text("Aceptar")',
  'button:has-text("Accept")',
  'button:has-text("Entendido")',
]

export async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready)
  for (let i = 0; i < 2; i++) {
    for (const sel of DISMISS_SELECTORS) {
      const el = page.locator(sel).first()
      if (await el.isVisible().catch(() => false)) await el.click({ timeout: 1500 }).catch(() => {})
    }
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(400)
  }
  // trigger lazy images, then go back to top
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight
    for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(600)
  await page.addStyleTag({
    content: `*{animation-play-state:paused!important;transition:none!important}
      ::-webkit-scrollbar{display:none} html{scrollbar-width:none}`,
  })
}

export async function readShopifyTheme(page) {
  return page.evaluate(() => (window.Shopify && window.Shopify.theme) || null)
}

export async function toWebp(buffer, width, outPath) {
  await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath)
}

export async function composite(desktopPng, mobilePng, outPath) {
  const W = 1200, H = 627
  const desk = await sharp(desktopPng).resize({ width: 760 }).png().toBuffer()
  const mob = await sharp(mobilePng).resize({ height: 560 }).png().toBuffer()
  const mobMeta = await sharp(mob).metadata()
  await sharp({ create: { width: W, height: H, channels: 4, background: '#f5f5f7' } })
    .composite([
      { input: desk, left: 40, top: 60 },
      { input: mob, left: W - mobMeta.width - 60, top: 34 },
    ])
    .webp({ quality: 82 })
    .toFile(outPath)
}
```

- [ ] **Step 2: Main script**

`scripts/capture-gallery.mjs`:

```js
import { chromium, devices } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { discoverPdp, settle, readShopifyTheme, toWebp, composite } from './capture-helpers.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'gallery')
const sources = JSON.parse(await readFile(path.join(ROOT, 'src/data/gallery-sources.json'), 'utf8'))
const onlyIdx = process.argv.indexOf('--only')
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, outWidth: 1200 },
  mobile: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, outWidth: 780 },
}

function withPreview(url, id) {
  const u = new URL(url)
  if (id) { u.searchParams.set('preview_theme_id', id); u.searchParams.set('pb', '0') }
  return u.toString()
}

const browser = await chromium.launch()
const manifest = JSON.parse(await readFile(path.join(OUT, 'manifest.json'), 'utf8').catch(() => '{}'))

for (const src of sources) {
  if (only && src.slug !== only) continue
  const dir = path.join(OUT, src.slug)
  await mkdir(dir, { recursive: true })
  const entry = { slug: src.slug, sourceUrl: src.url, status: src.status, capturedAt: new Date().toISOString(), shots: {} }
  try {
    const pdpPath = src.pdp ?? (await discoverPdp(src.url))
    const routes = { home: '/', pdp: pdpPath }
    const png = {}
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ ...vp, locale: 'es-CO', colorScheme: 'light' })
      const page = await context.newPage()
      for (const [routeName, routePath] of Object.entries(routes)) {
        const target = withPreview(new URL(routePath, src.url).toString(), src.previewThemeId)
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 })
        if (routeName === 'home' && vpName === 'desktop') {
          const theme = await readShopifyTheme(page)
          entry.theme = theme ? { id: theme.id, name: theme.name, role: theme.role } : null
          entry.pageTitle = await page.title()
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
    console.log(`✓ ${src.slug} (${entry.theme?.name ?? 'no Shopify.theme'})`)
  } catch (err) {
    entry.error = String(err.message ?? err)
    console.error(`✗ ${src.slug}: ${entry.error}`)
  }
  manifest[src.slug] = entry
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
}
await browser.close()
```

- [ ] **Step 3: Run one store to verify**

Run: `bun run gallery:capture:one nos-cafe`
Expected: `✓ nos-cafe (DEV - Digitdeck NOS)` and five files in `public/gallery/nos-cafe/` (`home-desktop.webp`, `home-mobile.webp`, `pdp-desktop.webp`, `pdp-mobile.webp`, `linkedin.webp`). Open the four webp with the Read tool and confirm no popup covers the page and the PDP shows a product with an image.

- [ ] **Step 4: Run the full set**

Run: `bun run gallery:capture`
Expected: 18 ✓ lines and at most `alma-de-aviador` failing (password wall). For every ✗, note the reason in the summary and fall back to Task 3.

- [ ] **Step 5: Verify uniformity by script**

```bash
node -e "const m=require('./public/gallery/manifest.json');for(const [k,v] of Object.entries(m)){console.log(k,v.error?'ERR '+v.error:Object.keys(v.shots).length+' shots',v.theme?.name??'')}"
```

Expected: every non-error entry has `4 shots`.

- [ ] **Step 6: Commit images and manifest**

```bash
git add scripts public/gallery src/data/gallery-sources.json package.json
git commit -m "feat(gallery): playwright capture pipeline + first capture of the fleet"
```

---

### Task 3: Manual captures (products and any fallback)

**Files:**
- Create: `public/gallery/digitdeck-apps/`, `public/gallery/digitdeck-platform/`, `public/gallery/audit-dashboard/`
- Modify: `public/gallery/manifest.json`

- [ ] **Step 1: Digitdeck Apps and Platform via the real Chrome (logged in)**

Use `claude-in-chrome`: open `https://app.digitdeck.co` and the Shopify admin embedded app (Apps → Digitdeck) on the NOS Café store. `resize_window` to 1440×900, screenshot the module home; `resize_window` to `mobile`, screenshot again. Save each screenshot with `SendUserFile`-free paths under `scripts/.capture-cache/<slug>-<vp>.png`, then convert:

```bash
node -e "
const s=require('sharp');const fs=require('fs');
for(const slug of ['digitdeck-apps','digitdeck-platform']){fs.mkdirSync('public/gallery/'+slug,{recursive:true});
for(const [vp,w] of [['desktop',1200],['mobile',780]]){s('scripts/.capture-cache/'+slug+'-'+vp+'.png').resize({width:w}).webp({quality:80}).toFile('public/gallery/'+slug+'/home-'+vp+'.webp')}}"
```

Add to `manifest.json` entries with `"source": "manual"` and only the `home-*` shots.

- [ ] **Step 2: Audit dashboard from a local HTML**

Pick the newest `dashboard.html` under `C:\Users\Usuario\Desktop\P\Github\Digitdeck-Audits\` and capture with Playwright on `file://`:

```bash
node -e "
import('playwright').then(async ({chromium})=>{const b=await chromium.launch();
for(const [vp,w,h,dpr,ow] of [['desktop',1440,900,1,1200],['mobile',390,844,2,780]]){
const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr});const p=await c.newPage();
await p.goto('file:///'+process.argv[1].replace(/\\\\/g,'/'));await p.waitForTimeout(1500);
const buf=await p.screenshot();const s=(await import('sharp')).default;
await s(buf).resize({width:ow}).webp({quality:80}).toFile('public/gallery/audit-dashboard/home-'+vp+'.webp');await c.close()}
await b.close()})" "<absolute path to dashboard.html>"
```

- [ ] **Step 3: Alma de Aviador fallback (only if Task 2 failed for it)**

If `jgnqhc-f1.myshopify.com` shows a password page, open it in the real Chrome (Max's session bypasses the password), capture desktop/mobile home + PDP, convert as in Step 1, and mark `"source": "manual"`.

- [ ] **Step 4: Commit**

```bash
git add public/gallery
git commit -m "feat(gallery): manual captures for apps, platform, audit dashboard"
```

---

### Task 4: Registry (untranslated facts)

**Files:**
- Create: `src/data/registry.ts`

- [ ] **Step 1: Write the registry**

```ts
export type ExperienceId =
  | 'digitdeck-cto' | 'ellamau' | 'abidata' | 'rh' | 'digitdeck-fe' | 'orthofix' | 'ibox'

export interface ExperienceEntry {
  id: ExperienceId
  company: string
  location: string
  start: string          // YYYY-MM
  end: string | null     // null = present
  employment: 'full-time' | 'part-time' | 'contract'
  website?: string
  logo?: string
  technologies: string[]
  metrics: { id: string; value: string }[]   // labels live in content
}

export const experience: ExperienceEntry[] = [
  { id: 'digitdeck-cto', company: 'Digitdeck', location: 'Remote · Medellín, CO', start: '2024-06', end: null, employment: 'full-time',
    website: 'https://digitdeck.co/', logo: 'https://framerusercontent.com/images/UJJ3kd6f5grrgPCmw1YV1u0Np80.png',
    technologies: ['Shopify', 'Liquid', 'React', 'Remix', 'Vite', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'BullMQ', 'Playwright', 'GitHub Actions', 'Claude Code'],
    metrics: [{ id: 'storefronts', value: '18+' }, { id: 'modules', value: '5' }, { id: 'tests', value: '800+' }] },
  { id: 'ellamau', company: 'Ellamau', location: 'Remote', start: '2025-11', end: '2026-01', employment: 'contract',
    website: 'https://www.ellamauusa.com/', logo: 'https://www.ellamauusa.com/cdn/shop/files/logo_ellamau.png?width=400',
    technologies: ['Shopify', 'Liquid', 'JavaScript', 'CSS'],
    metrics: [{ id: 'templates', value: '15+' }, { id: 'lighthouse', value: '90+' }] },
  { id: 'abidata', company: 'ABI Data', location: 'Medellín, CO', start: '2025-02', end: '2025-10', employment: 'full-time',
    website: 'https://abidata.co/en/', logo: 'https://abidata.co/en/wp-content/uploads/2025/05/logo-abi.webp',
    technologies: ['Django', 'Next.js', 'React Email', 'PostgreSQL', 'REST'],
    metrics: [{ id: 'contacts', value: '10,000+' }, { id: 'campaignTime', value: '-40%' }, { id: 'users', value: '30+' }] },
  { id: 'rh', company: 'RH', location: 'Remote', start: '2024-02', end: '2025-01', employment: 'full-time',
    website: 'https://rh.com/', logo: 'https://companieslogo.com/img/orig/RH-b5862da2.png',
    technologies: ['React', 'TypeScript', 'Contentful', 'Adobe AEM', 'Material UI', 'Radix UI'],
    metrics: [{ id: 'components', value: '25+' }, { id: 'lighthouse', value: '70→95+' }, { id: 'savings', value: '$45k/yr' }] },
  { id: 'digitdeck-fe', company: 'Digitdeck', location: 'Remote', start: '2023-02', end: '2024-01', employment: 'full-time',
    website: 'https://digitdeck.co/', logo: 'https://framerusercontent.com/images/UJJ3kd6f5grrgPCmw1YV1u0Np80.png',
    technologies: ['Shopify', 'Liquid', 'JavaScript', 'CSS', 'SEO'],
    metrics: [{ id: 'conversion', value: '+10–20%' }, { id: 'loadTime', value: '-30–40%' }, { id: 'organic', value: '+20%' }] },
  { id: 'orthofix', company: 'Orthofix', location: 'Remote', start: '2022-09', end: '2022-12', employment: 'full-time',
    website: 'https://orthofix.com/', logo: 'https://companieslogo.com/img/orig/OFIX-c56c9c90.png',
    technologies: ['Salesforce', 'Lightning Web Components', 'Apex', 'SOQL'],
    metrics: [{ id: 'users', value: '50+' }, { id: 'dataEntry', value: '-20%' }] },
  { id: 'ibox', company: 'iBox SA', location: 'Medellín, CO', start: '2022-01', end: '2022-07', employment: 'full-time',
    website: 'https://www.iboxsm.com/',
    technologies: ['React', 'JavaScript', 'CSS'],
    metrics: [{ id: 'components', value: '20+' }, { id: 'pages', value: '10+' }, { id: 'lighthouse', value: '90+' }] },
]

export type StoreStatus = 'live' | 'dev'
export type StoreRole = 'built' | 'maintained' | 'migrated'
export interface StoreEntry {
  slug: string
  name: string
  url: string
  status: StoreStatus
  role: StoreRole
  year: number
  stack: string[]
  gallery: boolean        // images exist under /gallery/<slug>/
  legacy?: boolean        // 2023-24 era
}

export const stores: StoreEntry[] = [
  { slug: 'the-gummy-box', name: 'The Gummy Box', url: 'https://thegummyboxwellness.com', status: 'live', role: 'built', year: 2026, stack: ['Liquid', 'React islands', 'Bundles app', 'Subscriptions'], gallery: true },
  { slug: 'nos-cafe', name: 'NOS Café', url: 'https://cafesnos.com', status: 'live', role: 'built', year: 2026, stack: ['Framer → Liquid', 'React islands', 'Bundle builder', 'Klaviyo'], gallery: true },
  { slug: 'millennio', name: 'Perfumería Millennio', url: 'https://perfumeriamillennio.com', status: 'live', role: 'built', year: 2026, stack: ['Framer → Liquid', 'React islands', 'Digitdeck Track'], gallery: true },
  { slug: 'mindfuel', name: 'Mindfuel', url: 'https://joinmindfuel.com', status: 'live', role: 'built', year: 2026, stack: ['React port', 'Liquid', 'Tailwind'], gallery: true },
  { slug: 'nalua', name: 'Nalua Skincare', url: 'https://naluaskincare.co', status: 'live', role: 'built', year: 2026, stack: ['Liquid', 'Purchase offers', 'Releasit'], gallery: true },
  { slug: 'sebum', name: 'Sebum', url: 'https://www.sebumcremas.com', status: 'live', role: 'built', year: 2026, stack: ['Liquid', 'Review wall', 'React islands'], gallery: true },
  { slug: 'valdo-cafe', name: 'Valdo Café', url: 'https://valdocafe.co', status: 'live', role: 'migrated', year: 2026, stack: ['Liquid', 'Store transfer'], gallery: true },
  { slug: 'factores-2x2', name: 'Factores 2x2', url: 'https://factoresdetransferenciaacc.com.co', status: 'live', role: 'built', year: 2026, stack: ['Framer → Liquid', 'Web quality 95+'], gallery: true },
  { slug: 'pixxiesx', name: 'Pixxiesx', url: 'https://www.pixxiesx.co', status: 'live', role: 'built', year: 2026, stack: ['Liquid', 'Product quiz', 'Metaobjects'], gallery: true },
  { slug: 'luxe-shine', name: 'Luxe Shine', url: 'https://luxeshiine.com', status: 'live', role: 'built', year: 2026, stack: ['Liquid', 'Scroll video', 'Digitdeck Track'], gallery: true },
  { slug: 'atmosfera', name: 'Atmósfera Tecnológica', url: 'https://atmosferatecnologica.com', status: 'live', role: 'built', year: 2026, stack: ['Liquid', 'Catalog sync', 'Dual pricing'], gallery: true },
  { slug: 'saint-theory', name: 'Saint Theory', url: 'https://www.saint-theory.com', status: 'live', role: 'built', year: 2023, stack: ['Liquid', 'Custom theme'], gallery: true, legacy: true },
  { slug: 'peluna', name: 'Peluna Pets', url: 'https://pelunapets.com', status: 'dev', role: 'built', year: 2026, stack: ['Liquid', 'A/B testing', 'Metaobjects'], gallery: true },
  { slug: 'en-amor-a-dos', name: 'En Amor a Dos', url: 'https://enamoradosaccesorios.com', status: 'dev', role: 'built', year: 2026, stack: ['Liquid', 'React islands'], gallery: true },
  { slug: 'unik', name: 'Unik Jeans', url: 'https://www.unikjeans.com', status: 'dev', role: 'built', year: 2026, stack: ['Liquid', 'Bilingual', 'Dual currency'], gallery: true },
  { slug: 'origen-vital', name: 'Origen Vital', url: 'https://www.origenvital.com.co', status: 'dev', role: 'built', year: 2026, stack: ['Framer → Liquid', 'Quiz', 'Promo landings'], gallery: true },
  { slug: 'para-machos', name: 'Para Machos', url: 'https://www.paramachos.us', status: 'dev', role: 'built', year: 2026, stack: ['Liquid', 'React islands'], gallery: true },
  { slug: 'tierramont', name: 'TierraMont', url: 'https://tierramont.com', status: 'dev', role: 'built', year: 2026, stack: ['Liquid', 'React islands'], gallery: true },
  { slug: 'alma-de-aviador', name: 'Alma de Aviador', url: 'https://almadeaviador.com', status: 'dev', role: 'migrated', year: 2026, stack: ['WooCommerce → Shopify', 'Framer port'], gallery: true },
  { slug: 'joystaz', name: 'Joystaz Jeans', url: 'https://joystazjeans.com', status: 'live', role: 'built', year: 2025, stack: ['Liquid', 'Tailwind', 'Reviews backend'], gallery: false, legacy: true },
  { slug: 'new-urban', name: 'New Urban', url: 'https://newurbanisa.com', status: 'live', role: 'built', year: 2023, stack: ['Liquid'], gallery: false, legacy: true },
  { slug: 'gummind', name: 'Gummind', url: '', status: 'live', role: 'built', year: 2025, stack: ['Liquid', 'Tailwind'], gallery: false, legacy: true },
  { slug: 'rimo', name: 'Rimo', url: '', status: 'live', role: 'built', year: 2023, stack: ['Liquid'], gallery: false, legacy: true },
]

export interface ProductEntry {
  id: string
  name: string
  url?: string
  year: number
  stack: string[]
  gallery: boolean
}

export const products: ProductEntry[] = [
  { id: 'digitdeck-apps', name: 'Digitdeck Apps', year: 2026, stack: ['Remix', 'Shopify Functions (WASM)', 'Web Pixel', 'Theme App Extension', 'Billing API', 'Prisma', 'BullMQ'], gallery: true },
  { id: 'digitdeck-platform', name: 'Digitdeck Platform', url: 'https://app.digitdeck.co', year: 2026, stack: ['Remix', 'Prisma', 'PostgreSQL + pgvector', 'BullMQ', 'Vercel AI SDK', 'Tailwind v4'], gallery: true },
  { id: 'audit-dashboard', name: 'Audit Dashboard', year: 2026, stack: ['React', 'Vite', 'Three.js', 'Self-contained HTML'], gallery: true },
  { id: 'feedback-portal', name: 'Client Feedback Portal', year: 2026, stack: ['Next.js', 'GitHub Issues API'], gallery: false },
  { id: 'track', name: 'Digitdeck Track', year: 2026, stack: ['TypeScript', 'data-dd-* contract', 'First-party events'], gallery: false },
]

export interface PersonalProject {
  id: string
  name: string
  url?: string
  repo?: string
  year: number
  stack: string[]
}

export const personalProjects: PersonalProject[] = [
  { id: 'kotodama', name: 'Kotodama 言霊', url: 'https://kotodama-six.vercel.app', repo: 'https://github.com/Max-Bustamante69/kotodama', year: 2026, stack: ['Next.js 16', 'Drizzle', 'Neon', 'Vercel AI SDK', 'ts-fsrs'] },
  { id: 'peptidos', name: 'Peptidos', repo: 'https://github.com/Max-Bustamante69/Peptidos', year: 2026, stack: ['Headless commerce', 'React', 'Tailwind'] },
  { id: 'will-you', name: 'will-you', repo: 'https://github.com/Max-Bustamante69/will-you', year: 2026, stack: ['React', 'Vite'] },
  { id: 'fast-resoluciones', name: 'Fast Resoluciones', repo: 'https://github.com/Max-Bustamante69/fast-resoluciones', year: 2026, stack: ['React', 'PDF parsing', 'Excel'] },
  { id: 'autofill-plugin', name: 'Autofill Plugin', repo: 'https://github.com/Max-Bustamante69/autofill-plugin', year: 2026, stack: ['Browser extension', 'TypeScript'] },
  { id: 'pagui', name: 'Pagui.co', url: 'https://pagui-kyc.vercel.app/', year: 2025, stack: ['Django', 'Next.js', 'OCR', 'PostgreSQL'] },
  { id: 'scorrea', name: 'Sebastian Correa portfolio', url: 'https://www.scorrea.dev/', year: 2024, stack: ['Astro', 'TypeScript', 'Tailwind'] },
  { id: 'dr-hugo', name: 'Dr. Hugo Diazgranados', url: 'https://drhugodiazgranados.com/', year: 2023, stack: ['WordPress', 'Custom theme'] },
  { id: 'maxfolio', name: 'Maxfolio', url: 'https://www.maxfolio.dev/', repo: 'https://github.com/Max-Bustamante69/maxfolio', year: 2026, stack: ['React 19', 'Vite', 'Tailwind', 'framer-motion'] },
]

export type StatId = 'storefronts' | 'modules' | 'functions' | 'standards' | 'tests' | 'brands'
export const stats: { id: StatId; value: string }[] = [
  { id: 'storefronts', value: '18+' },
  { id: 'modules', value: '5' },
  { id: 'functions', value: '2' },
  { id: 'standards', value: '91' },
  { id: 'tests', value: '800+' },
  { id: 'brands', value: '14' },
]

export const skillGroups = {
  shopify: ['Liquid', 'Online Store 2.0', 'Theme Blocks', 'Metaobjects & metafields', 'Admin & Storefront GraphQL', 'Shopify CLI', 'Embedded apps (Remix)', 'Shopify Functions → WASM', 'Web Pixels', 'Theme App Extensions', 'App Proxy', 'Billing API', 'Store migrations'],
  frontend: ['React', 'Remix', 'Next.js', 'Vite', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'Accessibility'],
  backend: ['Node.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ', 'REST & GraphQL', 'Multi-tenant architecture'],
  quality: ['Playwright', 'Vitest', 'GitHub Actions', 'Lighthouse / Core Web Vitals'],
  cro: ['A/B testing (Bayesian, SRM)', 'First-party event instrumentation', 'AOV & funnel optimization'],
  ai: ['Claude Code', 'Codex', 'MCP', 'Multi-agent orchestration', 'Evaluation suites'],
} as const
export type SkillGroupId = keyof typeof skillGroups

export const personal = {
  name: 'Maximiliano Bustamante',
  firstName: 'Maximiliano',
  lastName: 'Bustamante',
  email: 'maxbustamanteg@gmail.com',
  phone: '+57 319 594 0522',
  phoneHref: 'tel:+573195940522',
  linkedin: 'https://www.linkedin.com/in/maximiliano-bustamante-998b77173/',
  github: 'https://github.com/Max-Bustamante69',
  site: 'https://www.maxfolio.dev/',
  cv: '/Maximiliano-Bustamante-CV.pdf',
} as const
```

- [ ] **Step 2: Type-check and commit**

Run: `bunx tsc -b`
Expected: no errors.

```bash
git add src/data/registry.ts
git commit -m "feat(data): single untranslated registry of experience, stores, products, projects"
```

---

### Task 5: Content type + English master (copywriting pass)

**Files:**
- Create: `src/content/types.ts`
- Create: `src/content/en.ts`

Before writing strings: invoke the `digitdeck-copywriting` skill and keep Max's voice — first person, direct, no hype, every claim backed by a figure that exists in the registry or the CV.

- [ ] **Step 1: The type**

`src/content/types.ts`:

```ts
import type { ExperienceId, StatId, SkillGroupId, StoreRole } from '../data/registry'

export interface PortfolioContent {
  meta: { title: string; description: string }
  hero: {
    eyebrow: string
    positioning: string
    lead: string
    availability: string
    ctaContact: string
    ctaCv: string
  }
  stats: Record<StatId, string>
  sections: {
    experience: { eyebrow: string; title: string; titleAccent: string }
    shopify: { eyebrow: string; title: string; titleAccent: string; lead: string; tabStores: string; tabProducts: string; legacyLabel: string; visit: string }
    gallery: { eyebrow: string; title: string; titleAccent: string; lead: string; filterAll: string; filterLive: string; filterDev: string; open: string; close: string; home: string; pdp: string; desktop: string; mobile: string }
    projects: { eyebrow: string; title: string; titleAccent: string }
    skills: { eyebrow: string; title: string; titleAccent: string; groups: Record<SkillGroupId, string> }
    contact: { eyebrow: string; title: string; titleAccent: string; lead: string; status: string; note: string; cta: string; email: string; phone: string; location: string }
    explore: { eyebrow: string; title: string; lead: string; viewing: string }
  }
  badges: { live: string; dev: string; current: string; roles: Record<StoreRole, string> }
  experience: Record<ExperienceId, { title: string; summary: string; highlights: string[]; metricLabels: Record<string, string> }>
  stores: Record<string, { industry: string; tagline: string }>
  products: Record<string, { tagline: string; description: string }>
  projects: Record<string, { tagline: string; description: string }>
  footer: { tagline: string; services: string[]; rights: string }
  location: string
}
```

- [ ] **Step 2: English master**

`src/content/en.ts` (complete strings; every id in the registry must appear):

```ts
import type { PortfolioContent } from './types'

export const en: PortfolioContent = {
  meta: {
    title: 'Maximiliano Bustamante | CTO & Shopify Tech Lead',
    description: 'CTO & Shopify Tech Lead at Digitdeck. 18+ Shopify storefronts, a production app suite, and the delivery system behind them. Open for Shopify CRO consulting.',
  },
  hero: {
    eyebrow: 'CTO & Shopify Tech Lead · Digitdeck',
    positioning: 'I build Shopify stores that sell, and the system that ships them.',
    lead: 'I own Shopify engineering across 18+ client storefronts and a multi-tenant app suite: Liquid themes, React islands, Shopify Functions, and the CI/QA pipeline that keeps every launch safe.',
    availability: 'Open for Shopify CRO consulting and quotes',
    ctaContact: 'Get in touch',
    ctaCv: 'Download CV',
  },
  stats: {
    storefronts: 'Shopify storefronts',
    modules: 'App modules in production',
    functions: 'Shopify Functions (WASM)',
    standards: 'Engineering standards',
    tests: 'Automated tests',
    brands: 'Brand token systems',
  },
  sections: {
    experience: { eyebrow: 'Experience', title: 'Where the work', titleAccent: 'happened' },
    shopify: { eyebrow: 'Shopify work', title: 'Storefronts, apps,', titleAccent: 'and the platform behind them', lead: 'Every store below runs code I wrote or reviewed. Live ones link to the real storefront; the rest are builds still in the client\'s pipeline.', tabStores: 'Storefronts', tabProducts: 'Apps & platform', legacyLabel: 'Earlier work', visit: 'Visit store' },
    gallery: { eyebrow: 'Gallery', title: 'Same frame,', titleAccent: 'every store', lead: 'Home and product page, desktop and mobile, captured the same way for every project so you can compare them honestly.', filterAll: 'All', filterLive: 'Live', filterDev: 'In development', open: 'Open gallery', close: 'Close', home: 'Home', pdp: 'Product page', desktop: 'Desktop', mobile: 'Mobile' },
    projects: { eyebrow: 'Projects', title: 'Things I build', titleAccent: 'on my own time' },
    skills: { eyebrow: 'Skills', title: 'What I', titleAccent: 'work with', groups: { shopify: 'Shopify', frontend: 'Frontend', backend: 'Backend', quality: 'Testing & CI/CD', cro: 'CRO & analytics', ai: 'AI engineering' } },
    contact: { eyebrow: 'Contact', title: 'Want more', titleAccent: 'from your store?', lead: 'If your Shopify store gets traffic but not enough orders, I can find where it leaks and fix it: speed, offers, A/B tests, checkout friction.', status: 'Available for consulting', note: 'US and LATAM brands. Reply within one business day.', cta: 'Send a message', email: 'Email', phone: 'Phone', location: 'Location' },
    explore: { eyebrow: 'Explore', title: 'Same portfolio, four designs', lead: 'Pick the aesthetic you prefer. The content is identical.', viewing: 'Currently viewing' },
  },
  badges: { live: 'Live', dev: 'In development', current: 'Current', roles: { built: 'Built', maintained: 'Maintained', migrated: 'Migrated' } },
  experience: {
    'digitdeck-cto': {
      title: 'CTO & Shopify Technical Lead',
      summary: 'I set the engineering standard for a Shopify agency and build the delivery system itself: component libraries, automated QA, CI/CD, and AI-agent tooling.',
      highlights: [
        'Standardized a hybrid Liquid + React islands architecture with a 33-component shared library and design tokens spanning 14 brands.',
        'Built a multi-tenant Shopify app suite on the official Remix stack: A/B testing, reviews, bundles, referrals, back-in-stock, and a subscription billing engine with 800+ automated tests.',
        'Shipped Shopify Functions compiled to WASM, a consent-gated Web Pixel, and Theme App Extensions.',
        'Led WooCommerce-to-Shopify and staging-to-production migrations; re-platformed an 11,000-line Liquid theme into React islands with verified visual parity.',
        'Built GitHub Actions pipelines and a Playwright harness that behaviorally tests whole storefronts with 40+ Shopify-specific checks.',
        'Researched 59 DTC brands into a 70-pattern conversion library and authored the agency\'s Bayesian A/B testing methodology.',
      ],
      metricLabels: { storefronts: 'Storefronts', modules: 'App modules', tests: 'Automated tests' },
    },
    ellamau: {
      title: 'Lead Shopify Developer',
      summary: 'Full Shopify storefront build for a US fashion brand, from planning to deployment.',
      highlights: ['Modular Liquid sections with reusable blocks and configurable schemas.', '15+ responsive templates, mobile first.', 'Lighthouse scores above 90 after optimization.'],
      metricLabels: { templates: 'Templates', lighthouse: 'Lighthouse' },
    },
    abidata: {
      title: 'Full Stack Developer',
      summary: 'Internal platform to create, customize, and send enterprise newsletters.',
      highlights: ['React email editor that cut campaign creation time by about 40%.', '10,000+ contact records and hundreds of active campaigns.', 'Owned the REST APIs from design to deployment.'],
      metricLabels: { contacts: 'Contacts', campaignTime: 'Campaign time', users: 'Internal users' },
    },
    rh: {
      title: 'Frontend Developer',
      summary: 'Enterprise CMS migration from Adobe AEM to Contentful for a large retailer.',
      highlights: ['25+ reusable components enabling the migration.', 'Accessibility work took Lighthouse from ~70 to 95+.', 'Reduced content-authoring costs by roughly $45,000 a year.'],
      metricLabels: { components: 'Components', lighthouse: 'Lighthouse', savings: 'Savings' },
    },
    'digitdeck-fe': {
      title: 'Frontend Developer (Shopify)',
      summary: 'Built and optimized Shopify storefronts with custom Liquid themes.',
      highlights: ['Custom sections, blocks, and snippets for 4+ storefronts.', 'UX and checkout work lifted conversion 10–20%.', 'Page loads 30–40% faster; organic traffic up 20%+.'],
      metricLabels: { conversion: 'Conversion', loadTime: 'Load time', organic: 'Organic traffic' },
    },
    orthofix: {
      title: 'Salesforce Developer',
      summary: 'Internal healthcare applications for patient and operations workflows.',
      highlights: ['Lightning Web Components used by 50+ internal users.', 'Workflows over thousands of patient and device records.', 'About 20% less manual data entry.'],
      metricLabels: { users: 'Users', dataEntry: 'Manual entry' },
    },
    ibox: {
      title: 'Frontend React Developer',
      summary: 'Company website for smart-locker solutions in US and LATAM markets.',
      highlights: ['20+ reusable React components and 10+ responsive pages.', 'Lighthouse 90+ and ~35% faster loads.'],
      metricLabels: { components: 'Components', pages: 'Pages', lighthouse: 'Lighthouse' },
    },
  },
  stores: {
    'the-gummy-box': { industry: 'Functional gummies', tagline: 'Bundle builder wired to our Bundles module, subscriptions, first-party tracking.' },
    'nos-cafe': { industry: 'Specialty coffee', tagline: 'Framer design ported 1:1 to Liquid, box builder with tiered discounts.' },
    millennio: { industry: 'Perfumery', tagline: 'Framer port on React islands, 260+ tracked elements.' },
    mindfuel: { industry: 'Nootropics', tagline: 'Full React V2 port, promoted to live.' },
    nalua: { industry: 'Skincare', tagline: 'Purchase offers and quantity tiers, Releasit COD.' },
    sebum: { industry: 'Skincare', tagline: 'V2 rebuild with an extensible review wall.' },
    'valdo-cafe': { industry: 'Coffee', tagline: 'Transferred from a dummy store to the real one and promoted.' },
    'factores-2x2': { industry: 'Supplements', tagline: 'Framer to Liquid, web-quality pass to 95+.' },
    pixxiesx: { industry: 'Fashion', tagline: 'Product quiz, metaobject-driven PDP, same-day delivery.' },
    'luxe-shine': { industry: 'Beauty', tagline: 'Scroll-driven video hero, Track retrofit.' },
    atmosfera: { industry: 'Computers', tagline: 'Catalog sync from supplier lists, dual pricing.' },
    'saint-theory': { industry: 'Streetwear', tagline: 'Custom Liquid theme, still live.' },
    peluna: { industry: 'Pet care', tagline: 'Redesign on the Digitdeck template with A/B testing.' },
    'en-amor-a-dos': { industry: 'Jewelry', tagline: '57 custom sections on React islands.' },
    unik: { industry: 'Denim', tagline: 'Bilingual, dual-currency storefront with bulk catalog i18n.' },
    'origen-vital': { industry: 'Supplements', tagline: 'Framer port, product quiz, 302 seeded reviews, promo landings.' },
    'para-machos': { industry: 'Men\'s grooming', tagline: 'New Digitdeck theme in development.' },
    tierramont: { industry: 'Outdoor', tagline: 'New theme in development for the real store.' },
    'alma-de-aviador': { industry: 'Apparel', tagline: 'WooCommerce to Shopify migration with a Framer port.' },
    joystaz: { industry: 'Denim', tagline: 'Tailwind Liquid theme with a custom reviews backend.' },
    'new-urban': { industry: 'Fashion', tagline: 'Early Digitdeck storefront.' },
    gummind: { industry: 'Wellness', tagline: 'Skeleton-theme storefront.' },
    rimo: { industry: 'Retail', tagline: 'Early Digitdeck storefront.' },
  },
  products: {
    'digitdeck-apps': { tagline: 'One install, five modules', description: 'Multi-tenant Shopify app on the official Remix stack: back in stock, bundles, referrals, reviews, A/B testing. Two Shopify Functions, a consent-gated Web Pixel, and a Theme App Extension.' },
    'digitdeck-platform': { tagline: 'The agency\'s operating system', description: 'Modular monolith with tenant isolation, a module registry, RBAC, and a BYO-AI gateway. Live at app.digitdeck.co.' },
    'audit-dashboard': { tagline: 'Audits clients can open offline', description: 'Renders a self-contained HTML dashboard from audit data, brand theme, and screenshots. No CDN, no external requests.' },
    'feedback-portal': { tagline: 'Client feedback as GitHub issues', description: 'Private multi-client portal where every report becomes a standardized issue on the right board.' },
    track: { tagline: 'First-party events by convention', description: 'A data-dd-* contract every section follows, feeding the Optimize dashboard and the A/B testing module.' },
  },
  projects: {
    kotodama: { tagline: 'Learn Japanese as a JRPG', description: 'Zero to JLPT N1 with spaced repetition, listening, kanji, and reading quests.' },
    peptidos: { tagline: 'Headless commerce, clinical design', description: 'Minimal, glass-and-grayscale storefront for a research-peptide brand.' },
    'will-you': { tagline: 'A small yes-or-no site', description: 'Weekend build.' },
    'fast-resoluciones': { tagline: 'PDF to Excel, automatically', description: 'Extracts users and IDs from resolution PDFs and fills spreadsheets.' },
    'autofill-plugin': { tagline: 'Browser autofill helper', description: 'Fills repetitive forms from saved profiles.' },
    pagui: { tagline: 'OCR onboarding', description: 'Identity registration with OCR for bank clients.' },
    scorrea: { tagline: 'Developer portfolio', description: 'Astro site for a senior software developer.' },
    'dr-hugo': { tagline: 'Cosmetic dentist site', description: 'Services and booking presence for a dental practice.' },
    maxfolio: { tagline: 'This site', description: 'Four design languages, one content model, three languages.' },
  },
  footer: { tagline: 'Shopify engineering, measured.', services: ['Shopify storefronts', 'Shopify apps', 'CRO & A/B testing', 'Store migrations', 'Performance'], rights: 'All rights reserved.' },
  location: 'Medellín, Colombia',
}
```

- [ ] **Step 3: Type-check and commit**

Run: `bunx tsc -b` → no errors.

```bash
git add src/content
git commit -m "feat(content): typed English master content"
```

---

### Task 6: Spanish and Japanese content

**Files:**
- Create: `src/content/es.ts`, `src/content/ja.ts`
- Create: `src/content/index.ts`

Same skill rules: ES written natively (tuteo, Colombian register, no literal translation); JA as a Japanese tech résumé (です・ます, tech terms in English/katakana as the industry writes them, numbers half-width).

- [ ] **Step 1: `src/content/es.ts`** — copy the EN object, keep every key, replace every string. Hero for reference:

```ts
hero: {
  eyebrow: 'CTO & Shopify Tech Lead · Digitdeck',
  positioning: 'Construyo tiendas Shopify que venden, y el sistema que las entrega.',
  lead: 'Llevo la ingeniería Shopify de 18+ tiendas de clientes y de una suite de apps multi-tenant: temas Liquid, islas React, Shopify Functions y el pipeline de CI/QA que hace seguro cada lanzamiento.',
  availability: 'Disponible para consultoría CRO en Shopify y cotizaciones',
  ctaContact: 'Escríbeme',
  ctaCv: 'Descargar CV',
},
```

- [ ] **Step 2: `src/content/ja.ts`** — same, hero for reference:

```ts
hero: {
  eyebrow: 'CTO & Shopify Tech Lead · Digitdeck',
  positioning: '売れるShopifyストアと、それを届ける仕組みをつくっています。',
  lead: '18以上のクライアントストアとマルチテナントのアプリ群のShopifyエンジニアリングを統括しています。LiquidテーマとReactアイランド、Shopify Functions、そしてすべてのリリースを安全にするCI/QAパイプラインまで。',
  availability: 'Shopify CROコンサルティング・お見積り受付中',
  ctaContact: 'お問い合わせ',
  ctaCv: 'CVをダウンロード',
},
```

- [ ] **Step 3: `src/content/index.ts`**

```ts
import type { Locale } from '../context/LanguageContext'
import type { PortfolioContent } from './types'
import { en } from './en'
import { es } from './es'
import { ja } from './ja'

export const CONTENT: Record<Locale, PortfolioContent> = { en, es, ja }
export type { PortfolioContent }
```

- [ ] **Step 4: Type-check (this is the parity test — a missing key fails here) and commit**

Run: `bunx tsc -b` → no errors.

```bash
git add src/content
git commit -m "feat(content): Spanish and Japanese content with full key parity"
```

---

### Task 7: `useContent` hook + UI chrome strings

**Files:**
- Create: `src/hooks/useContent.ts`
- Modify: `src/hooks/index.ts`
- Modify: `public/locales/en.json`, `es.json`, `ja.json`

- [ ] **Step 1: Hook**

```ts
import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { CONTENT } from '../content'
import * as registry from '../data/registry'

const INTL: Record<string, string> = { en: 'en-US', es: 'es-CO', ja: 'ja-JP' }

export function useContent() {
  const { locale } = useLanguage()
  return useMemo(() => {
    const strings = CONTENT[locale]
    const fmt = new Intl.DateTimeFormat(INTL[locale], { month: 'short', year: 'numeric' })
    const present = { en: 'Present', es: 'Actualidad', ja: '現在' }[locale]
    const formatPeriod = (start: string, end: string | null) =>
      `${fmt.format(new Date(`${start}-01`))} – ${end ? fmt.format(new Date(`${end}-01`)) : present}`
    return { strings, registry, formatPeriod, locale }
  }, [locale])
}
```

- [ ] **Step 2: Export from `src/hooks/index.ts`**

```ts
export { useDynamicFavicon } from './useDynamicFavicon'
export { useI18n } from './useI18n'
export { useContent } from './useContent'
```

- [ ] **Step 3: Add chrome strings to the three locale JSONs** (same keys, translated):

```json
"nav": { "...existing": "...", "shopify": "Shopify", "gallery": "Gallery", "projects": "Projects" },
"menuPage": { "...existing": "...", "designNames": { "luxuryMinimal": "Luxury Minimal", "brutalistEditorial": "Brutalist Editorial", "apple": "Apple Clean" }, "designSubtitles": { "luxuryMinimal": "Elegant & Refined", "brutalistEditorial": "Bold & Raw", "apple": "Quiet & Precise" }, "whyVersions": "Why four versions?", "whyVersionsDesc": "Different aesthetics for different contexts. Same skills, proven versatility." },
"logoSelector": { "...existing": "...", "apple": "Apple Clean" }
```

ES: `"apple": "Apple Clean"`, subtitle `"Silencioso y preciso"`, `"whyVersions": "¿Por qué cuatro versiones?"`, nav `"gallery": "Galería"`, `"projects": "Proyectos"`. JA: subtitle `"静かで正確"`, `"whyVersions": "なぜ4つのデザイン？"`, nav `"gallery": "ギャラリー"`, `"projects": "プロジェクト"`.

- [ ] **Step 4: Type-check, commit**

```bash
git add src/hooks public/locales
git commit -m "feat(i18n): useContent hook and chrome strings for the new sections"
```

---

### Task 8: Design registry + previews + explore/menus on top of it

**Files:**
- Create: `src/data/designs.ts`
- Create: `src/components/previews/ApplePreview.tsx`
- Create: `public/favicon-apple.svg`
- Modify: `src/components/previews/index.ts`, `src/hooks/useDynamicFavicon.ts`, `src/App.tsx`, `src/pages/Home.tsx`, `src/components/sections/ExploreDesignsLuxury.tsx`, `ExploreDesignsBrutalist.tsx`, `src/components/common/LogoSelectorLuxury.tsx`, `LogoSelectorBrutalist.tsx`, `MobileMenuLuxury.tsx`, `MobileMenuBrutalist.tsx`
- Delete: `src/components/sections/ExploreDesigns.tsx` (unused generic)

- [ ] **Step 1: Registry**

```ts
import type { ComponentType } from 'react'
import { LuxuryPreview, BrutalistPreview, ApplePreview } from '../components/previews'

export type DesignId = 'apple' | 'luxury' | 'brutalist'

export interface DesignEntry {
  id: DesignId
  route: string
  nameKey: string        // i18n key in locales json
  subtitleKey: string
  accent: string
  transitionColor: string
  transitionAccent: string
  favicon: string
  isDefault: boolean
  Preview: ComponentType<{ isHovered?: boolean; size?: 'sm' | 'md' | 'lg' }>
}

export const designs: DesignEntry[] = [
  { id: 'apple', route: '/', nameKey: 'menuPage.designNames.apple', subtitleKey: 'menuPage.designSubtitles.apple', accent: '#0071e3', transitionColor: '#fbfbfd', transitionAccent: '#0071e3', favicon: '/favicon-apple.svg', isDefault: true, Preview: ApplePreview },
  { id: 'luxury', route: '/luxury', nameKey: 'menuPage.designNames.luxuryMinimal', subtitleKey: 'menuPage.designSubtitles.luxuryMinimal', accent: '#C9A962', transitionColor: '#FAF8F5', transitionAccent: '#C9A962', favicon: '/favicon-luxury.svg', isDefault: false, Preview: LuxuryPreview },
  { id: 'brutalist', route: '/brutalist', nameKey: 'menuPage.designNames.brutalistEditorial', subtitleKey: 'menuPage.designSubtitles.brutalistEditorial', accent: '#dc2626', transitionColor: '#1c1917', transitionAccent: '#dc2626', favicon: '/favicon-brutalist.svg', isDefault: false, Preview: BrutalistPreview },
]

export const MENU = { route: '/menu', favicon: '/favicon-menu.svg' }
export const otherDesigns = (current: DesignId) => designs.filter((d) => d.id !== current)
export const designById = (id: DesignId) => designs.find((d) => d.id === id)!
```

- [ ] **Step 2: `ApplePreview.tsx`** (same props as `LuxuryPreview`)

```tsx
import { motion } from 'framer-motion'

export function ApplePreview({ isHovered = false, size = 'md' }: { isHovered?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.8 : size === 'lg' ? 1.15 : 1
  return (
    <div className="w-full h-full bg-[#fbfbfd] relative overflow-hidden flex items-center justify-center">
      <motion.div className="absolute inset-x-6 top-4 h-2 rounded-full bg-black/5" animate={{ opacity: isHovered ? 1 : 0.6 }} />
      <div className="relative z-10 text-center" style={{ transform: `scale(${scale})` }}>
        <motion.div className="mx-auto mb-2 w-10 h-10 rounded-[12px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]" animate={{ y: isHovered ? -2 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
        <p className="text-[#1d1d1f] text-sm font-semibold tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' }}>Apple Clean</p>
        <motion.p className="text-[10px] text-[#0071e3]" animate={{ opacity: isHovered ? 1 : 0.7 }}>Learn more ›</motion.p>
      </div>
    </div>
  )
}
```

Export it from `src/components/previews/index.ts` and from `src/components/index.ts`.

- [ ] **Step 3: `public/favicon-apple.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#fbfbfd"/><text x="32" y="41" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-size="26" font-weight="600" fill="#1d1d1f">MB</text></svg>
```

- [ ] **Step 4: `useDynamicFavicon`** — replace the two maps with the registry:

```ts
import { designs, MENU, type DesignId } from '../data/designs'
type FaviconType = DesignId | 'menu' | 'default'
const favicons: Record<FaviconType, string> = {
  ...Object.fromEntries(designs.map((d) => [d.id, d.favicon])) as Record<DesignId, string>,
  menu: MENU.favicon,
  default: '/favicon.svg',
}
const titles: Record<FaviconType, string> = { apple: 'MB | Portfolio', luxury: 'MB | Luxury Portfolio', brutalist: 'MB | Brutalist Portfolio', menu: 'MB | Design Menu', default: 'MB | Portfolio' }
```

(keep the effect body unchanged).

- [ ] **Step 5: Routes in `App.tsx`**

```tsx
import Apple from './pages/Apple'
...
<Route path="/" element={<Apple />} />
<Route path="/luxury" element={<Design4 />} />
<Route path="/brutalist" element={<Design1 />} />
<Route path="/menu" element={<Home />} />
<Route path="/1" element={<Design4 />} />
<Route path="/2" element={<Design1 />} />
```

(`Apple.tsx` is created in Task 11; until then export a placeholder `export default function Apple(){return null}` so the build stays green.)

- [ ] **Step 6: `Home.tsx`** — replace the hardcoded `designs` array with `import { designs } from '../data/designs'`; the card loop uses `t(design.nameKey)` / `t(design.subtitleKey)`, `design.Preview`, `design.transitionColor`, `design.accent`; `visionStyles` gets a third entry `{ id: 3, text: 'Clean', className: 'font-body font-semibold tracking-tight text-[#0071e3]' }` and the i18n key `menuPage.visionStyles.clean` ("Clean" / "Limpio" / "クリーン") added to the three JSONs; `whyTwoVersions*` keys renamed to `whyVersions*`; the "Main portfolio" link and "Start with default" link use `designs.find(d => d.isDefault)!`. Grid becomes `sm:grid-cols-2 lg:grid-cols-3`.

- [ ] **Step 7: Explore sections** — `ExploreDesignsLuxury` and `ExploreDesignsBrutalist` map over `otherDesigns('luxury' | 'brutalist')` plus the menu card, keeping each theme's card markup (delete the hand-written Brutalist/Menu cards and render the loop). The "currently viewing" line reads `t(designById(current).nameKey)`. Delete `ExploreDesigns.tsx` and its export.

- [ ] **Step 8: Logo selectors and mobile menus** — in `LogoSelectorLuxury`/`LogoSelectorBrutalist` the dropdown lists `designs` (all four rows including the current one marked active) and the menu link; in `MobileMenuLuxury`/`MobileMenuBrutalist` the "other styles" links come from `otherDesigns(...)`. Labels via `t(nameKey)`.

- [ ] **Step 9: Build, click through in the preview**

Run: `bun run build` → green. Start `bun dev`, open `/menu`: three cards, "Apple Clean" marked Default; `/luxury` explore section shows Apple + Brutalist + Menu cards; the logo dropdown lists four entries.

- [ ] **Step 10: Commit**

```bash
git add -A src public/favicon-apple.svg
git commit -m "refactor(designs): single design registry drives routes, menu, explore, selectors, favicons"
```

---

### Task 9: Gallery components (frame, lightbox, skins)

**Files:**
- Create: `src/components/gallery/skins.ts`, `ProjectFrame.tsx`, `GalleryLightbox.tsx`, `index.ts`
- Modify: `src/components/index.ts`, `src/styles/index.css`

- [ ] **Step 1: Skins**

```ts
export type FrameStyle = 'apple' | 'luxury' | 'brutalist'
export interface Skin {
  frame: FrameStyle
  card: string        // card container classes
  title: string       // project name classes
  muted: string
  accent: string
  chip: string
  badgeLive: string
  badgeDev: string
}
export const skins: Record<FrameStyle, (isDark: boolean) => Skin> = {
  apple: (d) => ({ frame: 'apple', card: `rounded-[22px] ${d ? 'bg-[#1d1d1f]' : 'bg-white'} shadow-[0_4px_24px_rgba(0,0,0,0.06)]`, title: `font-semibold tracking-tight ${d ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`, muted: d ? 'text-[#a1a1a6]' : 'text-[#86868b]', accent: d ? 'text-[#2997ff]' : 'text-[#0071e3]', chip: `rounded-full px-2.5 py-1 text-[11px] ${d ? 'bg-white/10 text-[#d2d2d7]' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`, badgeLive: 'bg-[#34c759] text-white', badgeDev: 'bg-[#ff9f0a] text-white' }),
  luxury: (d) => ({ frame: 'luxury', card: `border ${d ? 'border-deco-gold/20 bg-deco-navy/30' : 'border-luxury-black/10 bg-white/60'}`, title: `font-display ${d ? 'text-deco-cream' : 'text-luxury-black'}`, muted: d ? 'text-deco-cream/50' : 'text-luxury-black/50', accent: d ? 'text-deco-gold' : 'text-luxury-gold', chip: `border px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${d ? 'border-deco-gold/20 text-deco-cream/60' : 'border-luxury-black/10 text-luxury-black/60'}`, badgeLive: d ? 'bg-deco-gold text-deco-navy' : 'bg-luxury-black text-luxury-cream', badgeDev: `border ${d ? 'border-deco-gold text-deco-gold' : 'border-luxury-gold text-luxury-gold'}` }),
  brutalist: (d) => ({ frame: 'brutalist', card: `border-2 ${d ? 'border-stone-700 bg-stone-900' : 'border-stone-900 bg-stone-100'}`, title: 'font-editorial italic text-xl', muted: 'text-stone-500', accent: 'text-red-600', chip: `font-mono text-[10px] px-2 py-1 ${d ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-600'}`, badgeLive: 'bg-red-600 text-white font-mono uppercase', badgeDev: 'border-2 border-red-600 text-red-600 font-mono uppercase' }),
}
```

- [ ] **Step 2: `ProjectFrame.tsx`**

```tsx
import { useState } from 'react'
import type { Skin } from './skins'

export interface FrameShots { homeDesktop: string; pdpDesktop?: string; homeMobile: string; pdpMobile?: string }
interface Props { name: string; url?: string; shots: FrameShots; skin: Skin; onOpen?: () => void; alt: string }

const RADIUS: Record<Skin['frame'], { desktop: string; mobile: string }> = {
  apple: { desktop: 'rounded-[12px]', mobile: 'rounded-[28px]' },
  luxury: { desktop: 'rounded-none', mobile: 'rounded-[24px]' },
  brutalist: { desktop: 'rounded-none', mobile: 'rounded-none' },
}

export function ProjectFrame({ name, url, shots, skin, onOpen, alt }: Props) {
  const [hover, setHover] = useState(false)
  const r = RADIUS[skin.frame]
  const host = url ? new URL(url).host : ''
  return (
    <button type="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="group relative w-full text-left" aria-label={`${name}: open gallery`}>
      {/* desktop browser frame */}
      <div className={`relative overflow-hidden ${r.desktop} ${skin.frame === 'brutalist' ? 'border-2 border-current' : 'ring-1 ring-black/10'} bg-[#e8e8ed]`}>
        <div className="flex items-center gap-1.5 px-3 h-7 text-[10px] text-black/40">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" /><span className="w-2 h-2 rounded-full bg-[#febc2e]" /><span className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate rounded bg-white/70 px-2 py-0.5">{host}</span>
        </div>
        <div className="relative aspect-[16/10] bg-white">
          <img src={shots.homeDesktop} alt={`${alt} — home, desktop`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top" />
          {shots.pdpDesktop && (
            <img src={shots.pdpDesktop} alt={`${alt} — product page, desktop`} loading="lazy" decoding="async"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>
      </div>
      {/* phone frame, overlapping bottom-right */}
      <div className={`absolute -bottom-4 right-3 w-[22%] min-w-[72px] overflow-hidden ${r.mobile} border-[3px] border-[#1d1d1f] bg-black shadow-xl`}>
        <div className="relative aspect-[390/844]">
          <img src={shots.homeMobile} alt={`${alt} — home, mobile`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top" />
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: `GalleryLightbox.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface LightboxItem { key: string; label: string; src: string; kind: 'desktop' | 'mobile' }
interface Props { open: boolean; title: string; items: LightboxItem[]; onClose: () => void; closeLabel: string }

export function GalleryLightbox({ open, title, items, onClose, closeLabel }: Props) {
  const [i, setI] = useState(0)
  useEffect(() => { if (open) setI(0) }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % items.length)
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, items.length, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex flex-col"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-white">
            <p className="text-sm font-medium truncate">{title} · {items[i]?.label}</p>
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-full bg-white/10 hover:bg-white/20">{closeLabel}</button>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <motion.img key={items[i]?.key} src={items[i]?.src} alt={`${title} — ${items[i]?.label}`}
              className={`max-h-full max-w-full object-contain ${items[i]?.kind === 'mobile' ? 'rounded-[28px]' : 'rounded-lg'}`}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} />
          </div>
          <div className="flex justify-center gap-2 py-3" onClick={(e) => e.stopPropagation()}>
            {items.map((it, idx) => (
              <button key={it.key} onClick={() => setI(idx)} aria-label={it.label}
                className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: `index.ts` + root export**, then build.

```ts
export { ProjectFrame } from './ProjectFrame'
export type { FrameShots } from './ProjectFrame'
export { GalleryLightbox } from './GalleryLightbox'
export type { LightboxItem } from './GalleryLightbox'
export { skins } from './skins'
export type { Skin, FrameStyle } from './skins'
```

Run: `bun run build` → green.

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery src/components/index.ts
git commit -m "feat(gallery): ProjectFrame device frames, lightbox, per-theme skins"
```

---

### Task 10: Shared sections `ShopifyWork` and `Gallery`

**Files:**
- Create: `src/components/sections/ShopifyWork.tsx`, `src/components/sections/Gallery.tsx`
- Modify: `src/components/sections/index.ts`, `src/components/index.ts`

- [ ] **Step 1: A helper that turns a slug into shots** (top of `Gallery.tsx`, exported)

```ts
import type { FrameShots, LightboxItem } from '../gallery'
export const shotsFor = (slug: string, withPdp = true): FrameShots => ({
  homeDesktop: `/gallery/${slug}/home-desktop.webp`,
  homeMobile: `/gallery/${slug}/home-mobile.webp`,
  ...(withPdp ? { pdpDesktop: `/gallery/${slug}/pdp-desktop.webp`, pdpMobile: `/gallery/${slug}/pdp-mobile.webp` } : {}),
})
export const lightboxItems = (slug: string, labels: { home: string; pdp: string; desktop: string; mobile: string }, withPdp = true): LightboxItem[] => [
  { key: 'hd', label: `${labels.home} · ${labels.desktop}`, src: `/gallery/${slug}/home-desktop.webp`, kind: 'desktop' },
  ...(withPdp ? [{ key: 'pd', label: `${labels.pdp} · ${labels.desktop}`, src: `/gallery/${slug}/pdp-desktop.webp`, kind: 'desktop' as const }] : []),
  { key: 'hm', label: `${labels.home} · ${labels.mobile}`, src: `/gallery/${slug}/home-mobile.webp`, kind: 'mobile' },
  ...(withPdp ? [{ key: 'pm', label: `${labels.pdp} · ${labels.mobile}`, src: `/gallery/${slug}/pdp-mobile.webp`, kind: 'mobile' as const }] : []),
]
```

- [ ] **Step 2: `Gallery.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, GalleryLightbox, type Skin } from '../gallery'

interface Props { skin: Skin; heading: (eyebrow: string, title: string, accent: string, lead: string) => React.ReactNode }
type Filter = 'all' | 'live' | 'dev'

export function Gallery({ skin, heading }: Props) {
  const { strings, registry } = useContent()
  const g = strings.sections.gallery
  const [filter, setFilter] = useState<Filter>('all')
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const items = useMemo(() => registry.stores.filter((s) => s.gallery && (filter === 'all' || s.status === filter)), [filter, registry.stores])
  const open = openSlug ? registry.stores.find((s) => s.slug === openSlug) : null
  return (
    <section id="gallery" className="scroll-mt-20">
      {heading(g.eyebrow, g.title, g.titleAccent, g.lead)}
      <div className="flex gap-2 mb-8" role="tablist" aria-label={g.eyebrow}>
        {(['all', 'live', 'dev'] as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
            className={`${skin.chip} ${filter === f ? skin.accent + ' ring-1 ring-current' : ''}`}>
            {f === 'all' ? g.filterAll : f === 'live' ? g.filterLive : g.filterDev}
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {items.map((s, idx) => (
          <motion.article key={s.slug} layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (idx % 3) * 0.05 }}
            className={`${skin.card} p-4 pb-5`}>
            <ProjectFrame name={s.name} url={s.url || undefined} shots={shotsFor(s.slug)} skin={skin} onOpen={() => setOpenSlug(s.slug)} alt={s.name} />
            <div className="mt-8 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className={`${skin.title} text-base truncate`}>{s.name}</h3>
                <p className={`${skin.muted} text-xs`}>{strings.stores[s.slug]?.industry} · {s.year} · {strings.badges.roles[s.role]}</p>
              </div>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${s.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>{s.status === 'live' ? strings.badges.live : strings.badges.dev}</span>
            </div>
          </motion.article>
        ))}
      </motion.div>
      <GalleryLightbox open={!!open} title={open?.name ?? ''} items={open ? lightboxItems(open.slug, g) : []} onClose={() => setOpenSlug(null)} closeLabel={g.close} />
    </section>
  )
}
```

- [ ] **Step 3: `ShopifyWork.tsx`**

```tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, GalleryLightbox, type Skin } from '../gallery'
import { shotsFor, lightboxItems } from './Gallery'

interface Props { skin: Skin; heading: (eyebrow: string, title: string, accent: string, lead: string) => React.ReactNode }

export function ShopifyWork({ skin, heading }: Props) {
  const { strings, registry } = useContent()
  const s = strings.sections.shopify
  const [tab, setTab] = useState<'stores' | 'products'>('stores')
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const fleet = registry.stores.filter((x) => !x.legacy)
  const legacy = registry.stores.filter((x) => x.legacy)
  const open = openSlug ? registry.stores.find((x) => x.slug === openSlug) ?? registry.products.find((p) => p.id === openSlug) : null
  const openIsProduct = !!open && 'id' in open

  const StoreRow = ({ st }: { st: (typeof fleet)[number] }) => (
    <article className={`${skin.card} p-4 flex flex-col gap-3`}>
      {st.gallery ? (
        <ProjectFrame name={st.name} url={st.url || undefined} shots={shotsFor(st.slug)} skin={skin} onOpen={() => setOpenSlug(st.slug)} alt={st.name} />
      ) : (
        <div className={`aspect-[16/10] flex items-center justify-center ${skin.muted} text-xs`}>{strings.badges.roles[st.role]} · {st.year}</div>
      )}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`${skin.title} text-base`}>{st.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.status === 'live' ? skin.badgeLive : skin.badgeDev}`}>{st.status === 'live' ? strings.badges.live : strings.badges.dev}</span>
        </div>
        <p className={`${skin.muted} text-xs mt-0.5`}>{strings.stores[st.slug]?.industry} · {st.year}</p>
        <p className="text-sm mt-2">{strings.stores[st.slug]?.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">{st.stack.map((t) => <span key={t} className={skin.chip}>{t}</span>)}</div>
        {st.url && <a href={st.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} text-sm mt-3 inline-block`}>{s.visit} ›</a>}
      </div>
    </article>
  )

  return (
    <section id="shopify" className="scroll-mt-20">
      {heading(s.eyebrow, s.title, s.titleAccent, s.lead)}
      <div className="flex gap-2 mb-8" role="tablist">
        {(['stores', 'products'] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`${skin.chip} ${tab === k ? skin.accent + ' ring-1 ring-current' : ''}`}>
            {k === 'stores' ? s.tabStores : s.tabProducts}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {tab === 'stores' ? (
          <motion.div key="stores" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{fleet.map((st) => <StoreRow key={st.slug} st={st} />)}</div>
            <p className={`${skin.muted} text-xs tracking-[0.2em] uppercase mt-12 mb-4`}>{s.legacyLabel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{legacy.map((st) => <StoreRow key={st.slug} st={st} />)}</div>
          </motion.div>
        ) : (
          <motion.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registry.products.map((p) => (
              <article key={p.id} className={`${skin.card} p-4`}>
                {p.gallery && <ProjectFrame name={p.name} url={p.url} shots={shotsFor(p.id, false)} skin={skin} onOpen={() => setOpenSlug(p.id)} alt={p.name} />}
                <div className={p.gallery ? 'mt-8' : ''}>
                  <h3 className={`${skin.title} text-lg`}>{p.name}</h3>
                  <p className={`${skin.accent} text-sm`}>{strings.products[p.id]?.tagline}</p>
                  <p className="text-sm mt-2">{strings.products[p.id]?.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">{p.stack.map((t) => <span key={t} className={skin.chip}>{t}</span>)}</div>
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} text-sm mt-3 inline-block`}>{s.visit} ›</a>}
                </div>
              </article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <GalleryLightbox open={!!open} title={open?.name ?? ''} items={open ? lightboxItems(openIsProduct ? (open as { id: string }).id : (open as { slug: string }).slug, strings.sections.gallery, !openIsProduct) : []} onClose={() => setOpenSlug(null)} closeLabel={strings.sections.gallery.close} />
    </section>
  )
}
```

- [ ] **Step 4: Exports, build, commit**

`src/components/sections/index.ts` adds `export { ShopifyWork } from './ShopifyWork'` and `export { Gallery, shotsFor, lightboxItems } from './Gallery'`; root index re-exports `ShopifyWork, Gallery`.

Run: `bun run build` → green.

```bash
git add src/components/sections src/components/index.ts
git commit -m "feat(sections): ShopifyWork and Gallery shared sections skinned per theme"
```

---

### Task 11: Apple theme page (new default)

**Files:**
- Create: `src/pages/Apple.tsx`
- Create: `src/components/common/LanguageSelectorApple.tsx`, `MobileMenuApple.tsx`, `LogoSelectorApple.tsx`
- Modify: `src/components/modals/ContactFormModal.tsx` (add `apple` variant), `src/components/common/index.ts`, `src/components/index.ts`, `tailwind.config.js`, `src/styles/index.css`

Invoke `emil-design-eng` before writing motion; invoke `ui-ux-pro-max` for the token sanity check. Rules: system font stack, light-first, `prefers-reduced-motion` honored (existing global CSS already zeroes durations), 44 px nav, 18–28 px radii, spring easing `[0.32, 0.72, 0, 1]` for reveals.

- [ ] **Step 1: Tokens** — `tailwind.config.js` `theme.extend`:

```js
fontFamily: { ...existing, sf: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'] },
colors: { ...existing, apple: { bg: '#fbfbfd', surface: '#f5f5f7', text: '#1d1d1f', muted: '#86868b', blue: '#0071e3', blueDark: '#2997ff', dark: '#000000', darkSurface: '#1d1d1f', darkText: '#f5f5f7', darkMuted: '#a1a1a6' } },
boxShadow: { ...existing, tile: '0 4px 24px rgba(0,0,0,0.06)', tileDark: '0 4px 24px rgba(0,0,0,0.5)' },
```

- [ ] **Step 2: ContactFormModal `apple` variant** — extend the union `variant?: 'luxury' | 'brutalist' | 'apple'`, add `appleStyles` (rounded-[22px] panel, `bg-white`/`bg-[#1d1d1f]`, inputs `rounded-[12px] bg-[#f5f5f7]`, button `rounded-full bg-[#0071e3] text-white`), select with `variant === 'apple' ? appleStyles : variant === 'luxury' ? luxuryStyles : brutalistStyles`, and the two icon circles use `bg-[#0071e3]/15` for apple.

- [ ] **Step 3: Apple chrome components** — `LanguageSelectorApple` (pill segmented control EN/ES/JA using `useLanguage`), `MobileMenuApple` (full-screen sheet with `backdrop-blur-xl bg-white/80`, links from `navItems` prop, same prop contract as `MobileMenuLuxury`: `{ isDark, onContactClick, navItems }`), `LogoSelectorApple` (the "MB" mark that opens a `rounded-[18px]` popover listing `designs` from the registry + menu link, prop `{ isDark }`). Export all three.

- [ ] **Step 4: `Apple.tsx`**

```tsx
import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { ContactFormModal, SEOHead, MobileMenuApple, LanguageSelectorApple, LogoSelectorApple, ShopifyWork, Gallery, CompanyLogo, TransitionLink } from '../components'
import { skins } from '../components/gallery'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { designs, otherDesigns, MENU } from '../data/designs'

const EASE = [0.32, 0.72, 0, 1] as const
const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay, ease: EASE }} className={className}>{children}</motion.div>
)

function AppleContent() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()
  const { strings: c, registry, formatPeriod } = useContent()
  const [contactOpen, setContactOpen] = useState(false)
  const [job, setJob] = useState(registry.experience[0])
  useDynamicFavicon('apple')
  const skin = skins.apple(isDark)
  const bg = isDark ? 'bg-apple-dark text-apple-darkText' : 'bg-apple-bg text-apple-text'
  const surface = isDark ? 'bg-apple-darkSurface' : 'bg-apple-surface'
  const muted = isDark ? 'text-apple-darkMuted' : 'text-apple-muted'
  const blue = isDark ? 'text-apple-blueDark' : 'text-apple-blue'
  const nav = [['#hero', t('nav.home')], ['#experience', t('nav.experience')], ['#shopify', t('nav.shopify')], ['#gallery', t('nav.gallery')], ['#projects', t('nav.projects')], ['#contact', t('nav.contact')]] as const

  const Heading = (eyebrow: string, title: string, accent: string, lead?: string) => (
    <Reveal className="mb-10 md:mb-14">
      <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${blue} mb-3`}>{eyebrow}</p>
      <h2 className="font-sf text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05]">{title} <span className={muted}>{accent}</span></h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed`}>{lead}</p>}
    </Reveal>
  )

  return (
    <>
      <SEOHead title={c.meta.title} description={c.meta.description} canonical="https://www.maxfolio.dev" ogImage="https://www.maxfolio.dev/og-image.png" />
      <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="apple" isDark={isDark} />
      <div className={`min-h-screen font-sf ${bg} transition-colors duration-300`} role="document">
        <nav className={`fixed top-0 inset-x-0 z-40 h-11 ${isDark ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-black/5'}`} aria-label="Main navigation">
          <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
            <LogoSelectorApple isDark={isDark} />
            <div className="hidden md:flex items-center gap-7 text-xs">{nav.map(([href, label]) => <a key={href} href={href} className={`${muted} hover:${blue} transition-colors`}>{label}</a>)}</div>
            <div className="flex items-center gap-2">
              <LanguageSelectorApple isDark={isDark} />
              <button onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className={`w-8 h-8 rounded-full ${surface} text-xs compact-touch`}>{isDark ? '☀' : '☾'}</button>
              <button onClick={() => setContactOpen(true)} className="hidden sm:inline-flex h-8 items-center rounded-full bg-apple-blue px-3.5 text-xs font-medium text-white hover:bg-[#0077ed]">{c.hero.ctaContact}</button>
              <div className="md:hidden"><MobileMenuApple isDark={isDark} onContactClick={() => setContactOpen(true)} navItems={nav.map(([href, label]) => ({ href, label }))} /></div>
            </div>
          </div>
        </nav>

        <main id="main-content" className="pt-11">
          {/* Hero */}
          <section id="hero" className="px-4 pt-20 md:pt-32 pb-16 md:pb-24 text-center scroll-mt-20">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className={`text-sm font-semibold ${blue}`}>{c.hero.eyebrow}</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }} className="mx-auto mt-4 max-w-4xl text-5xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.03em] leading-[1.02]">{registry.personal.name}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className={`mx-auto mt-5 max-w-2xl text-xl md:text-2xl ${muted} leading-snug`}>{c.hero.positioning}</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed">{c.hero.lead}</motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, ease: EASE }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setContactOpen(true)} className="rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-[#0077ed]">{c.hero.ctaContact}</button>
              <a href={registry.personal.cv} download className={`${blue} text-sm font-medium`}>{c.hero.ctaCv} ›</a>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 inline-flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#34c759]" />{c.hero.availability}
            </motion.p>
          </section>

          {/* Stats bento */}
          <section className="px-4 pb-20 md:pb-28">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
              {registry.stats.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.05} className={`${surface} rounded-[22px] p-6 md:p-8`}>
                  <p className="text-4xl md:text-5xl font-semibold tracking-[-0.03em]">{s.value}</p>
                  <p className={`${muted} text-sm mt-2`}>{c.stats[s.id]}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className={`px-4 py-20 md:py-28 ${surface} scroll-mt-20`}>
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.experience.eyebrow, c.sections.experience.title, c.sections.experience.titleAccent)}
              <div className="grid lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2">
                  {registry.experience.map((e) => (
                    <button key={e.id} onClick={() => setJob(e)} className={`shrink-0 lg:shrink text-left rounded-[16px] px-4 py-3 transition-colors ${job.id === e.id ? (isDark ? 'bg-white/10' : 'bg-white shadow-tile') : 'hover:bg-black/5'}`}>
                      <p className="text-sm font-semibold">{c.experience[e.id].title}</p>
                      <p className={`${muted} text-xs`}>{e.company} · {formatPeriod(e.start, e.end)}</p>
                    </button>
                  ))}
                </div>
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className={`lg:col-span-8 rounded-[22px] ${isDark ? 'bg-white/5' : 'bg-white shadow-tile'} p-6 md:p-8`}>
                  <div className="flex items-start gap-4">
                    {job.logo && <div className="w-12 h-12 rounded-[12px] bg-white p-1.5 shrink-0"><CompanyLogo src={job.logo} alt={job.company} /></div>}
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{c.experience[job.id].title}</h3>
                      <p className={`${muted} text-sm`}>{job.company} · {job.location} · {formatPeriod(job.start, job.end)}{job.end === null && <span className={`ml-2 ${blue}`}>{c.badges.current}</span>}</p>
                    </div>
                  </div>
                  <p className="mt-5 leading-relaxed">{c.experience[job.id].summary}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">{job.metrics.map((m) => <div key={m.id} className={`${surface} rounded-[14px] p-3 text-center`}><p className="text-xl font-semibold">{m.value}</p><p className={`${muted} text-[11px]`}>{c.experience[job.id].metricLabels[m.id]}</p></div>)}</div>
                  <ul className="mt-5 space-y-2 text-sm">{c.experience[job.id].highlights.map((h) => <li key={h} className="flex gap-2"><span className={`${blue} mt-[3px]`}>•</span><span>{h}</span></li>)}</ul>
                  <div className="mt-5 flex flex-wrap gap-1.5">{job.technologies.map((tech) => <span key={tech} className={skin.chip}>{tech}</span>)}</div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 md:py-28"><div className="max-w-5xl mx-auto"><ShopifyWork skin={skin} heading={Heading} /></div></section>
          <section className={`px-4 py-20 md:py-28 ${surface}`}><div className="max-w-5xl mx-auto"><Gallery skin={skin} heading={Heading} /></div></section>

          {/* Projects */}
          <section id="projects" className="px-4 py-20 md:py-28 scroll-mt-20">
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.projects.eyebrow, c.sections.projects.title, c.sections.projects.titleAccent)}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {registry.personalProjects.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 0.05}>
                    <a href={p.url ?? p.repo} target="_blank" rel="noopener noreferrer" className={`block h-full ${surface} rounded-[22px] p-6 hover:-translate-y-0.5 transition-transform`}>
                      <p className={`${muted} text-xs`}>{p.year}</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.name}</h3>
                      <p className={`${blue} text-sm`}>{c.projects[p.id]?.tagline}</p>
                      <p className="mt-2 text-sm leading-relaxed">{c.projects[p.id]?.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">{p.stack.map((s) => <span key={s} className={skin.chip}>{s}</span>)}</div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className={`px-4 py-20 md:py-28 ${surface} scroll-mt-20`}>
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.skills.eyebrow, c.sections.skills.title, c.sections.skills.titleAccent)}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(registry.skillGroups) as (keyof typeof registry.skillGroups)[]).map((g, i) => (
                  <Reveal key={g} delay={i * 0.04} className={`rounded-[22px] ${isDark ? 'bg-white/5' : 'bg-white shadow-tile'} p-6`}>
                    <h3 className={`text-xs font-semibold tracking-[0.2em] uppercase ${blue}`}>{c.sections.skills.groups[g]}</h3>
                    <ul className="mt-3 space-y-1 text-sm">{registry.skillGroups[g].map((s) => <li key={s}>{s}</li>)}</ul>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="px-4 py-20 md:py-28 scroll-mt-20">
            <div className={`max-w-4xl mx-auto rounded-[28px] ${surface} p-8 md:p-14 text-center`}>
              <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${blue}`}>{c.sections.contact.eyebrow}</p>
              <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1.05]">{c.sections.contact.title} <span className={muted}>{c.sections.contact.titleAccent}</span></h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed">{c.sections.contact.lead}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-[#34c759]" />{c.sections.contact.status}</p>
              <p className={`${muted} text-sm mt-1`}>{c.sections.contact.note}</p>
              <button onClick={() => setContactOpen(true)} className="mt-8 rounded-full bg-apple-blue px-7 py-3.5 text-sm font-medium text-white hover:bg-[#0077ed]">{c.sections.contact.cta}</button>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
                <div><p className={`${muted} text-xs`}>{c.sections.contact.email}</p><a href={`mailto:${registry.personal.email}`} className={blue}>{registry.personal.email}</a></div>
                <div><p className={`${muted} text-xs`}>{c.sections.contact.phone}</p><a href={registry.personal.phoneHref} className={blue}>{registry.personal.phone}</a></div>
                <div><p className={`${muted} text-xs`}>{c.sections.contact.location}</p><p>{c.location}</p></div>
              </div>
              <div className="mt-8 flex justify-center gap-6 text-sm"><a href={registry.personal.linkedin} target="_blank" rel="noopener noreferrer" className={blue}>LinkedIn ›</a><a href={registry.personal.github} target="_blank" rel="noopener noreferrer" className={blue}>GitHub ›</a></div>
            </div>
          </section>

          {/* Explore */}
          <section id="explore" className={`px-4 py-20 ${surface} scroll-mt-20`}>
            <div className="max-w-5xl mx-auto">
              {Heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
              <div className="grid sm:grid-cols-3 gap-3">
                {[...otherDesigns('apple').map((d) => ({ key: d.id, to: d.route, label: t(d.nameKey), sub: t(d.subtitleKey), color: d.transitionColor, accent: d.transitionAccent, Preview: d.Preview })), { key: 'menu', to: MENU.route, label: t('logoSelector.designMenu'), sub: t('logoSelector.allDesigns'), color: isDark ? '#171717' : '#fafafa', accent: isDark ? '#ffffff' : '#171717', Preview: null }].map((card) => (
                  <TransitionLink key={card.key} to={card.to} transitionColor={card.color} transitionAccent={card.accent} transitionLabel={card.label} className={`block rounded-[22px] overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white shadow-tile'}`}>
                    <div className="h-28 overflow-hidden">{card.Preview ? <card.Preview size="md" /> : <div className={`w-full h-full ${surface}`} />}</div>
                    <div className="p-4"><p className="font-semibold text-sm">{card.label}</p><p className={`${muted} text-xs`}>{card.sub}</p></div>
                  </TransitionLink>
                ))}
              </div>
              <p className={`${muted} text-xs mt-8 text-center`}>{c.sections.explore.viewing}: {t(designs[0].nameKey)}</p>
            </div>
          </section>
        </main>

        <footer className={`px-4 py-10 text-xs ${muted}`} role="contentinfo">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-3">
            <p>© 2026 {registry.personal.name}. {c.footer.rights}</p>
            <p>{c.footer.tagline}</p>
          </div>
        </footer>

        <button onClick={() => setContactOpen(true)} aria-label="Open contact form" className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-apple-blue text-white shadow-xl z-30">✉</button>
      </div>
    </>
  )
}

export default function Apple() {
  return (
    <ThemeProvider storageKey="apple-theme" defaultTheme="light">
      <AppleContent />
    </ThemeProvider>
  )
}
```

- [ ] **Step 5: Build, open `/` in the preview at desktop and mobile, light and dark; screenshot hero, Shopify Work, Gallery. Fix anything that overflows horizontally (body must not scroll sideways).**

- [ ] **Step 6: Commit**

```bash
git add -A src tailwind.config.js
git commit -m "feat(apple): new Apple Clean default experience with all sections"
```

---

### Task 12: Retrofit Luxury and Brutalist

**Files:**
- Modify: `src/pages/Design4.tsx` (Luxury), `src/pages/Design1.tsx` (Brutalist)
- Delete: `src/data/portfolio.ts`, `src/data/portfolio-extended.ts`

- [ ] **Step 1: Luxury** — replace the `../data/portfolio-extended` import with `useContent()`; hero uses `c.hero.*`, stats from `registry.stats` + `c.stats`, experience list/details from `registry.experience` + `c.experience[id]` + `formatPeriod`, the freelance tab renders `registry.personalProjects` with `c.projects[id]`, skills grid maps `registry.skillGroups` with `c.sections.skills.groups`, contact uses `c.sections.contact.*`, footer `c.footer.*`. Insert after the experience section:

```tsx
<section className={`py-20 md:py-32 px-6 md:px-16 ${bgPrimary}`}><div className="max-w-7xl mx-auto"><ShopifyWork skin={skins.luxury(isDark)} heading={LuxuryHeading} /></div></section>
<section className={`py-20 md:py-32 px-6 md:px-16 ${bgSecondary} ${isDark ? 'text-deco-cream' : 'text-luxury-cream'}`}><div className="max-w-7xl mx-auto"><Gallery skin={skins.luxury(isDark)} heading={LuxuryHeading} /></div></section>
```

with

```tsx
const LuxuryHeading = (eyebrow: string, title: string, accent: string, lead?: string) => (
  <FadeInUp><div className="mb-12 md:mb-16"><p className={`text-xs tracking-[0.5em] uppercase ${accentCls} mb-4`}>{eyebrow}</p>
  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl">{title} <span className={`italic ${accentCls}`}>{accent}</span></h2>
  {lead && <p className={`${textSecondary} mt-4 max-w-2xl font-light`}>{lead}</p>}</div></FadeInUp>
)
```

(rename the existing `accent` class variable to `accentCls` inside `Design4Content` to avoid the clash). Nav and mobile menu get `#shopify` and `#gallery` items (`t('nav.shopify')`, `t('nav.gallery')`). The hardcoded "Professional Journey", "Crafting Digital Excellence", "Key Achievements", "Technologies Used", "Visit Website →", "What I Do", "Quick Links" strings move to content keys already defined (`c.sections.*`, `c.sections.shopify.visit`); the footer "Luxury Minimal — Default Design" becomes `{t(designById('luxury').nameKey)}`.

- [ ] **Step 2: Brutalist** — same substitution; insert after the work section:

```tsx
<section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}><div className="max-w-[1800px] mx-auto px-4 md:px-6"><ShopifyWork skin={skins.brutalist(isDark)} heading={BrutalHeading} /></div></section>
<section className={`py-16 md:py-24 border-t-4 ${borderStrong}`}><div className="max-w-[1800px] mx-auto px-4 md:px-6"><Gallery skin={skins.brutalist(isDark)} heading={BrutalHeading} /></div></section>
```

with

```tsx
const BrutalHeading = (eyebrow: string, title: string, accent: string, lead?: string) => (
  <div className="mb-12 md:mb-16"><span className={`font-mono text-xs uppercase tracking-[0.5em] ${textMuted}`}>{eyebrow}</span>
  <h2 className="font-editorial text-[12vw] md:text-[8vw] leading-[0.85] tracking-tight italic mt-4">{title}<br /><span className="not-italic text-red-600">{accent}</span></h2>
  {lead && <p className={`${textSecondary} mt-6 max-w-2xl`}>{lead}</p>}</div>
)
```

"Section 02/03" labels stay; "Est. 2021" becomes "Est. 2022" (first job Jan 2022). Nav gets `#shopify` and `#gallery`.

- [ ] **Step 3: Delete the old data files, build, click both pages in three locales**

```bash
git rm src/data/portfolio.ts src/data/portfolio-extended.ts
bun run build
```

Expected: green; `grep -rn "portfolio-extended\|data/portfolio'" src` returns nothing.

- [ ] **Step 4: Commit**

```bash
git add -A src
git commit -m "feat(themes): Luxury and Brutalist consume the registry/content and gain Shopify Work + Gallery"
```

---

### Task 13: SEO, sitemap, OG image, CV

**Files:**
- Modify: `index.html`, `public/sitemap.xml`, `src/components/common/SEOHead.tsx`, `README.md`
- Create: `public/og-image.png`
- Replace: `public/Maximiliano-Bustamante-CV.pdf`

- [ ] **Step 1: `index.html`** — title/description to the `en.meta` strings; every `maxfolio.co` → `https://www.maxfolio.dev`; JSON-LD Person: `jobTitle: "CTO & Shopify Tech Lead"`, `worksFor: { name: "Digitdeck", url: "https://digitdeck.co" }`, `sameAs: [linkedin, "https://github.com/Max-Bustamante69"]`, `knowsAbout: ["Shopify", "Liquid", "React", "Remix", "Shopify Functions", "CRO", "A/B testing", "TypeScript"]`; `og:image` → `/og-image.png`; keep fonts links (Luxury/Brutalist still use them).
- [ ] **Step 2: `SEOHead` defaults** → `canonical = 'https://www.maxfolio.dev'`, `ogImage = 'https://www.maxfolio.dev/og-image.png'`, default title `'Maximiliano Bustamante | CTO & Shopify Tech Lead'`.
- [ ] **Step 3: `public/sitemap.xml`** with `/`, `/luxury`, `/brutalist`, `/menu`, `lastmod` 2026-09-07.
- [ ] **Step 4: OG image** — `bun dev`, Playwright screenshot of `/` at 1200×630 (hero only, `page.screenshot({clip})`) → `public/og-image.png`.
- [ ] **Step 5: CV** — copy `C:\Users\Usuario\Downloads\Documents\Maximiliano_Bustamante_CV.pdf` (2026-08-29, 102 KB) over `public/Maximiliano-Bustamante-CV.pdf` after opening it with the Read tool to confirm it is the CTO/Shopify version.
- [ ] **Step 6: README** — "four design experiences", route table, `gallery:capture` docs.
- [ ] **Step 7: Commit**

```bash
git add index.html public src/components/common/SEOHead.tsx README.md
git commit -m "chore(seo): maxfolio.dev canonical, CTO schema, OG image, sitemap, current CV"
```

---

### Task 14: Verification, PR, deploy

- [ ] **Step 1:** `bun run lint && bun run build` green.
- [ ] **Step 2:** In the in-app preview, for each of `/`, `/luxury`, `/brutalist` × `en/es/ja` × desktop/mobile: screenshot hero, Shopify Work, Gallery; open one lightbox and press `→`, `Esc`. Check `document.documentElement.scrollWidth === innerWidth` on mobile (no horizontal scroll).
- [ ] **Step 3:** Lighthouse on `/` mobile with the machine idle: performance ≥ 85, accessibility ≥ 95. If performance fails, lazy-load the Gallery section (`React.lazy` + `IntersectionObserver`) and re-measure.
- [ ] **Step 4:** Push and open the PR:

```bash
git push -u origin feat/2026-refresh
gh pr create --title "2026 refresh: CTO positioning, Shopify Work + Gallery, Apple Clean default, EN/ES/JA content" --body "$(cat <<'EOF'
## Summary
- Content model: registry + typed EN/ES/JA content, honest CV-backed metrics
- New sections Shopify Work + Gallery (Playwright-captured, uniform frames) in Apple, Luxury, Brutalist
- New default experience "Apple Clean" at `/`; Luxury moves to `/luxury`
- Single design registry; SEO fixed to maxfolio.dev; CTO schema

Spec: docs/superpowers/specs/2026-09-07-portfolio-2026-refresh-design.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5:** Share the Vercel preview URL with Max; merge only on his go; confirm https://www.maxfolio.dev serves the Apple theme after deploy (`get_page_text` shows the new eyebrow).

---

### Task 15: LinkedIn — experience entries + media

**Files:**
- Create: `docs/linkedin/2026-09-experience.md`

- [ ] **Step 1: Write the seven entries** in the CV anatomy (title exactly as `en.experience[id].title`, company, employment type, dates from the registry, location, then: summary line, 3–5 bullets each with a figure, `Stack:` line), plus a "Headline" and "About" for the profile. Use `digitdeck-copywriting` again. Save to `docs/linkedin/2026-09-experience.md` and show the full file to Max in chat. **Wait for an explicit yes.**
- [ ] **Step 2: Apply in the real Chrome** (`claude-in-chrome`, Max's session): open `https://www.linkedin.com/in/maximiliano-bustamante-998b77173/details/experience/`. For each entry: edit if it exists (match by company + start date) else add; fill title, employment type, company, dates, location, description via `form_input`; **before clicking Save, read the form back and confirm with Max in chat**; click Save; re-read the page to verify.
- [ ] **Step 3: Media** — on the Digitdeck CTO entry add media: upload `public/gallery/<slug>/linkedin.webp` for the 11 live stores + apps/platform composites (LinkedIn accepts JPG/PNG — convert with `sharp(...).jpeg({quality: 85})` to `scripts/.capture-cache/linkedin/<slug>.jpg` first); title = store name, description = `en.stores[slug].tagline`; on the Digitdeck FE entry add Saint Theory. Confirm the list with Max before the first upload; verify each thumbnail after saving.
- [ ] **Step 4: Headline + About** — same show → confirm → save → verify loop.
- [ ] **Step 5: Commit the doc**

```bash
git add docs/linkedin/2026-09-experience.md
git commit -m "docs(linkedin): 2026 experience entries as published"
```

---

### Task 16: LinkedIn post

**Files:**
- Create: `docs/linkedin/2026-09-post.md`

- [ ] **Step 1: Draft (EN, US DTC/dropshipping audience)** following the copywriting skill: hook = one measurable CRO outcome from the fleet (e.g. "A coffee brand's bundle builder now sells 3-bag boxes at a 15% discount and the average order went up — because the discount is computed by a Shopify Function, not a coupon"), then what a CRO engagement covers (speed, offers/AOV mechanics, A/B tests with real statistics, checkout friction), proof (18+ storefronts, a production app suite), the offer (free 20-minute storefront review / quotes open for Q4), CTA (DM or maxfolio.dev), 4 hashtags (`#Shopify #CRO #Ecommerce #DTC`). ≤ 1,300 characters, line breaks every 1–2 sentences, no emojis beyond one arrow. Attach `public/og-image.png` or the NOS Café composite. Save to `docs/linkedin/2026-09-post.md`; show to Max. **Wait for an explicit yes.**
- [ ] **Step 2: Publish** via the real Chrome: `https://www.linkedin.com/feed/` → Start a post → paste text → upload the image → read the preview back → **confirm with Max** → Post. Copy the post URL from the feed and report it.
- [ ] **Step 3: Commit**

```bash
git add docs/linkedin/2026-09-post.md
git commit -m "docs(linkedin): September 2026 Shopify CRO post as published"
git push
```

---

## Self-review

- Spec coverage: content model (T4–T7), design registry (T8), capture pipeline (T2–T3), uniform presentation (T9), sections in three themes + menu card (T10–T12), Apple theme (T11), copy in three languages (T5–T6), SEO/assets (T13), verification/PR (T14), LinkedIn experience/media/post with approval gates (T15–T16). Legacy stores without capture are in the registry with `gallery: false` (T4) and render as text cards (T10).
- Placeholders: none — every step has its code or exact command; ES/JA files are full copies with translated strings, parity enforced by `tsc` (T6 step 4).
- Types: `Skin` from `skins.ts` used identically in `ProjectFrame`, `Gallery`, `ShopifyWork`, `Apple.tsx`; `heading(eyebrow, title, accent, lead?)` signature identical across sections and pages; `formatPeriod(start, end)` from `useContent` used in T11/T12; `designs`, `otherDesigns`, `designById`, `MENU` from `designs.ts` used in T8/T11/T12; `useDynamicFavicon('apple')` allowed by the widened `FaviconType`.
