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
    statBand: { label: string; asOf: string }
    buildHeatmap: { label: string; headline: string; legendLow: string; legendHigh: string; cellAria: string; half1: string; half2: string }
    stackByYear: SectionHeading & { lead: string; rankAria: string; countUnit: string }
    fleetMap: SectionHeading & { lead: string; filterAll: string }
    careerSubway: SectionHeading & { lead: string; toggleShow: string; toggleHide: string; transferLabel: string; rowAria: string }
    process: SectionHeading & { problemLabel: string; problem: string; fixLabel: string; fix: string; stepOf: string; deliverableLabel: string; steps: { title: string; body: string; deliverable: string }[] }
    testimonials: SectionHeading
    faq: SectionHeading & { items: { q: string; a: string }[] }
    manifesto: { label: string; lines: string[] }
    years: SectionHeading & { lead: string; roles: string; shipped: string; work: string; products: string; side: string; more: string; count: string; perYear: string; eras: Record<string, string> }
    /** Apple's Years replacement: a Gantt ribbon (new BuildTimeline.tsx), not the shared Years.tsx. */
    buildTimeline: SectionHeading & {
      lead: string
      employers: string
      storefronts: string
      products: string
      personal: string
      current: string
      roleAria: string // '{title} at {company}, {period}'
      buildAria: string // '{name}, built {period}'
      dotAria: string // '{name}, {year}'
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
