#!/usr/bin/env node
/**
 * png-to-webp.mjs — converts a list of PNGs to WebP (max width, quality) using a real Chromium
 * canvas (no new npm deps). Per AGENTS "IMAGE GENERATION" recipe.
 *
 * Usage: node scripts/.capture-cache/png-to-webp.mjs <srcDir> <outDir> [maxWidth] [quality]
 */
import { chromium } from 'playwright'
import { readdirSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { resolve, join, basename, extname } from 'node:path'

const [, , srcDirArg, outDirArg, maxWidthArg, qualityArg] = process.argv
const srcDir = resolve(srcDirArg)
const outDir = resolve(outDirArg)
const maxWidth = Number(maxWidthArg || 1600)
const quality = Number(qualityArg || 0.82)

mkdirSync(outDir, { recursive: true })

const files = readdirSync(srcDir).filter((f) => extname(f).toLowerCase() === '.png')
if (!files.length) {
  console.log('No PNGs found in', srcDir)
  process.exit(0)
}

const browser = await chromium.launch({ executablePath: 'C:/Users/Usuario/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' })
const page = await browser.newPage()

const results = []
for (const file of files) {
  const srcPath = join(srcDir, file)
  const name = basename(file, '.png')
  const outPath = join(outDir, `${name}.webp`)
  const fileUrl = 'file:///' + srcPath.replace(/\\/g, '/')

  await page.goto(fileUrl)
  const dataUrl = await page.evaluate(
    async ({ maxWidth, quality }) => {
      const img = document.images[0]
      if (img && !img.complete) {
        await new Promise((res, rej) => {
          img.onload = res
          img.onerror = rej
        })
      }
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w)
        w = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      return canvas.toDataURL('image/webp', quality)
    },
    { maxWidth, quality },
  )

  const base64 = dataUrl.replace(/^data:image\/webp;base64,/, '')
  const buf = Buffer.from(base64, 'base64')
  writeFileSync(outPath, buf)
  const kb = Math.round(buf.length / 1024)
  results.push({ file, kb })
  console.log(`${name}.webp — ${kb} KB`)
}

await browser.close()

const oversize = results.filter((r) => r.kb > 250)
if (oversize.length) {
  console.log('\nOVER 250KB budget:', oversize.map((r) => `${r.file} (${r.kb}KB)`).join(', '))
} else {
  console.log('\nAll images within the 250KB budget.')
}
