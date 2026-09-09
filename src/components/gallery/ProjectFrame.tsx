import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { m, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useInView, type MotionValue } from 'framer-motion'
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

const Crossfade = ({
  base,
  over,
  alt,
  hover,
  label,
  scale,
}: {
  base: string
  over?: string
  alt: string
  hover: boolean
  label: string
  /** Subtle scroll-linked zoom (1 → 1.03 → 1) as the card crosses the viewport; the frame clips it. */
  scale?: MotionValue<number>
}) => (
  <m.div className="absolute inset-0" style={scale ? { scale } : undefined}>
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
  </m.div>
)

const Invite = ({ text, skin }: { text: string; skin: Skin }) => {
  const d = skin.dark
  const shape = skin.frame === 'apple' || skin.frame === 'neo' ? 'rounded-full' : 'rounded-none'
  const surface = d
    ? 'glass bg-white/[0.12] text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.4)]'
    : 'glass bg-white/70 text-[#1d1d1f] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.14)]'
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-[38%] z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap px-3.5 py-1.5 text-xs font-medium transition-[opacity,transform] duration-200 ease-out-strong ${shape} ${surface} opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100`}
      style={{ transform: 'translateZ(60px)' }}
    >
      {text} <span aria-hidden="true">›</span>
    </span>
  )
}

/** Spring for the pointer-tracking tilt: quick to follow, no visible bounce. */
const TILT = { stiffness: 220, damping: 24, mass: 0.5 }
const SETTLE = { type: 'spring', duration: 0.5, bounce: 0.12 } as const

/**
 * Same devices for every project so the gallery reads as one system. On pointer devices the
 * composite tilts toward the cursor in real 3D (perspective + preserve-3d), the phone floats on
 * its own plane, a specular glare crosses the laptop screen and the floor shadow deepens — all
 * transforms and opacity, spring-interpolated, off for reduced motion. Hovering (or focusing)
 * also crossfades home → product page.
 */
export function ProjectFrame({ name, shots, skin, onOpen, alt, variant = 'composite', cta }: ProjectFrameProps) {
  const [hover, setHover] = useState(false)
  const reduced = useReducedMotion()
  // Touch has no hover: while the frame is in view, it crossfades home → product page on its own.
  const [auto, setAuto] = useState(false)
  const rootRef = useRef<HTMLButtonElement>(null)
  const inView = useInView(rootRef, { amount: 0.6 })
  useEffect(() => {
    if (reduced || !inView || !window.matchMedia('(hover: none)').matches) {
      setAuto(false)
      return
    }
    const id = window.setInterval(() => setAuto((v) => !v), 3200)
    return () => window.clearInterval(id)
  }, [inView, reduced])
  // pointer position inside the card, 0..1 — springs so the tilt lags the cursor like a physical object
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, TILT)
  const sy = useSpring(py, TILT)
  const rotateY = useTransform(sx, [0, 1], [-6, 6])
  const rotateX = useTransform(sy, [0, 1], [5, -5])
  // Subtle scale-on-scroll for the captures themselves (1 → 1.03 → 1 as the card crosses the viewport), independent of the pointer-tilt scale above.
  const { scrollYProgress: frameProgress } = useScroll({ target: rootRef, offset: ['start end', 'end start'] })
  const imgScale = useTransform(frameProgress, [0, 0.5, 1], [1, 1.03, 1])
  const phoneX = useTransform(sx, [0, 1], [18, -18])
  const phoneY = useTransform(sy, [0, 1], [14, -14])
  const glareX = useTransform(sx, (v) => `${Math.round(v * 100)}%`)
  const glareY = useTransform(sy, (v) => `${Math.round(v * 100)}%`)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.38), rgba(255,255,255,0.08) 32%, rgba(255,255,255,0) 60%)`

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)))
  }
  const rest = () => {
    px.set(0.5)
    py.set(0.5)
  }
  const bind = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false)
      rest()
    },
    onMouseMove: onMove,
    onFocus: () => setHover(true),
    onBlur: () => {
      setHover(false)
      rest()
    },
  }
  const tilt = reduced ? {} : { rotateX, rotateY }
  const lift = hover && !reduced

  const Glare = () => (
    <m.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-300 ${lift ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundImage: glare }}
    />
  )

  if (variant === 'phone') {
    return (
      <button type="button" ref={rootRef} onClick={onOpen} {...bind} className="group relative block w-full px-[4%] text-left" aria-label={cta ? `${cta} · ${name}` : `${name}: ${alt}`}>
        <PhoneFrame>
          <Crossfade base={shots.homeMobile} over={shots.pdpMobile} alt={alt} hover={hover || auto} label="home, mobile" scale={reduced ? undefined : imgScale} />
        </PhoneFrame>
      </button>
    )
  }

  if (variant === 'laptop') {
    return (
      <button type="button" ref={rootRef} onClick={onOpen} {...bind} className="group relative block w-full text-left" aria-label={cta ? `${cta} · ${name}` : `${name}: ${alt}`} style={{ perspective: 1200 }}>
        <m.div style={{ ...tilt, transformStyle: 'preserve-3d' }} animate={{ scale: lift ? 1.025 : 1 }} transition={SETTLE} className={`relative ${hover ? 'will-change-transform' : ''}`}>
          <LaptopFrame>
            <Crossfade base={shots.homeDesktop} over={shots.pdpDesktop} alt={alt} hover={hover || auto} label="home, desktop" scale={reduced ? undefined : imgScale} />
            <Glare />
          </LaptopFrame>
          {cta && <Invite text={cta} skin={skin} />}
        </m.div>
        <Floor lift={lift} />
      </button>
    )
  }

  return (
    <button type="button" ref={rootRef} onClick={onOpen} {...bind} className="group relative block w-full pb-[9%] pr-[3%] text-left" aria-label={cta ? `${cta} · ${name}` : `${name}: ${alt}`} style={{ perspective: 1200 }}>
      {/* will-change only while a hover/tilt animation is actually running — a static value on up to 18
          cards is the permanent-will-change GPU-memory antipattern (wf4-seo-perf.md §3.11). */}
      <m.div style={{ ...tilt, transformStyle: 'preserve-3d' }} animate={{ scale: lift ? 1.03 : 1 }} transition={SETTLE} className={`relative ${hover ? 'will-change-transform' : ''}`}>
        <LaptopFrame>
          <Crossfade base={shots.homeDesktop} over={shots.pdpDesktop} alt={alt} hover={hover || auto} label="home, desktop" scale={reduced ? undefined : imgScale} />
          <Glare />
        </LaptopFrame>
        {cta && <Invite text={cta} skin={skin} />}
        {/* the phone floats on its own plane, 48px in front of the lid, and drifts against the tilt */}
        <m.div
          className="absolute bottom-0 right-0 w-[24%] min-w-[72px]"
          style={{ x: reduced ? 0 : phoneX, y: reduced ? 0 : phoneY, z: 64, rotateY: reduced ? 0 : -8 }}
          animate={{ translateY: lift ? -6 : 0 }}
          transition={SETTLE}
        >
          <PhoneFrame>
            <Crossfade base={shots.homeMobile} over={shots.pdpMobile} alt={alt} hover={hover || auto} label="home, mobile" scale={reduced ? undefined : imgScale} />
          </PhoneFrame>
        </m.div>
      </m.div>
      <Floor lift={lift} />
    </button>
  )
}

/** Soft floor shadow under the devices: reads as depth at rest, deepens and spreads on lift. */
const Floor = ({ lift }: { lift: boolean }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute inset-x-[8%] bottom-[2%] -z-10 h-[12%] rounded-[50%] bg-black blur-2xl transition-[opacity,transform] duration-500 ease-out-strong ${lift ? 'scale-110 opacity-30' : 'opacity-20'}`}
  />
)
