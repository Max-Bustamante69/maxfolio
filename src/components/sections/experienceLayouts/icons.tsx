// One small monoline icon per metric family, chosen from the metric `id` string already in the
// registry (never new data). Purely decorative (`aria-hidden` at the call site); the real value is
// always carried by adjacent text.
type IconProps = { className?: string }

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function IconLayers({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <path d="M10 2.5 2.5 7 10 11.5 17.5 7 10 2.5Z" />
      <path d="M2.5 10.5 10 15l7.5-4.5" />
      <path d="M2.5 14 10 18.5 17.5 14" />
    </svg>
  )
}

function IconGrid({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  )
}

function IconCheck({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="m6.5 10.2 2.4 2.4 4.6-5.2" />
    </svg>
  )
}

function IconPeople({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <circle cx="7" cy="6.5" r="2.5" />
      <path d="M2.2 16c.6-3 2.4-4.5 4.8-4.5S11.8 13 12.4 16" />
      <circle cx="14.5" cy="7.5" r="2" />
      <path d="M13 11.7c1.9.2 3.2 1.6 3.7 3.8" />
    </svg>
  )
}

function IconSpeed({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <path d="M3 14.5a7 7 0 0 1 14 0" />
      <path d="M10 14.5 13.5 9" />
      <path d="M10 14.5h.01" />
    </svg>
  )
}

function IconTrend({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <path d="M2.5 15 7.5 9l3 3 6.5-8" />
      <path d="M13.5 4h3.5v3.5" />
    </svg>
  )
}

function IconSpark({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden="true">
      <path d="M10 2.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z" strokeLinejoin="round" />
    </svg>
  )
}

export type MetricIconName = 'layers' | 'grid' | 'check' | 'people' | 'speed' | 'trend' | 'spark'

/** Heuristic, derived only from the metric `id` already in registry.ts — never new data, just a
 *  visual family for an id that already exists (storefronts/templates/pages/components → layers,
 *  modules → grid, tests → check, contacts/users → people, *time/*entry → speed,
 *  conversion/organic/savings → trend). */
export function metricIconName(id: string): MetricIconName {
  const s = id.toLowerCase()
  if (s.includes('test')) return 'check'
  if (s.includes('module')) return 'grid'
  if (s.includes('contact') || s.includes('user')) return 'people'
  if (s.includes('storefront') || s.includes('template') || s.includes('page') || s.includes('component')) return 'layers'
  if (s.includes('time') || s.includes('entry')) return 'speed'
  if (s.includes('conversion') || s.includes('organic') || s.includes('saving')) return 'trend'
  return 'spark'
}

export function MetricIcon({ name, className }: { name: MetricIconName; className?: string }) {
  switch (name) {
    case 'layers':
      return <IconLayers className={className} />
    case 'grid':
      return <IconGrid className={className} />
    case 'check':
      return <IconCheck className={className} />
    case 'people':
      return <IconPeople className={className} />
    case 'speed':
      return <IconSpeed className={className} />
    case 'trend':
      return <IconTrend className={className} />
    default:
      return <IconSpark className={className} />
  }
}
