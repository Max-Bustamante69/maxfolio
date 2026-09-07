import sharp from 'sharp'

const GIFT_RE = /gift|regalo|tarjeta|card|bono|e-?card/i
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

// First product with an image that is not a gift card. Shopify exposes this on every public store.
export async function discoverPdp(baseUrl) {
  const res = await fetch(`${baseUrl}/products.json?limit=12`, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`products.json ${res.status} for ${baseUrl}`)
  const { products } = await res.json()
  const ok = (p) => p.images?.length && !GIFT_RE.test(p.handle) && !GIFT_RE.test(p.title)
  // Prefer a product that can actually be bought; fall back to any product with an image.
  const pick =
    products.find((p) => ok(p) && p.variants?.some((v) => v.available)) ?? products.find(ok)
  if (!pick) throw new Error(`no product with images at ${baseUrl}`)
  return `/products/${pick.handle}`
}

// Privacy-preserving: close or decline, never accept.
export const DISMISS_SELECTORS = [
  '.shopify-pc__banner__btn-decline',
  '#shopify-pc__banner__btn-decline',
  'button:has-text("Rechazar")',
  'button:has-text("Decline")',
  '.klaviyo-close-form',
  'button.needsclick[aria-label*="close" i]',
  '[data-testid="age-gate"] button',
  '.age-gate button',
  '[class*="popup" i] [aria-label*="close" i]',
  '[class*="modal" i] [aria-label*="close" i]',
  '[aria-label*="cerrar" i]',
  '[aria-label="Close"]',
]

export async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page.waitForTimeout(1200) // give Klaviyo/Forms their delay to show up before we dismiss them
  for (let i = 0; i < 2; i++) {
    for (const sel of DISMISS_SELECTORS) {
      const el = page.locator(sel).first()
      if (await el.isVisible().catch(() => false)) await el.click({ timeout: 1500 }).catch(() => {})
    }
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(400)
  }
  // Trigger lazy images, then return to the top.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight
    for (let y = 0; y < h; y += 700) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  }).catch(() => {})
  await page.waitForTimeout(700)
  await page.addStyleTag({
    content: `*{animation-play-state:paused!important;transition:none!important}
      ::-webkit-scrollbar{display:none} html{scrollbar-width:none}`,
  }).catch(() => {})
}

export async function readShopifyTheme(page) {
  return page.evaluate(() => (window.Shopify && window.Shopify.theme) || null).catch(() => null)
}

export async function toWebp(buffer, width, outPath) {
  await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath)
}

// 1200×627 LinkedIn composite: desktop on the left, phone on the right, neutral Apple-grey ground.
export async function composite(desktopPng, mobilePng, outPath) {
  const W = 1200
  const H = 627
  const desk = await sharp(desktopPng).resize({ width: 760 }).png().toBuffer()
  const mob = await sharp(mobilePng).resize({ height: 560 }).png().toBuffer()
  const mobMeta = await sharp(mob).metadata()
  await sharp({ create: { width: W, height: H, channels: 4, background: '#f5f5f7' } })
    .composite([
      { input: desk, left: 40, top: 60 },
      { input: mob, left: W - (mobMeta.width ?? 260) - 60, top: 34 },
    ])
    .webp({ quality: 82 })
    .toFile(outPath)
}
