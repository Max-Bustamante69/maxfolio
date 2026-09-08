export interface MarqueeItem {
  name: string
  meta?: string
  live?: boolean
}

interface MarqueeProps {
  items: MarqueeItem[]
  dark: boolean
  label: string
}

/**
 * Two counter-scrolling ticker rows of the fleet (CSS keyframes on transform, so it costs nothing on
 * the main thread and stops under reduced motion). The set is duplicated so the loop is seamless.
 */
export function Marquee({ items, dark, label }: MarqueeProps) {
  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half)]
  const cell = dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'
  const muted = dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'
  return (
    <div className="marquee rail-wide" role="region" aria-label={label}>
      {rows.map((row, r) => (
        <div key={r} className={`marquee-row ${r === 1 ? 'marquee-row-reverse' : ''}`} aria-hidden={r === 1 ? 'true' : undefined}>
          {[0, 1].map((copy) => (
            <ul key={copy} className="marquee-track" aria-hidden={copy === 1 ? 'true' : undefined}>
              {row.map((it) => (
                <li key={it.name} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap px-5 py-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${it.live === false ? 'bg-[#ff9f0a]' : 'bg-[#34c759]'}`} aria-hidden="true" />
                  <span className={`font-sf text-lg font-semibold tracking-[-0.02em] ${cell}`}>{it.name}</span>
                  {it.meta && <span className={`text-sm ${muted}`}>{it.meta}</span>}
                </li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </div>
  )
}
