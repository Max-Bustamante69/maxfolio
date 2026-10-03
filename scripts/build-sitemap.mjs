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

// Solo el tema por defecto (Plató, ab.config.ts) es indexable: los otros siete llevan noindex y `/` redirige por visitante.
const PLATO = 'src/themes/plato'
// Fichas: las tiendas del registro con capturas (las mismas que Plató enseña); se leen del fuente para no duplicar la lista.
const registry = fs.readFileSync(path.join(ROOT, 'src/data/registry.ts'), 'utf8')
const fichas = [...registry.matchAll(/\{ slug: '([a-z0-9-]+)'[^\n]*gallery: true/g)].map((m) => m[1])

const routes = [
  { loc: '/plato', file: `${PLATO}/Inicio.tsx`, changefreq: 'monthly', priority: '1.0' },
  { loc: '/plato/obra', file: `${PLATO}/Obra.tsx`, changefreq: 'monthly', priority: '0.8' },
  { loc: '/plato/trayectoria', file: `${PLATO}/Trayectoria.tsx`, changefreq: 'monthly', priority: '0.7' },
  { loc: '/plato/contacto', file: `${PLATO}/Contacto.tsx`, changefreq: 'yearly', priority: '0.6' },
  ...fichas.map((slug) => ({ loc: `/plato/obra/${slug}`, file: `${PLATO}/Ficha.tsx`, changefreq: 'monthly', priority: '0.6' })),
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
