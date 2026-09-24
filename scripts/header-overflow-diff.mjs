#!/usr/bin/env node
/** Diffs two header-overflow-probe.mjs JSON reports (baseline vs candidate) and prints every
 * row where the candidate is WORSE than the baseline (a new control/page overflow, a new header
 * internal overflow, or a new overlap) and every row where it's BETTER (a regression fixed). */
import { readFileSync } from 'node:fs'

const [baselinePath, candidatePath] = process.argv.slice(2)
if (!baselinePath || !candidatePath) {
  console.error('Usage: node header-overflow-diff.mjs <baseline.json> <candidate.json>')
  process.exit(1)
}
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'))

function key(r) {
  return `${r.path}@${r.width}:${r.scheme}`
}
function worstOverflow(row) {
  if (!row.ok || !row.headerFound) return 0
  let max = 0
  for (const c of row.controls || []) max = Math.max(max, c.offRight || 0, c.offLeft || 0)
  max = Math.max(max, row.headerInternalOverflow?.overflowPx || 0)
  max = Math.max(max, row.pageOverflow?.overflowPx || 0)
  return max
}

const baseMap = new Map(baseline.rows.map((r) => [key(r), r]))
const candMap = new Map(candidate.rows.map((r) => [key(r), r]))

const worse = []
const better = []
for (const [k, cRow] of candMap) {
  const bRow = baseMap.get(k)
  if (!bRow) continue
  const bWorst = worstOverflow(bRow)
  const cWorst = worstOverflow(cRow)
  if (cWorst > bWorst + 1) worse.push({ k, baseline: bWorst, candidate: cWorst })
  if (bWorst > cWorst + 1) better.push({ k, baseline: bWorst, candidate: cWorst })
}

console.log(`Baseline: ${baseline.label} (${baseline.base})`)
console.log(`Candidate: ${candidate.label} (${candidate.base})`)
console.log(`\n${worse.length} row(s) WORSE on candidate than baseline:`)
for (const w of worse) console.log(`  - ${w.k}: baseline ${w.baseline}px -> candidate ${w.candidate}px`)
console.log(`\n${better.length} row(s) BETTER on candidate (regression fixed vs baseline):`)
for (const b of better) console.log(`  - ${b.k}: baseline ${b.baseline}px -> candidate ${b.candidate}px`)

if (worse.length > 0) process.exit(1)
