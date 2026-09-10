// Regenerates public/sitemap.xml with each route's lastmod pulled from the real git history of
// the page file that owns it — never hand-typed, so lastmod can't go stale relative to an actual
// content edit (the "why isn't this being recrawled" cause named in wf4-seo-perf.md §3.13).
// Usage: node scripts/build-sitemap.mjs   (wired as the repo's "prebuild" script)
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public/sitemap.xml')
const SITE = 'https://www.maxfolio.dev'

const lastCommitDate = (file) => {
  try {
    const d = execSync(`git log -1 --format=%cd --date=short -- "${file}"`, { cwd: ROOT, encoding: 'utf8' }).trim()
    return d || new Date().toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

const routes = [
  { loc: '/', file: 'src/pages/Apple.tsx', changefreq: 'monthly', priority: '1.0' },
  { loc: '/luxury', file: 'src/pages/Design4.tsx', changefreq: 'monthly', priority: '0.8' },
  { loc: '/brutalist', file: 'src/pages/Design1.tsx', changefreq: 'monthly', priority: '0.8' },
  { loc: '/neo', file: 'src/pages/Neo.tsx', changefreq: 'monthly', priority: '0.8' },
  { loc: '/arcade', file: 'src/pages/Persona.tsx', changefreq: 'monthly', priority: '0.8' },
  { loc: '/terminal', file: 'src/pages/Terminal.tsx', changefreq: 'monthly', priority: '0.8' },
  { loc: '/skyline', file: 'src/pages/Skyline.tsx', changefreq: 'monthly', priority: '0.8' },
  { loc: '/menu', file: 'src/pages/Home.tsx', changefreq: 'monthly', priority: '0.5' },
]

const urls = routes
  .map((r) => {
    const lastmod = lastCommitDate(r.file)
    return `  <url>\n    <loc>${SITE}${r.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
fs.writeFileSync(OUT, xml)
console.log('sitemap: wrote public/sitemap.xml for ' + routes.map((r) => r.loc).join(', '))
