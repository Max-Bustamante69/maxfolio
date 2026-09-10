import { m } from 'framer-motion'
import { useContent } from '../../hooks'
import { RevealText } from '../common'
import type { Skin } from '../gallery'

interface ManifestoProps {
  skin: Skin
  /** Overrides the inverted band's background+text classes (defaults to the Apple grays every other theme uses). */
  bandClassName?: string
  /** Overrides the eyebrow's accent color. */
  eyebrowClassName?: string
  /** Optional full-bleed ground image behind the band, rendered at a low fixed opacity directly onto
   * the band's own solid color — that solid color is the scrim, so text contrast never depends on a
   * second computed class (Tailwind can't see a dynamically-built arbitrary-value string at build
   * time). Decorative only; never the sole carrier of information. */
  backdropSrc?: string
}


/**
 * Four declarative lines on an inverted full-bleed band — a typographic moment between two
 * media-heavy sections, and the working rules the Process section already spells out, said short.
 * The band itself rises into view behind a clip-path curtain (bottom edge wipes up, once), so the
 * inversion reads as a physical reveal rather than a plain crossfade; reduced motion skips the wipe.
 */
export function Manifesto({ skin, bandClassName, eyebrowClassName, backdropSrc }: ManifestoProps) {
  const { strings } = useContent()
  const mf = strings.sections.manifesto
  const band = bandClassName ?? (skin.dark ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'bg-[#1d1d1f] text-[#f5f5f7]')
  const eyebrow = eyebrowClassName ?? (skin.dark ? 'text-[#0066cc]' : 'text-[#2997ff]')
  // The band is never hidden behind a reveal: a whole-section curtain that misses its intersection leaves a
  // viewport-sized blank (seen live, 2026-09-09). Only the lines inside animate.
  return (
    <m.section
      aria-label={mf.label}
      className={`relative overflow-hidden ${band} px-4 py-24 md:py-36`}
      initial={false}
    >
      {backdropSrc && (
        <img
          src={backdropSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
        />
      )}
      <div className="relative mx-auto max-w-5xl">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${eyebrow}`}>{mf.label}</p>
        <ul className="mt-6 space-y-2 md:space-y-3">
          {mf.lines.map((line, i) => (
            <li key={line} className="font-sf text-4xl font-semibold leading-[1.06] tracking-[-0.03em] md:text-6xl lg:text-7xl">
              <RevealText text={line} delay={i * 0.12} />
            </li>
          ))}
        </ul>
      </div>
    </m.section>
  )
}
