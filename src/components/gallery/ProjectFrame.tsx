import { useState } from 'react'
import type { Skin } from './skins'
import { LaptopFrame, PhoneFrame } from './DeviceFrame'

export interface FrameShots {
  homeDesktop: string
  pdpDesktop?: string
  homeMobile: string
  pdpMobile?: string
}

interface ProjectFrameProps {
  name: string
  shots: FrameShots
  skin: Skin
  onOpen?: () => void
  alt: string
  /** 'composite' = laptop with a phone overlapping its corner; 'laptop' = laptop only; 'phone' = phone only */
  variant?: 'composite' | 'laptop' | 'phone'
  /** Invitation pill over the laptop screen ("Case study ›"): hover/focus on pointer devices, always on touch. */
  cta?: string
}

const Invite = ({ text, skin }: { text: string; skin: Skin }) => {
  const d = skin.dark
  const shape = skin.frame === 'apple' ? 'rounded-full' : 'rounded-none'
  const surface = d
    ? 'glass bg-white/[0.12] text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.4)]'
    : 'glass bg-white/70 text-[#1d1d1f] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.14)]'
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-[38%] z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap px-3.5 py-1.5 text-xs font-medium transition-[opacity,transform] duration-200 ease-out-strong ${shape} ${surface} opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100`}
    >
      {text} <span aria-hidden="true">›</span>
    </span>
  )
}

const Crossfade = ({ base, over, alt, hover, label }: { base: string; over?: string; alt: string; hover: boolean; label: string }) => (
  <>
    <img src={base} alt={`${alt} — ${label}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
    {over && (
      <img
        src={over}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
      />
    )}
  </>
)

/**
 * Same devices for every project so the gallery reads as one system.
 * Hovering (or focusing) crossfades home → product page on the desktop screen.
 */
export function ProjectFrame({ name, shots, skin, onOpen, alt, variant = 'composite', cta }: ProjectFrameProps) {
  const [hover, setHover] = useState(false)
  const bind = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
  }

  if (variant === 'phone') {
    return (
      <button type="button" onClick={onOpen} {...bind} className="group relative block w-full px-[4%] text-left" aria-label={`${name}: ${alt}`}>
        <PhoneFrame>
          <Crossfade base={shots.homeMobile} over={shots.pdpMobile} alt={alt} hover={hover} label="home, mobile" />
        </PhoneFrame>
      </button>
    )
  }

  if (variant === 'laptop') {
    return (
      <button type="button" onClick={onOpen} {...bind} className="group relative block w-full text-left" aria-label={`${name}: ${alt}`}>
        <LaptopFrame>
          <Crossfade base={shots.homeDesktop} over={shots.pdpDesktop} alt={alt} hover={hover} label="home, desktop" />
        </LaptopFrame>
        {cta && <Invite text={cta} skin={skin} />}
      </button>
    )
  }

  return (
    <button type="button" onClick={onOpen} {...bind} className={`group relative block w-full pb-[9%] pr-[3%] text-left ${skin.frame === 'brutalist' ? '' : ''}`} aria-label={`${name}: ${alt}`}>
      <LaptopFrame>
        <Crossfade base={shots.homeDesktop} over={shots.pdpDesktop} alt={alt} hover={hover} label="home, desktop" />
      </LaptopFrame>
      {cta && <Invite text={cta} skin={skin} />}
      <div className={`absolute bottom-0 right-0 w-[24%] min-w-[72px] transition-transform duration-500 ${hover ? '-translate-y-1' : ''}`}>
        <PhoneFrame>
          <Crossfade base={shots.homeMobile} over={shots.pdpMobile} alt={alt} hover={hover} label="home, mobile" />
        </PhoneFrame>
      </div>
    </button>
  )
}
