// Real engineering telemetry per storefront, read from the store repos' git history (never typed by hand).
// Output: src/data/telemetry.json  { [slug]: { repo, commits, first, last, weeks: number[] (commits per ISO week from
// first to last commit), files: {liquid,tsx,ts,css,json}, lines: {liquid,tsx,ts,css}, sections } }
// Usage: node scripts/store-telemetry.mjs   (skips stores whose repo is not on this machine; keeps their old entry)
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BRAIN = 'C:/Users/Usuario/Desktop/P/Github/Digitdeck/stores'
const OUT = path.resolve('src/data/telemetry.json')
// Candidates in order; the first that exists AND whose commit count is at least the registry's wins.
const CANDIDATES = {
  'the-gummy-box': ['the-gummy-box', 'tgb-wellness-dev'],
  'nos-cafe': ['nos-cafe'],
  millennio: ['millennio'],
  mindfuel: ['mindfuel-v2', 'mindfuel'],
  nalua: ['nalua', 'nalua-redesign'],
  sebum: ['sebum-v2'],
  'valdo-cafe': ['valdo-cafe'],
  'factores-2x2': ['factores-2x2'],
  pixxiesx: ['pixxiesx-theme', 'pixxiesx'],
  'luxe-shine': ['luxe-shine'],
  atmosfera: ['atmosfera'],
  peluna: ['peluna', 'peluna-react'],
  'en-amor-a-dos': ['en-amor-a-dos'],
  unik: ['unik'],
  'origen-vital': ['origen-vital-colombia', 'origen-vital'],
  'para-machos': ['para-machos'],
  tierramont: ['tierramont-claude', 'tierramont-vault', 'tierramont-gpt'],
  'alma-de-aviador': ['alma-de-aviador-v2', 'alma-de-aviador'],
}

const registry = fs.readFileSync(path.resolve('src/data/registry.ts'), 'utf8')
const registryCommits = (slug) => {
  const m = registry.match(new RegExp(`slug: '${slug}'[^\\n]*?commits: (\\d+)`))
  return m ? Number(m[1]) : 0
}
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim()
const isoWeek = (d) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, '0')}`
}
const weekStart = (d) => { const t = new Date(d); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); t.setUTCHours(0, 0, 0, 0); return t }

const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
const out = { ...previous }
for (const [slug, dirs] of Object.entries(CANDIDATES)) {
  const want = registryCommits(slug)
  let picked = null
  for (const dir of dirs) {
    const cwd = path.join(BRAIN, dir)
    if (!fs.existsSync(path.join(cwd, '.git'))) continue
    let n = 0
    try { n = Number(sh('git rev-list --count HEAD', cwd)) } catch { continue }
    if (!picked || n >= want) { picked = { dir, cwd, n }; if (n >= want) break }
  }
  if (!picked) { console.log(`skip ${slug}: no repo on this machine`); continue }
  const { cwd, dir, n } = picked
  const dates = sh('git log --format=%cI --reverse', cwd).split('\n').filter(Boolean).map((s) => new Date(s))
  const first = dates[0], last = dates[dates.length - 1]
  const w0 = weekStart(first)
  const nWeeks = Math.floor((weekStart(last) - w0) / (7 * 86400000)) + 1
  const weeks = Array.from({ length: nWeeks }, () => 0)
  for (const d of dates) weeks[Math.floor((weekStart(d) - w0) / (7 * 86400000))]++
  const files = sh('git ls-files', cwd).split('\n').filter(Boolean).filter((f) => !/^(_|\.digitdeck|node_modules|dist\/|packages\/)/.test(f))
  const theme = files.filter((f) => /^(layout|sections|snippets|templates)\/.*\.liquid$/.test(f) && !/^(sections|snippets)\/(gp-|gem-|pf-|pagefly)/.test(f))
  const islands = files.filter((f) => /^(src|frontend)\/.*\.(tsx?|jsx?)$/.test(f) && !/\.d\.ts$/.test(f))
  const styles = files.filter((f) => /^(src|frontend)\/.*\.css$/.test(f))
  const linesOf = (list) => list.reduce((sum, f) => { try { return sum + fs.readFileSync(path.join(cwd, f), 'utf8').split('\n').length } catch { return sum } }, 0)
  const count = (ext) => files.filter((f) => f.endsWith(ext)).length
  // generated page-builder sections (GemPages, PageFly) are not the theme's own work
  const sections = files.filter((f) => /^sections\/.*\.liquid$/.test(f) && !/^sections\/(gp-|gem-|pf-|pagefly)/.test(f)).length
  out[slug] = {
    repo: dir,
    commits: n,
    first: first.toISOString().slice(0, 10),
    last: last.toISOString().slice(0, 10),
    weekOf: w0.toISOString().slice(0, 10),
    weeks,
    files: { liquid: theme.length, ts: islands.length, css: styles.length, json: count('.json') },
    lines: { liquid: linesOf(theme), islands: linesOf(islands), css: linesOf(styles) },
    sections,
    busiestWeek: { index: weeks.indexOf(Math.max(...weeks)), commits: Math.max(...weeks), week: isoWeek(new Date(w0.getTime() + weeks.indexOf(Math.max(...weeks)) * 7 * 86400000)) },
  }
  console.log(`${slug.padEnd(16)} ${dir.padEnd(22)} commits=${String(n).padStart(4)} (registry ${want}) weeks=${nWeeks} peak=${out[slug].busiestWeek.commits} liquid=${out[slug].lines.liquid} islands=${out[slug].lines.islands} sections=${out[slug].sections}`)
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log('wrote', OUT, Object.keys(out).length, 'stores')
