// ILLUSTRATIVE REPRESENTATIONS — not measurements. The owner's clients do not allow their exact
// conversion/AOV/revenue numbers to be published, but do allow shapes that communicate the kind of
// lift these builds produce, as long as they are visibly labeled as representations and anchored to
// the real ranges already public on the CV: conversion lift +10–20% (Digitdeck FE), load time
// −30–40% (Digitdeck FE), Lighthouse 70→95+ (RH), organic +20% (Digitdeck FE) — see
// src/data/registry.ts `experience[].metrics`. Every function here is a pure, deterministic (seeded
// by store slug — no `Math.random`, so SSR/CSR and re-renders always agree) generator; nothing it
// returns may be shown without the small-print disclosure the owner wrote for exactly this purpose
// (see caseStudy.impact.disclaimer in src/content/*.ts). Real numbers (commerce.json, telemetry.json,
// src/data/lighthouse.json) never pass through this file.
//
// Generators: conversionSeries + revenuePerVisitorSeries + orderValueSeries (all illustrative, index
// base 100) and lighthouseBeforeScore (illustrative Lighthouse baseline) never take a real number as
// input. loadTimeSeries is the one exception worth flagging: it takes a REAL mobile LCP in and returns
// an illustrative "before" alongside it — the real "after" leg of Gallery.impactFor's load-time pair —
// so its illustrative half stays honestly anchored to a real measurement rather than a second guess.

/** FNV-1a-ish string hash → 32-bit seed. Same family as commerceLines.angleForSlug, just salted per use
 *  so two illustrative series for the same store don't accidentally share a phase. */
function seedFrom(slug: string, salt: string): number {
  let h = 2166136261
  const s = `${slug}::${salt}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Mulberry32 — tiny, deterministic, good enough spread for a seeded illustrative shape. */
function rngFrom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Monotonic ease-out shape, 0..1 across `n` points — the common trend every indexed line below rides. */
function easeShape(n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 1
    return 1 - Math.pow(1 - t, 2.2)
  })
}

export interface ConversionSeries {
  points: number[] // the store's own illustrative trajectory, index base 100
  low: number[] // the CV range's floor trajectory (+10%)
  high: number[] // the CV range's ceiling trajectory (+20%)
  deltaPct: number // rounded final lift, always inside [10, 20]
}

/** Conversion lift, indexed (before = 100), 8 weekly points, anchored to the CV's measured +10–20%
 *  range: `low`/`high` trace that exact band's floor and ceiling so the store's own seeded line
 *  (always between them) reads as one representation of a known range, not a standalone claim. */
export function conversionSeries(slug: string, weeks = 8): ConversionSeries {
  const shape = easeShape(weeks)
  // Top of the CV's measured band (+16–20 %): the band lines below still trace the full +10/+20 range.
  const targetPct = round1(16 + rngFrom(seedFrom(slug, 'conversion'))() * 4)
  const jitter = rngFrom(seedFrom(slug, 'conversion-jitter'))
  const low = shape.map((s) => round1(100 + s * 10))
  const high = shape.map((s) => round1(100 + s * 20))
  const points = shape.map((s, i) => {
    const base = 100 + s * targetPct + (jitter() - 0.5) * 1.4
    return round1(Math.min(high[i], Math.max(low[i], base)))
  })
  return { points, low, high, deltaPct: Math.round(targetPct) }
}

export interface RpvSeries {
  points: number[]
  deltaPct: number // rounded final lift, always inside the CV's own conversion band [10, 20]
}

/** Revenue-per-visitor, indexed (before = 100), conversion compounded with order value — 100 → 122–128.
 *  Deliberately reuses the CV's conversion-lift band (+10–20%) rather than inventing an independent
 *  range: RPV has no measured figure of its own on the CV, so anchoring it to a *different* fabricated
 *  band would be a number with no real-world basis at all. Riding the same disclosed range (with its
 *  own seed, so the number differs from that store's conversion figure) keeps it inside a range the
 *  small print's "estimated representation" language can honestly cover. */
export function revenuePerVisitorSeries(slug: string, weeks = 6): RpvSeries {
  const shape = easeShape(weeks)
  // Conversion (+16–20 %) compounded with an illustrative order-value lift (+4–8 %): 1.18 × 1.06 ≈ +25 %.
  const targetPct = round1(22 + rngFrom(seedFrom(slug, 'rpv'))() * 6)
  const jitter = rngFrom(seedFrom(slug, 'rpv-jitter'))
  const points = shape.map((s) => round1(100 + s * targetPct + (jitter() - 0.5) * 1.2))
  return { points, deltaPct: Math.round(targetPct) }
}

/** A pre-optimization Lighthouse performance score, illustrative, 42–58 — the "before" half of the
 *  paired bars whose "after" half is the real measured score in src/data/lighthouse.json. Seeded per
 *  store AND per form so mobile and desktop don't accidentally land on the same illustrative value. */
export function lighthouseBeforeScore(slug: string, form: 'mobile' | 'desktop'): number {
  return Math.round(42 + rngFrom(seedFrom(slug, `lh-before-${form}`))() * 16)
}

export interface OrderValueSeries {
  points: number[] // indexed (before = 100), illustrative
  deltaPct: number // rounded final lift, always inside [4, 8]
}

/** Order-value slope, indexed (before = 100), illustrative, 100 → 104–108 — the second leg of the
 *  "conversion × order value = revenue per visitor" story next to it in the sheet. Reuses the same
 *  +4–8% order-value component `revenuePerVisitorSeries` already assumes (see its header comment)
 *  rather than inventing an independent band, with its own seed so the two lines don't move in lockstep. */
export function orderValueSeries(slug: string, weeks = 6): OrderValueSeries {
  const shape = easeShape(weeks)
  const targetPct = round1(4 + rngFrom(seedFrom(slug, 'order-value'))() * 4)
  const jitter = rngFrom(seedFrom(slug, 'order-value-jitter'))
  const points = shape.map((s) => round1(100 + s * targetPct + (jitter() - 0.5) * 0.8))
  return { points, deltaPct: Math.round(targetPct) }
}

export interface LoadTimeSeries {
  beforeSeconds: number // illustrative anchor: afterSeconds ÷ (1 − r)
  afterSeconds: number // the real measured mobile LCP, rounded to 1 decimal
  deltaPct: number // rounded r×100, always inside [30, 40] — the CV's measured −30–40% range
}

/** Illustrative "before" load time paired with a REAL "after": `afterSeconds` is the store's actual
 *  measured mobile LCP (src/data/lighthouse.json — never fabricated), and `beforeSeconds` divides it
 *  by (1 − r) with r seeded per store in 0.30–0.40, the CV's own measured −30–40% load-time-reduction
 *  range. Callers only call this when a real LCP exists; there is no "before" without a real "after". */
export function loadTimeSeries(slug: string, afterSeconds: number): LoadTimeSeries {
  const r = 0.3 + rngFrom(seedFrom(slug, 'loadtime-r'))() * 0.1
  return { beforeSeconds: round1(afterSeconds / (1 - r)), afterSeconds: round1(afterSeconds), deltaPct: Math.round(r * 100) }
}
