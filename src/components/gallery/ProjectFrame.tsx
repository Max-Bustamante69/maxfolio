import { useState } from 'react'
import type { Skin } from './skins'

export interface FrameShots {
  homeDesktop: string
  pdpDesktop?: string
  homeMobile: string
  pdpMobile?: string
}

interface ProjectFrameProps {
  name: string
  url?: string
  shots: FrameShots
  skin: Skin
  onOpen?: () => void
  alt: string
}

const RADIUS: Record<Skin['frame'], { desktop: string; mobile: string }> = {
  apple: { desktop: 'rounded-[12px]', mobile: 'rounded-[26px]' },
  luxury: { desktop: 'rounded-none', mobile: 'rounded-[22px]' },
  brutalist: { desktop: 'rounded-none', mobile: 'rounded-none' },
}

/**
 * CSS-only device frames so every project renders at the same size:
 * a browser window (16:10) with the phone (390:844) overlapping its corner.
 * Hovering the desktop frame crossfades home → product page.
 */
export function ProjectFrame({ name, url, shots, skin, onOpen, alt }: ProjectFrameProps) {
  const [hover, setHover] = useState(false)
  const r = RADIUS[skin.frame]
  let host = ''
  try {
    host = url ? new URL(url).host.replace(/^www\./, '') : ''
  } catch {
    host = ''
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative block w-full text-left pb-6 pr-2"
      aria-label={`${name}: ${alt}`}
    >
      {/* Desktop browser frame */}
      <div
        className={`relative overflow-hidden ${r.desktop} ${
          skin.frame === 'brutalist' ? 'border-2 border-stone-900' : 'ring-1 ring-black/10'
        } bg-[#e8e8ed]`}
      >
        <div className="flex items-center gap-1.5 px-3 h-7 text-[10px] text-black/40">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate rounded bg-white/70 px-2 py-0.5 text-left">{host}</span>
        </div>
        <div className="relative aspect-[16/10] bg-white">
          <img
            src={shots.homeDesktop}
            alt={`${alt} — home, desktop`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {shots.pdpDesktop && (
            <img
              src={shots.pdpDesktop}
              alt={`${alt} — product page, desktop`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
                hover ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>
      </div>

      {/* Phone frame overlapping the bottom-right corner */}
      <div
        className={`absolute bottom-0 right-0 w-[24%] min-w-[74px] overflow-hidden ${r.mobile} border-[3px] border-[#1d1d1f] bg-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-transform duration-500 ${
          hover ? '-translate-y-1' : ''
        }`}
      >
        <div className="relative aspect-[390/844]">
          <img
            src={shots.homeMobile}
            alt={`${alt} — home, mobile`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </button>
  )
}
