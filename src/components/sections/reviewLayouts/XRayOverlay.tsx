// Direction B — "x-ray overlay" (axis: space). Instead of replaying a timeline, this direction
// argues by place: a real home-page capture sits inside the device frame, seven group chips sit
// beside it, and picking a chip draws an outlined callout over the page region that group's checks
// actually touch, with numbered pins matching a numbered item list beside it. No run, no timer — the
// section states its case by pointing at the page, not by narrating a sequence. Region rectangles are
// illustrative placement (percent of the frame) reasoned from what each group plausibly touches on a
// storefront home page, not a pixel-measured read of this specific capture.
import { useState } from 'react'
import { m } from 'framer-motion'
import { LaptopFrame, PhoneFrame } from '../../gallery'
import { EASE, ICON_PATHS, type ReviewData } from './types'

const SHOT = { desktop: '/gallery/the-gummy-box/home-desktop.webp', mobile: '/gallery/the-gummy-box/home-mobile.webp' }

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** One region per group, fixed order matching `rc.groups`. Illustrative — see file header. */
const REGIONS: Rect[] = [
  { x: 72, y: 2, w: 24, h: 7 }, // Commerce — header cart icon
  { x: 6, y: 34, w: 40, h: 26 }, // Content — a card in the grid
  { x: 4, y: 88, w: 92, h: 10 }, // Data — footer
  { x: 4, y: 34, w: 92, h: 40 }, // Geometry — the grid itself
  { x: 4, y: 58, w: 92, h: 15 }, // Motion — a carousel row
  { x: 2, y: 2, w: 28, h: 7 }, // Navigation — the menu
  { x: 0, y: 0, w: 100, h: 11 }, // Overlays — the header band
]

export function XRayOverlay({ data }: { data: ReviewData }) {
  const { skin, rc, reduced } = data
  const [active, setActive] = useState(0)
  const group = rc.groups[active]
  const region = REGIONS[active]

  const Overlay = (
    <>
      <m.div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-[6px] border-2 ${skin.accent}`}
        style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.w}%`, height: `${region.h}%`, borderColor: 'currentColor' }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
      />
      {group.items.map((_, ii) => {
        const n = group.items.length
        const px = region.x + (region.w * (n === 1 ? 0.5 : ii / (n - 1)))
        return (
          <m.span
            key={ii}
            aria-hidden="true"
            className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-semibold text-white ${skin.accentBg}`}
            style={{ left: `${px}%`, top: `${region.y}%` }}
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : ii * 0.03, ease: EASE }}
          >
            {ii + 1}
          </m.span>
        )
      })}
    </>
  )

  return (
    <div className={`grid gap-6 border-t pt-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-10 ${skin.line}`}>
      {/* Left: the real capture with the active group's callout. */}
      <div className="mx-auto w-full max-w-[360px] md:max-w-none">
        <div className="hidden md:block">
          <LaptopFrame>
            <img src={SHOT.desktop} alt={rc.screenshotAlt} className="h-full w-full object-cover object-top" width={1280} height={800} loading="lazy" decoding="async" />
            {Overlay}
          </LaptopFrame>
        </div>
        <div className="md:hidden">
          <PhoneFrame className="mx-auto w-[62%]">
            <img src={SHOT.mobile} alt={rc.screenshotAlt} className="h-full w-full object-cover object-top" width={430} height={880} loading="lazy" decoding="async" />
            {Overlay}
          </PhoneFrame>
        </div>
        <p className={`mt-4 text-center text-xs leading-relaxed md:text-left ${skin.muted}`}>{rc.runCaption}</p>
      </div>

      {/* Right: 7 group chips, then the active group's numbered items. */}
      <div>
        <div role="radiogroup" aria-label={rc.eyebrow} className="flex flex-wrap gap-1.5">
          {rc.groups.map((g, gi) => (
            <button
              key={g.label}
              type="button"
              role="radio"
              aria-checked={active === gi}
              aria-label={rc.xrayChipAria.replace('{group}', g.label)}
              onClick={() => setActive(gi)}
              className={`press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active === gi ? skin.chipOn : skin.chip}`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                <path d={ICON_PATHS[gi]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {g.label}
              <span className="tabular-nums opacity-75">{g.items.length}</span>
            </button>
          ))}
        </div>

        <ul className={`mt-5 space-y-2.5 rounded-[18px] border p-4 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
          {group.items.map((item, ii) => (
            <li key={item} className="flex items-start gap-2.5 text-[13px] leading-snug">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${skin.accentBg}`}>{ii + 1}</span>
              <span className={skin.body}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
