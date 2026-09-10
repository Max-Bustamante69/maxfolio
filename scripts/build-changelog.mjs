// Generates the Terminal theme's CHANGELOG section from this repo's real git history — never a
// hand-typed list of "what shipped". Output: src/data/changelog.json, an array of the last 12
// non-merge commits (newest first) as { hash, date, subject }, numbered v<n> by the page (highest
// number = newest). If git is unavailable at build time (e.g. a shallow/no-git deploy), the
// existing committed file is left untouched -- the section then renders whatever was last
// generated, per the brief's "if git is unavailable at build the section renders the committed
// json". Usage: node scripts/build-changelog.mjs   (wired as part of the repo's "prebuild" script)
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'src/data/changelog.json')
const COUNT = 12
const RECORD_END = '@@REC@@'
const FIELD_SEP = '@@F@@'

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 8 * 1024 * 1024 })
}

/** Strips markdown syntax a commit subject sometimes carries (backticks, asterisks) -- a commit
 *  subject is developer-written free text, not content this site's copy pipeline vetted. */
function sanitize(subject) {
  return subject.replace(/[`*_<>]/g, '').trim().slice(0, 120)
}

try {
  const format = '%h' + FIELD_SEP + '%ad' + FIELD_SEP + '%s' + RECORD_END
  const raw = run('git log --no-merges -n ' + COUNT + ' --date=short --pretty=format:' + format)
  const commits = raw
    .split(RECORD_END)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(FIELD_SEP)
      const hash = parts[0]
      const date = parts[1]
      const subject = sanitize(parts[2] || '')
      return { hash, date, subject }
    })
    .filter((c) => c.hash && c.date && c.subject)

  if (commits.length === 0) throw new Error('git log returned no non-merge commits')

  fs.writeFileSync(OUT, JSON.stringify(commits, null, 2) + '\n')
  console.log('build-changelog: wrote ' + commits.length + ' commits to ' + path.relative(ROOT, OUT))
} catch (err) {
  if (fs.existsSync(OUT)) {
    console.log('build-changelog: git unavailable (' + err.message + '); keeping the committed ' + path.relative(ROOT, OUT))
  } else {
    // No git AND nothing committed yet: fail loudly rather than ship a page with an empty section.
    throw new Error('build-changelog: git unavailable and no committed fallback exists at ' + OUT + ': ' + err.message)
  }
}
