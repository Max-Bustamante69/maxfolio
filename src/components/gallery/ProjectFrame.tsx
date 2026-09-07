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
export function ProjectFrame({ name, shots, skin, onOpen, alt, variant = 'composite' }: ProjectFrameProps) {
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
      </button>
    )
  }

  return (
    <button type="button" onClick={onOpen} {...bind} className={`group relative block w-full pb-[9%] pr-[3%] text-left ${skin.frame === 'brutalist' ? '' : ''}`} aria-label={`${name}: ${alt}`}>
      <LaptopFrame>
        <Crossfade base={shots.homeDesktop} over={shots.pdpDesktop} alt={alt} hover={hover} label="home, desktop" />
      </LaptopFrame>
      <div className={`absolute bottom-0 right-0 w-[24%] min-w-[72px] transition-transform duration-500 ${hover ? '-translate-y-1' : ''}`}>
        <PhoneFrame>
          <Crossfade base={shots.homeMobile} over={shots.pdpMobile} alt={alt} hover={hover} label="home, mobile" />
        </PhoneFrame>
      </div>
    </button>
  )
}
