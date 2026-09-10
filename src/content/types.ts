import type { ExperienceId, RoleWorkId, StatId, SkillGroupId, StoreRole } from '../data/registry'
import type { WorkKind } from '../data/timeline'

interface SectionHeading {
  eyebrow: string
  title: string
  titleAccent: string
}

/**
 * Commerce-oriented figures for the "By the numbers" block (catalog/offer/delivery/reach), read
 * from the live storefront (src/data/commerce.json) and the registry — never a conversion rate,
 * revenue or AOV figure, which are not measured for these stores.
 */
export interface CommerceLabels {
  title: string // "By the numbers" — the block heading, replaces the build-trail block's old spot
  catalogLabel: string
  offerLabel: string
  deliveryLabel: string
  reachLabel: string
  catalogLine: string // '{products} products · {collections} collections · from {price}'
  catalogLineNoPrice: string // '{products} products · {collections} collections'
  deliveryLine: string // 'Shipped in {weeks} weeks · live since {month}'
  reachLine: string // '{currency} · ships to {n} places'
  reachLineSingle: string // '{currency} pricing'
  offerFallback: string // generic offer line when nothing more specific is derivable
  offerKind: Record<string, string> // short offer-mechanic labels keyed by the registry fact id
  vsFleetPct: string // '{sign}{pct}% vs fleet median'
  vsFleetWeeks: string // '{sign}{n} wk vs fleet median'
  unavailable: string // 'Public catalog not shown' — protected/unreachable storefronts
  engineering: string // collapsed row summary at the bottom of the sheet
}

export interface PortfolioContent {
  meta: { title: string; description: string }
  hero: {
    eyebrow: string
    positioning: string
    lead: string
    availability: string
    location: string
    ctaContact: string
    ctaPrimary: string
    ctaSecondary: string
    ctaNote: string
    ctaCv: string
  }
  stats: Record<StatId, string>
  /** One honest provenance line per stat band figure, shown on hover/tap so nothing reads as a boast without a source. */
  statSources: Record<StatId, string>
  sections: {
    experience: SectionHeading & { achievements: string; technologies: string; visit: string }
    shopify: SectionHeading & { lead: string; tabStores: string; tabProducts: string; legacyLabel: string; visit: string; showAll: string; showLess: string; filterAll: string; filters: Record<string, string> }
    gallery: SectionHeading & {
      lead: string
      filterAll: string
      filterLive: string
      filterDev: string
      viewLabel: string
      viewCarousel: string
      viewDevices: string
      viewPhones: string
      open: string
      close: string
      home: string
      pdp: string
      desktop: string
      mobile: string
    }
    now: { label: string; live: string; dev: string; band: string; local: string }
    statBand: { label: string; asOf: string; sourceLabel: string }
    careerSubway: SectionHeading & { lead: string; toggleShow: string; toggleHide: string; transferLabel: string; rowAria: string }
    process: SectionHeading & { problemLabel: string; problem: string; fixLabel: string; fix: string; stepOf: string; deliverableLabel: string; steps: { title: string; body: string; deliverable: string }[] }
    testimonials: SectionHeading
    faq: SectionHeading & { items: { q: string; a: string }[] }
    manifesto: { label: string; lines: string[] }
    years: SectionHeading & { lead: string; roles: string; shipped: string; work: string; products: string; side: string; more: string; count: string; perYear: string; eras: Record<string, string> }
    /** Apple's Years replacement: a horizontal scroll-snap rail of year cards (Chapters.tsx). */
    chapters: SectionHeading & {
      lead: string
      chapterOf: string // '{n} / {total}'
      prevAria: string
      nextAria: string
      highlightsLabel: string
    }
    /** Apple's new sticky scrollytelling section for one storefront build (FeaturedBuild.tsx). */
    featuredBuild: SectionHeading & {
      lead: string
      visit: string
      beats: { label: string; body: string }[] // problem -> plan -> build -> result, in order; {placeholders} filled from the registry
    }
    /** Apple's new section listing what the Playwright QA harness actually checks (ReviewChecklist.tsx). */
    reviewChecklist: SectionHeading & {
      lead: string
      countLabel: string // '{n}+ automated checks'
      cta: string
      groups: { label: string; items: string[] }[]
    }
    /** Luxury's Years intro: the unit chart re-narrated as one composed sentence per year. */
    fiveLines: {
      kinds: Record<WorkKind, { one: string; singular: string; plural: string }>
      numberWords: string[] // spelled 0..20, index-addressed; digits beyond that
      joiner: string // between a spelled number and its noun phrase ('' for Japanese counters)
      listJoiner: string // between phrases, all but the last
      listFinal: string // between the last two phrases
      empty: string // a year with nothing in the four kinds (defensive — every real year has at least one)
    }
    /** Brutalist's Years intro: a 60-cell (2022-01..2026-12) month calendar instead of the unit chart. */
    yearStrip: {
      legend: string
      monthAria: string // '{month} — {state}'
      activeState: string
      inactiveState: string
      currentState: string
      countUnit: string // 'active months' / 'meses activos' / '稼働月'
    }
    projects: SectionHeading & { view: string }
    skills: SectionHeading & {
      groups: Record<SkillGroupId, string>
      /** aria-label for the horizontal group-filter tabs above the tile grid. */
      groupSelectorLabel: string
      /** A one-line honest note per group — shown in the panel under whichever tool from that group is selected. */
      groupNote: Record<SkillGroupId, string>
      /** The compact depth strip above the grid: three real fleet totals, always the same three. */
      depthLabel: {
        liquid: string
        ts: string
        stores: string
      }
      usage: {
        /** Idle panel caption, before any tile is hovered/pinned. */
        caption: string
        storesUnit: string
        storesUnitOne: string
        productsUnit: string
        productsUnitOne: string
        roleUnit: string
        roleUnitOne: string
        noData: string
      }
      /** The selected-tool panel: name/group/usage come from usage.* and groupNote above. */
      panel: {
        eyebrow: string
        usageLabel: string
        pinned: string
        hint: string
      }
    }
    contact: SectionHeading & {
      lead: string
      promise: string
      status: string
      note: string
      cta: string
      ctaSecondary: string
      nextLabel: string
      next: string[]
      urlLabel: string
      urlPlaceholder: string
      email: string
      phone: string
      location: string
      elsewhere: string
    }
    explore: { eyebrow: string; title: string; lead: string; viewing: string }
    caseStudy: {
      facts: string; results: string; stack: string; visit: string; prev: string; next: string; timeline: string; commits: string; sections: string; open: string; metrics: string; perf: string; a11y: string; bp: string; seo: string; lcp: string; measured: string; trail: string; trailNote: string; perWeek: string; peak: string; codebase: string; liquidLines: string; islandLines: string; sectionsCount: string; weeks: string; copyLink: string; copied: string
      commerce: CommerceLabels
      /**
       * The sheet's "Impact" block, shown ABOVE "By the numbers": conversion + revenue-per-visitor
       * are illustrative (deterministic per store, see src/data/illustrative.ts) and anchored to the
       * real ranges on the CV; Lighthouse "after" and the LCP gauge are REAL (src/data/lighthouse.json).
       * `disclaimer` and `infoSentence` are fixed, owner-approved copy — do not paraphrase them.
       */
      impact: {
        title: string // "Impact" — the block heading
        conversionLabel: string // "Conversion, indexed" — line chart label
        conversionRangeNote: string // "Illustrative range: +10% to +20%" — under the conversion chart
        rpvLabel: string // "Revenue per visitor, indexed" — line chart label
        lighthouseLabel: string // "Lighthouse performance" — paired-bars block heading
        lighthouseMobile: string
        lighthouseDesktop: string
        before: string // paired-bars row label — illustrative
        after: string // paired-bars row label — REAL
        lighthouseSource: string // 'After: measured mobile + desktop Lighthouse performance, {date}.'
        speedLabel: string // "Mobile LCP, measured" — gauge label
        speedTarget: string // '≤{n}s — the "good" LCP threshold'
        speedSource: string // 'Measured Lighthouse LCP (mobile), {date}.'
        disclaimer: string // the required small-print line, verbatim, EN/ES/JA
        infoLabel: string // aria-label for the info-affordance button (aria-expanded)
        infoSentence: string // one sentence: ranges come from measured client work 2023–2026
      }
      /** The sheet's "visualized" charts block — every number traces to commerce.json (storefront
       *  public data), telemetry.json (git history) or a hand-verified registry fact. */
      charts: {
        title: string // section heading above the chart grid, e.g. "Visualized"
        compareLabel: string // "vs. fleet median" — the compare-bars block's own sub-heading
        thisStore: string // legend: this store's bar
        fleetMedian: string // legend: the fleet median bar / tick
        weeksMetric: string // "Delivery" row label
        productsMetric: string // "Catalog size" row label
        priceMetric: string // "Price midpoint" row label
        saleShare: string // gauge label: "Share of catalog on sale"
        ladder: string // discount-ladder chart label
        priceBand: string // price range bar label
        min: string
        max: string
        sourceStorefront: string // 'Storefront public data, fetched {date}'
        sourceGit: string // 'Git commit history'
        sourceFacts: string // 'Registry facts'
      }
    }
  }
  badges: { live: string; dev: string; current: string; completed: string; roles: Record<StoreRole, string> }
  experience: Record<
    ExperienceId,
    { title: string; summary: string; highlights: string[]; metricLabels: Record<string, string> }
  >
  roleWork: Record<RoleWorkId, string>
  stores: Record<string, { industry: string; tagline: string; description: string; factLabels?: Record<string, string> }>
  products: Record<string, { tagline: string; description: string }>
  projects: Record<string, { tagline: string; description: string }>
  footer: { tagline: string; services: string[]; servicesTitle: string; quickLinks: string; rights: string; stamp: string; backToTop: string }
  location: string
}
