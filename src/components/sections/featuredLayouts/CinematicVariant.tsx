// Variant C — "cinematic": a full-bleed dark band (Manifesto.tsx's inverted-band technique, not a
// second computed background class) with the store's desktop capture as a slow parallax backdrop
// under a measured scrim — a fixed 0.16 image opacity on a near-black solid ground, the same ratio
// Manifesto already clears AA with, so text contrast never depends on a dynamically-built class.
// Oversized display type reveals line by line with RevealText's clip-mask technique, a ticker carries
// the real facts, and one CTA opens the gallery sheet for this store. The whole band is visible at
// rest — only the two headline lines and the ticker's continuous motion animate; the parallax itself
// is a transform tied to scroll position, not a reveal that could miss.
import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { RevealText, Ticker } from '../../common'
import { fill, type FeaturedData } from './types'

export function CinematicVariant({ data }: { data: FeaturedData }) {
  const { fb, vars, img, sheetHref } = data
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])

  const lines = [fb.title.replace(/[,、]\s*$/, ''), fb.titleAccent]
  const ticker = fb.ticker.map((t) => fill(t, vars))

  return (
    <div ref={sectionRef} className="relative -mx-4 overflow-hidden rounded-[22px] bg-[#08080a] px-4 py-12 text-[#f5f5f7] sm:mx-0 md:py-16">
      <m.img
        src={img('home', 'desktop')}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={reduced ? undefined : { y }}
        className="pointer-events-none absolute inset-0 h-[112%] w-full object-cover opacity-[0.16]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2997ff]">{fb.eyebrow}</p>
        <h3 className="mt-4 font-sf font-semibold leading-[1.02] tracking-[-0.03em]" style={{ fontSize: 'clamp(2.5rem, 4vw + 2rem, 6rem)' }}>
          {lines.map((line, i) => (
            <span key={line} className="block">
              <RevealText text={line} delay={i * 0.12} />
            </span>
          ))}
        </h3>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#a1a1a6] md:text-lg">{fb.lead}</p>

        <a
          href={sheetHref}
          className="press mt-8 inline-flex items-center justify-center rounded-full bg-[#0071e3] px-6 py-3 text-sm font-medium text-white hover:bg-[#0077ed]"
        >
          {fb.cta}
        </a>
      </div>

      <div className="relative mt-14 rail-wide md:mt-16">
        <Ticker
          variant="outline-fill"
          duration={30}
          label={fb.eyebrow}
          items={ticker}
          keyOf={(t) => t}
          itemClassName="shrink-0 whitespace-nowrap px-5 py-2 font-sf text-xl font-semibold uppercase tracking-[-0.01em] text-[#f5f5f7] md:text-2xl"
          renderItem={(t) => t}
        />
      </div>
    </div>
  )
}
