import { useContent } from '../../hooks'
import { RevealText } from '../common'
import type { Skin } from '../gallery'

/**
 * Four declarative lines on an inverted full-bleed band — a typographic moment between two
 * media-heavy sections, and the working rules the Process section already spells out, said short.
 */
export function Manifesto({ skin }: { skin: Skin }) {
  const { strings } = useContent()
  const mf = strings.sections.manifesto
  const band = skin.dark ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'bg-[#1d1d1f] text-[#f5f5f7]'
  const eyebrow = skin.dark ? 'text-[#0066cc]' : 'text-[#2997ff]'
  return (
    <section aria-label={mf.label} className={`${band} px-4 py-24 md:py-36`}>
      <div className="mx-auto max-w-5xl">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${eyebrow}`}>{mf.label}</p>
        <ul className="mt-6 space-y-2 md:space-y-3">
          {mf.lines.map((line, i) => (
            <li key={line} className="font-sf text-4xl font-semibold leading-[1.06] tracking-[-0.03em] md:text-6xl lg:text-7xl">
              <RevealText text={line} delay={i * 0.12} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
