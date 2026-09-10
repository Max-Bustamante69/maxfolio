import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { SEOHead, TransitionLink, Magnetic, Ticker, LanguageSelectorMenu, SmoothScroll, useLenis } from '../components/common'
import { ContactFormModal } from '../components/modals'
import { MenuPreview } from '../components/previews'
import { StatBand } from '../components/sections/StatBand'
import { Experience } from '../components/sections/Experience'
import { skins } from '../components/gallery/skins'
import { useDynamicFavicon, useI18n, useContent } from '../hooks'
import { designById, otherDesigns, MENU } from '../data/designs'
import { personaArt } from '../data/personaArt'
import '../styles/persona.css'

// Each screen's heavier sections arrive as their own chunk, one shared Suspense boundary per screen
// (not one per section) — a screen either shows its finished content or one themed loading state,
// never several stacked blank fallbacks at different scroll depths.
const Years = lazy(() => import('../components/sections/Years').then((mod) => ({ default: mod.Years })))
const Process = lazy(() => import('../components/sections/Process').then((mod) => ({ default: mod.Process })))
const ShopifyWork = lazy(() => import('../components/sections/ShopifyWork').then((mod) => ({ default: mod.ShopifyWork })))
const Gallery = lazy(() => import('../components/sections/Gallery').then((mod) => ({ default: mod.Gallery })))
const Manifesto = lazy(() => import('../components/sections/Manifesto').then((mod) => ({ default: mod.Manifesto })))
const Projects = lazy(() => import('../components/sections/Projects').then((mod) => ({ default: mod.Projects })))
const Skills = lazy(() => import('../components/sections/Skills').then((mod) => ({ default: mod.Skills })))
const Faq = lazy(() => import('../components/sections/Faq').then((mod) => ({ default: mod.Faq })))
const Contact = lazy(() => import('../components/sections/Contact').then((mod) => ({ default: mod.Contact })))

const SNAP = { type: 'spring' as const, stiffness: 420, damping: 24 }
const EASE = [0.23, 1, 0.32, 1] as const

// ---------------------------------------------------------------------------
// Screens & hash routing — the menu is the entry ("" / "#menu"); each screen is its own hash so
// deep links, Back/Forward and the persistent bar all address the same five destinations.
// ---------------------------------------------------------------------------
type ScreenId = 'home' | 'work' | 'years' | 'skills' | 'contact'
type Route = ScreenId | ''
const SCREEN_IDS: ScreenId[] = ['home', 'work', 'years', 'skills', 'contact']

function normalizeHash(hash: string): Route {
  const v = hash.replace(/^#/, '').toLowerCase()
  if (v === '' || v === 'menu') return ''
  return (SCREEN_IDS as string[]).includes(v) ? (v as ScreenId) : ''
}

/** Reads/writes the URL hash as the single source of truth for which screen is showing. */
function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => (typeof window === 'undefined' ? '' : normalizeHash(window.location.hash)))
  useEffect(() => {
    const onHash = () => setRoute(normalizeHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const navigate = useCallback((r: Route) => {
    const target = r === '' ? '#menu' : `#${r}`
    if (window.location.hash === target) return
    window.location.hash = target
  }, [])
  return [route, navigate]
}

/** Writes the page's own scroll offset to `--p-scroll-y` (Lenis when running, window scroll otherwise) — one listener for the whole parallax system. Off under reduced motion. */
function useScrollVar(rootRef: RefObject<HTMLElement | null>) {
  const lenis = useLenis()
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    const el = rootRef.current
    if (!el) return
    const setVar = (y: number) => el.style.setProperty('--p-scroll-y', String(y))
    if (lenis) return lenis.on('scroll', (l) => setVar(l.scroll))
    const onWinScroll = () => setVar(window.scrollY)
    window.addEventListener('scroll', onWinScroll, { passive: true })
    onWinScroll()
    return () => window.removeEventListener('scroll', onWinScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, reduced])
}

/** Muted-by-default optional select blip — a tiny generated WebAudio tone, never an audio file. */
function useSfx() {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  useEffect(() => {
    try {
      setEnabled(localStorage.getItem('persona-sfx') === '1')
    } catch {
      /* private mode / storage blocked: stay muted */
    }
  }, [])
  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v
      try {
        localStorage.setItem('persona-sfx', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])
  const play = useCallback(
    (freq = 760) => {
      if (!enabled) return
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!Ctx) return
        const ctx = ctxRef.current ?? new Ctx()
        ctxRef.current = ctx
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
        osc.connect(gain).connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.09)
      } catch {
        /* autoplay policy or no AudioContext: silently skip */
      }
    },
    [enabled],
  )
  return { enabled, toggle, play }
}

// ---------------------------------------------------------------------------
// Ransom-note lettering — own implementation: each glyph gets a small, seeded (not animated-away)
// rotation/offset/scale, like letters cut from print and pasted at odd angles. Frozen flush under
// reduced motion.
// ---------------------------------------------------------------------------
function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h || 1
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function RansomText({ text, className = '', intensity = 1 }: { text: string; className?: string; intensity?: number }) {
  const reduced = useReducedMotion()
  const glyphs = useMemo(() => {
    const rand = mulberry32(hashStr(text))
    return text.split('').map((ch) => ({
      ch,
      rotate: (rand() - 0.5) * 14 * intensity,
      y: (rand() - 0.5) * 10 * intensity,
      scale: 1 + (rand() - 0.5) * 0.16 * intensity,
    }))
  }, [text, intensity])
  return (
    <span className={className} aria-label={text}>
      {glyphs.map((g, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block"
          style={reduced ? undefined : { transform: `translateY(${g.y.toFixed(2)}px) rotate(${g.rotate.toFixed(2)}deg) scale(${g.scale.toFixed(3)})`, transformOrigin: 'bottom' }}
        >
          {g.ch === ' ' ? ' ' : g.ch}
        </span>
      ))}
    </span>
  )
}

/** Full-bleed comic-panel art behind a hero band only — never behind body copy. Cropped to its own
 *  section via `overflow-clip` on the caller, parallaxed at 0.2x, scrimmed to the theme's own AA-safe
 *  tint (`--p-scrim` in persona.css), with a sparse halftone wash on top so it reads as one ink layer
 *  rather than a stock photo. `torn` clips the art to the same jagged panel edge as `.persona-torn`. */
function ScreenBackdrop({ screen, isDark, accentCls, torn = false, menu = false }: { screen: 'menu' | ScreenId; isDark: boolean; accentCls: string; torn?: boolean; menu?: boolean }) {
  const src = personaArt(screen, isDark)
  return (
    <div aria-hidden="true" className={`persona-backdrop ${menu ? 'persona-backdrop--menu' : ''} ${torn ? 'persona-torn' : ''}`} data-parallax="back">
      <img src={src} alt="" loading="eager" decoding="async" width={1600} height={1067} />
      <div className={`persona-halftone ${accentCls}`} />
    </div>
  )
}

/** The menu's own second layer: a diagonal wedge on the right edge cut to reveal a different piece
 *  of art underneath the city — the "cut" the brief calls for, distinct from the full backdrop. */
function MenuBackdropCut({ isDark }: { isDark: boolean }) {
  const src = personaArt('home', isDark)
  return (
    <div aria-hidden="true" className="persona-backdrop-cut">
      <img src={src} alt="" loading="eager" decoding="async" width={1600} height={1067} />
    </div>
  )
}

/** Tilted card-in entrance: panels arrive slightly rotated and settle flush, once, on view. */
const CardIn = ({ children, delay = 0, x = 0, y = 26, rotate = -2.5, className = '' }: { children: ReactNode; delay?: number; x?: number; y?: number; rotate?: number; className?: string }) => {
  const reduced = useReducedMotion()
  return (
    <m.div
      initial={reduced ? false : { opacity: 0, x, y, rotate, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...SNAP, delay }}
      className={className}
    >
      {children}
    </m.div>
  )
}

/** "Crash" tap primitive + "Breakout" shard burst on click, for primary CTAs. */
const CrashButton = ({ onClick, className = '', children }: { onClick: () => void; className?: string; children: ReactNode }) => {
  const [burst, setBurst] = useState(0)
  const reduced = useReducedMotion()
  const shards = [0, 1, 2, 3, 4, 5]
  return (
    <span className="relative inline-flex">
      <m.button
        type="button"
        onClick={() => {
          setBurst((n) => n + 1)
          onClick()
        }}
        whileTap={reduced ? undefined : { scale: 1.06 }}
        transition={SNAP}
        className={className}
      >
        {children}
      </m.button>
      {!reduced && (
        <AnimatePresence>
          {burst > 0 &&
            shards.map((i) => (
              <m.span
                key={`${burst}-${i}`}
                className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 bg-current"
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{ opacity: 0, x: Math.cos((i / shards.length) * Math.PI * 2) * 46, y: Math.sin((i / shards.length) * Math.PI * 2) * 46 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            ))}
        </AnimatePresence>
      )}
    </span>
  )
}

const Icon = {
  mail: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  sun: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  ),
  moon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  down: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0-6-6m6 6 6-6" />
    </svg>
  ),
}

/** One themed loading state per screen — never several stacked blank fallbacks. Pulsing dots are
 * purely decorative motion, so they're skipped (static, mid-opacity) under reduced motion. */
function ScreenLoading({ accentCls, muted }: { accentCls: string; muted: string }) {
  const reduced = useReducedMotion()
  return (
    // Capped at 40vh, same reasoning as the other themes' `Pending` fallback (QA v2, 2026-09-09):
    // this screen's chunk starts downloading as soon as its route is hashed to, unresolved, and a
    // taller guess just manufactures more blank space if it stays here a moment.
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4" role="status" aria-label="Loading screen">
      <span className={`font-persona-display text-3xl uppercase ${accentCls}`} style={{ fontStyle: 'oblique 6deg' }}>
        <RansomText text="Loading" intensity={0.6} />
      </span>
      <span className={`flex gap-1.5 ${muted}`} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            className="h-1.5 w-6 bg-current"
            style={{ clipPath: 'polygon(20% 0,100% 0,80% 100%,0 100%)', opacity: reduced ? 0.6 : undefined }}
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Arcade menu — the real entry screen: a vertical list of big skewed items, staggered in, a large
// animated selector, keyboard (Arrow/Enter/Escape), mouse hover and touch tap.
// ---------------------------------------------------------------------------
interface MenuItem {
  id: ScreenId
  label: string
}

function ArcadeMenu({
  items,
  onActivate,
  accentCls,
  accentBg,
  muted,
  isDark,
  suspended,
  playBlip,
}: {
  items: MenuItem[]
  onActivate: (id: ScreenId) => void
  accentCls: string
  accentBg: string
  muted: string
  isDark: boolean
  suspended: boolean
  playBlip: () => void
}) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const [trail, setTrail] = useState<{ key: number; top: number; height: number }[]>([])
  const trailKey = useRef(0)
  const [burst, setBurst] = useState<{ key: number; top: number; height: number } | null>(null)

  // A short afterimage of the selector's previous slot, fading out — the layoutId spring above
  // already glides between rows; this adds a literal one-frame "ghost" the game-menu grammar wants.
  const leaveGhost = (fromIndex: number) => {
    if (reduced) return
    const nav = navRef.current
    const el = itemRefs.current.get(fromIndex)
    if (!nav || !el) return
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const key = trailKey.current++
    setTrail((t) => [...t, { key, top: elRect.top - navRect.top + 6, height: elRect.height - 12 }])
    window.setTimeout(() => setTrail((t) => t.filter((g) => g.key !== key)), 260)
  }

  const move = (next: number) => {
    leaveGhost(index)
    setIndex(next)
    playBlip()
  }

  const confirm = (i: number) => {
    const nav = navRef.current
    const el = itemRefs.current.get(i)
    if (nav && el && !reduced) {
      const navRect = nav.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setBurst({ key: trailKey.current++, top: elRect.top - navRect.top + elRect.height / 2, height: elRect.height })
      window.setTimeout(() => setBurst(null), 300)
    }
    onActivate(items[i].id)
  }

  useEffect(() => {
    if (suspended) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        move((index + 1) % items.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        move((index - 1 + items.length) % items.length)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        confirm(index)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, index, onActivate, playBlip, suspended])

  const activeText = isDark ? 'text-[#f5f2ee]' : 'text-white'

  // A plain labeled nav of real, independently-focusable buttons (Tab reaches every one, in DOM
  // order) — not role="menu"/"menuitem" (that ARIA pattern implies roving-tabindex focus movement
  // on Arrow keys, which this doesn't do: Arrow keys move a visual selection, not DOM focus).
  return (
    <nav aria-label="Choose a screen" className="relative flex flex-col" ref={navRef}>
      {/* Selector afterimage — a fading ghost of the row just left, behind the live selector. */}
      {!reduced && (
        <AnimatePresence>
          {trail.map((g) => (
            <m.span
              key={g.key}
              aria-hidden="true"
              className={`absolute left-0 right-0 ${accentBg} persona-skew-selector pointer-events-none`}
              style={{ top: g.top, height: g.height }}
              initial={{ opacity: 0.4, scaleX: 1 }}
              animate={{ opacity: 0, scaleX: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      )}
      {/* Confirm burst — radial shards at the chosen row, handing off to the route's diagonal wipe. */}
      {!reduced && burst && (
        <div aria-hidden="true" className="pointer-events-none absolute left-4 md:left-7" style={{ top: burst.top }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <m.span
              key={i}
              className={`absolute h-1.5 w-1.5 ${accentBg}`}
              style={{ clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: Math.cos((i / 8) * Math.PI * 2) * 60, y: Math.sin((i / 8) * Math.PI * 2) * 40, scale: 0.4 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
      {items.map((item, i) => {
        const active = i === index
        return (
          <m.button
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(i, el)
              else itemRefs.current.delete(i)
            }}
            type="button"
            aria-current={active || undefined}
            onMouseEnter={() => {
              if (i !== index) move(i)
            }}
            onFocus={() => {
              if (i !== index) move(i)
            }}
            onClick={() => confirm(i)}
            initial={reduced ? false : { opacity: 0, x: -70, skewX: -8 }}
            animate={{ opacity: 1, x: 0, skewX: 0 }}
            transition={{ ...SNAP, delay: 0.07 * i }}
            className="relative text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current"
          >
            {active && <m.span layoutId="arcade-selector" className={`absolute inset-y-1.5 left-0 right-0 ${accentBg} persona-skew-selector`} transition={reduced ? { duration: 0 } : SNAP} aria-hidden="true" />}
            <span
              className={`relative z-10 flex items-baseline gap-3 md:gap-5 px-4 md:px-7 py-3 md:py-4 font-persona-display uppercase leading-[0.9] text-[13vw] sm:text-[9vw] md:text-[6.4vw] transition-colors duration-150 ${active ? activeText : ''}`}
              style={{ fontStyle: 'oblique 6deg' }}
            >
              <span className={`font-persona-label text-[3.2vw] sm:text-xs md:text-sm ${active ? activeText : muted}`}>{String(i + 1).padStart(2, '0')}</span>
              <RansomText text={item.label} intensity={0.55} />
            </span>
          </m.button>
        )
      })}
      <p className={`mt-6 px-4 md:px-7 font-persona-label text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.1em] sm:tracking-[0.25em] ${muted}`}>
        <span className={accentCls}>↑↓</span> select · <span className={accentCls}>↵</span> confirm · tap to jump
      </p>
    </nav>
  )
}

interface SkinLike {
  accentCls: string
  accentBg: string
  muted: string
  line: string
  surface: string
  isDark: boolean
  bg: string
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
type HeadingFn = (eyebrow: string, title: string, accent: string, lead?: string) => ReactNode

function HomeScreen({ chrome, openContact, skin }: { chrome: SkinLike; openContact: () => void; skin: ReturnType<typeof skins.persona> }) {
  const { t } = useI18n()
  const { strings: c, registry } = useContent()
  const { accentCls, accentBg, muted, line, surface, isDark } = chrome
  const liveCount = registry.stores.filter((s) => s.status === 'live').length
  const devCount = registry.stores.filter((s) => s.status === 'dev').length
  const primaryBtn = `persona-skew-btn inline-flex items-center justify-center ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} px-7 py-3.5 text-sm font-persona-label font-semibold uppercase tracking-[0.15em]`

  return (
    <>
      <section className="relative min-h-[68vh] flex items-center px-4 py-16 md:py-20 overflow-clip" aria-labelledby="home-heading">
        <ScreenBackdrop screen="home" isDark={isDark} accentCls={accentCls} torn />
        <div aria-hidden="true" className="persona-ghost-wordmark" data-parallax="back">
          MB
        </div>
        <svg className="persona-ring absolute w-[60vw] max-w-[520px] aspect-square opacity-20 pointer-events-none" style={{ left: '50%', top: '48%', transform: 'translate(-50%,-50%)' }} viewBox="0 0 200 200" aria-hidden="true" data-parallax="back">
          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" className={accentCls} strokeWidth="0.6" strokeDasharray="2 5" />
        </svg>
        <div aria-hidden="true" className={`persona-drift ${accentCls}`} />

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <p className={`font-persona-label text-sm font-semibold uppercase tracking-[0.35em] ${accentCls} before:content-['—'] before:mr-2`}>{c.hero.eyebrow}</p>
          <h1 id="home-heading" className="mt-4 font-persona-display uppercase leading-[0.86] text-[13vw] sm:text-[9vw] md:text-[6.6vw]" style={{ fontStyle: 'oblique 6deg' }}>
            <span className="block">
              <RansomText text={registry.personal.firstName} />
            </span>
            <span className={`block ${accentCls}`}>
              <RansomText text={registry.personal.lastName} />
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl font-sf leading-snug">{c.hero.positioning}</p>
          <p className={`mt-4 max-w-2xl text-base ${muted} font-sf leading-relaxed`}>{c.hero.lead}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
            <Magnetic>
              <CrashButton onClick={openContact} className={primaryBtn}>
                {c.hero.ctaPrimary}
              </CrashButton>
            </Magnetic>
            <a
              href="#work"
              className={`persona-speech-callout ${accentCls} ${surface} items-center gap-1.5 px-4 py-2 text-sm font-persona-label font-semibold uppercase tracking-[0.1em]`}
            >
              {c.hero.ctaSecondary} {Icon.down}
            </a>
            <a href={registry.personal.cv} download className={`${muted} text-sm font-persona-label font-semibold uppercase tracking-[0.1em]`}>
              {c.hero.ctaCv} ›
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs">
            <span className={`inline-flex items-center gap-2 skew-chip px-3.5 py-1.5 font-persona-label uppercase tracking-[0.1em] ${surface} border ${line}`}>
              <span className="w-2 h-2 rounded-full bg-[#34c759]" aria-hidden="true" />
              {c.hero.availability}
            </span>
            <span className={`inline-flex items-center gap-2 skew-chip px-3.5 py-1.5 font-persona-label uppercase tracking-[0.1em] ${surface} border ${line} ${muted}`}>{c.hero.location}</span>
          </div>
        </div>
      </section>

      <section className={`relative px-4 py-14 md:py-20 ${surface} overflow-clip`}>
        <div aria-hidden="true" className={`persona-halftone ${accentCls}`} />
        <div className="max-w-5xl mx-auto relative">
          <p className={`font-persona-label text-xs font-semibold uppercase tracking-[0.35em] ${accentCls} mb-6`}>[ {c.sections.statBand.label} ]</p>
          <StatBand skin={skin} />
        </div>
      </section>

      <section className="px-4 py-14 md:py-20" aria-label={c.sections.now.label}>
        <div className="max-w-5xl mx-auto">
          <CardIn className={`inline-flex flex-wrap items-center gap-x-5 gap-y-2 skew-chip px-5 py-2.5 text-sm ${surface} border ${line}`}>
            <span className="inline-flex items-center gap-2 font-persona-label font-semibold uppercase tracking-[0.1em]">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
              </span>
              {c.sections.now.label}
            </span>
            <span className={muted}>{c.sections.now.live.replace('{n}', String(liveCount))}</span>
            <span className={muted}>{c.sections.now.dev.replace('{n}', String(devCount))}</span>
          </CardIn>
        </div>
        <div className="mt-10">
          <Ticker
            variant="reverse-hover"
            skew
            duration={40}
            label={c.sections.now.band}
            items={registry.stores.filter((s) => !s.legacy)}
            keyOf={(s) => s.slug}
            itemClassName="flex shrink-0 items-center gap-3 whitespace-nowrap px-6 py-3"
            renderItem={(s) => (
              <>
                <span className={`h-2 w-2 ${s.status !== 'live' ? (isDark ? 'bg-[#f5f2ee]/40' : 'bg-[#0a0f1a]/30') : isDark ? 'bg-[#c8102e]' : 'bg-[#1c6fb0]'}`} aria-hidden="true" />
                <span className={`font-persona-label text-xl uppercase tracking-[0.12em] ${isDark ? 'text-[#f5f2ee]' : 'text-[#0a0f1a]'}`}>{s.name}</span>
                {c.stores[s.slug]?.industry && <span className={`font-persona-label text-sm uppercase tracking-[0.15em] ${isDark ? 'text-[#f5f2ee]/55' : 'text-[#0a0f1a]/60'}`}>{c.stores[s.slug].industry}</span>}
              </>
            )}
          />
        </div>
      </section>
      <p className="sr-only">{t('nav.home')}</p>
    </>
  )
}

function WorkScreen({ chrome, heading, skin }: { chrome: SkinLike; heading: HeadingFn; skin: ReturnType<typeof skins.persona> }) {
  const { surface, accentBg, accentCls, muted } = chrome
  const { strings: c } = useContent()
  return (
    <>
      <section id="work-experience" className={`relative px-4 py-14 md:py-20 ${surface} overflow-clip scroll-mt-16`}>
        <ScreenBackdrop screen="work" isDark={chrome.isDark} accentCls={accentCls} torn />
        <div className="max-w-5xl mx-auto relative">
          <Experience skin={skin} heading={heading} />
        </div>
      </section>

      <Suspense fallback={<ScreenLoading accentCls={accentCls} muted={muted} />}>
        <section id="work-shopify" className="px-4 py-14 md:py-20 scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <ShopifyWork skin={skin} heading={heading} />
          </div>
        </section>

        <section id="work-gallery" className={`relative px-4 py-14 md:py-20 ${surface} scroll-mt-16`}>
          <div className="max-w-5xl mx-auto">
            <span className={`persona-sticker inline-block skew-chip ${accentBg} ${chrome.isDark ? 'text-[#f5f2ee]' : 'text-white'} px-3 py-1 text-[11px] font-persona-label font-bold uppercase tracking-[0.1em] mb-4`}>
              — {c.sections.gallery.viewLabel} —
            </span>
            <Gallery skin={skin} heading={heading} />
          </div>
        </section>

        <div aria-hidden="true" className="relative h-6 overflow-hidden flex items-center justify-center gap-1">
          <m.span className={`h-1.5 w-10 ${accentBg}`} style={{ clipPath: 'polygon(0 0,100% 0,80% 100%,0 100%)' }} initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={SNAP} />
          <m.span className={`h-1.5 w-10 ${accentBg}`} style={{ clipPath: 'polygon(20% 0,100% 0,100% 100%,0 100%)' }} initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={SNAP} />
        </div>
        <Manifesto skin={skin} />

        <section id="work-projects" className="px-4 py-14 md:py-20 scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <Projects skin={skin} heading={heading} />
          </div>
        </section>
      </Suspense>
    </>
  )
}

function YearsScreen({ chrome, heading, skin }: { chrome: SkinLike; heading: HeadingFn; skin: ReturnType<typeof skins.persona> }) {
  const { surface, accentCls, muted } = chrome
  return (
    <Suspense fallback={<ScreenLoading accentCls={accentCls} muted={muted} />}>
      <section className="relative overflow-clip px-4 py-14 md:py-20">
        <ScreenBackdrop screen="years" isDark={chrome.isDark} accentCls={accentCls} torn />
        <div className="max-w-5xl mx-auto relative">
          <Years skin={skin} heading={(e, ti, a, l) => heading(`[ ${e} ]`, ti, a, l)} />
        </div>
      </section>
      <section className={`relative px-4 py-14 md:py-20 ${surface} overflow-clip`}>
        <svg className="persona-ring absolute w-[46vw] max-w-[420px] aspect-square opacity-[0.08] pointer-events-none" style={{ right: '-8%', top: '8%' }} viewBox="0 0 200 200" aria-hidden="true" data-parallax="back">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className={accentCls} strokeWidth="0.8" strokeDasharray="1 6" />
        </svg>
        <div className="max-w-5xl mx-auto relative">
          <Process skin={skin} heading={heading} canvas={surface} />
        </div>
      </section>
    </Suspense>
  )
}

function SkillsScreen({ chrome, heading, skin }: { chrome: SkinLike; heading: HeadingFn; skin: ReturnType<typeof skins.persona> }) {
  const { surface, line, accentCls, muted } = chrome
  return (
    <Suspense fallback={<ScreenLoading accentCls={accentCls} muted={muted} />}>
      <section className={`relative overflow-clip px-4 py-14 md:py-20 ${surface}`}>
        <ScreenBackdrop screen="skills" isDark={chrome.isDark} accentCls={accentCls} torn />
        <div className="max-w-5xl mx-auto relative">
          <Skills skin={skin} heading={heading} />
        </div>
      </section>
      <section className="px-4 py-14 md:py-20">
        <div className={`max-w-5xl mx-auto persona-notch border ${line} ${surface} p-6 md:p-10`}>
          <Faq skin={skin} heading={heading} />
        </div>
      </section>
    </Suspense>
  )
}

function ContactScreen({ chrome, heading, skin, primaryBtn, openContact, t }: { chrome: SkinLike; heading: HeadingFn; skin: ReturnType<typeof skins.persona>; primaryBtn: string; openContact: () => void; self: ReturnType<typeof designById>; t: ReturnType<typeof useI18n>['t'] }) {
  const { strings: c } = useContent()
  const { surface, line, bg, accentCls, muted } = chrome

  return (
    <Suspense fallback={<ScreenLoading accentCls={accentCls} muted={muted} />}>
      <section className={`relative overflow-clip px-4 py-16 md:py-20 ${surface}`}>
        <ScreenBackdrop screen="contact" isDark={chrome.isDark} accentCls={accentCls} torn />
        <div className={`relative max-w-5xl mx-auto persona-notch border ${line} ${bg} p-6 md:p-12`}>
          <Contact skin={skin} ctaClass={primaryBtn} onContact={openContact} />
        </div>
      </section>

      <section className="px-4 py-14 md:py-20" aria-labelledby="explore-heading">
        <div className="max-w-5xl mx-auto">
          {heading(c.sections.explore.eyebrow, c.sections.explore.title, '', c.sections.explore.lead)}
          <div className="grid sm:grid-cols-3 gap-4">
            {otherDesigns('persona').map((d) => (
              <TransitionLink key={d.id} to={d.href} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className={`persona-hover-invert block clip-corner-sm overflow-hidden border ${line} ${surface}`}>
                <div className="h-28 overflow-hidden">
                  <d.Preview size="md" />
                </div>
                <div className="p-4">
                  <p className="font-persona-label text-sm font-semibold uppercase tracking-[0.1em]">{t(d.nameKey)}</p>
                  <p className={`${muted} text-xs`}>{t(d.subtitleKey)}</p>
                </div>
              </TransitionLink>
            ))}
            <TransitionLink to={MENU.route} transitionColor={chrome.isDark ? '#171717' : '#fafafa'} transitionAccent={chrome.isDark ? '#ffffff' : '#171717'} transitionLabel={t(MENU.labelKey)} className={`persona-hover-invert block clip-corner-sm overflow-hidden border ${line} ${surface}`}>
              <div className="h-28 overflow-hidden">
                <MenuPreview isDark={chrome.isDark} />
              </div>
              <div className="p-4">
                <p className="font-persona-label text-sm font-semibold uppercase tracking-[0.1em]">{t(MENU.labelKey)}</p>
                <p className={`${muted} text-xs`}>{t(MENU.subtitleKey)}</p>
              </div>
            </TransitionLink>
          </div>
        </div>
      </section>

    </Suspense>
  )
}

// ---------------------------------------------------------------------------
/** Site footer, on every screen (the contact screen used to be the only one carrying it). */
function PersonaFooter({ chrome, self, t }: { chrome: SkinLike; self: ReturnType<typeof designById>; t: ReturnType<typeof useI18n>['t'] }) {
  const { muted, line, accentCls } = chrome
  const { strings: c, registry } = useContent()
  return (
    <footer className={`px-4 pb-24 pt-6 text-xs ${muted}`} role="contentinfo" aria-label="Site footer">
      <div className={`max-w-5xl mx-auto flex flex-col gap-3 border-t pt-8 md:flex-row md:items-baseline md:justify-between font-persona-label uppercase tracking-[0.1em] ${line}`}>
        <p>
          © 2026 {registry.personal.name}. {c.footer.rights}
        </p>
        <p className="md:text-center">
          <span className={accentCls}>{t(self.nameKey)}</span> — {t(self.subtitleKey)}
        </p>
        <button type="button" onClick={() => { window.location.hash = '#menu' }} className={`${accentCls} inline-flex items-center gap-1 font-semibold`}>
          {c.footer.backToTop} ↑
        </button>
      </div>
    </footer>
  )
}

// Persistent chrome — top identity bar + bottom game bar (menu, screens, status, utilities). Fixed
// but never pinned mid-content: it never intercepts or transforms the scrolling column beneath it.
// ---------------------------------------------------------------------------
/** Reach every other experience from the Arcade chrome (the owner could not leave the theme before). */
function ThemeSwitch({ chrome, t }: { chrome: SkinLike; t: ReturnType<typeof useI18n>['t'] }) {
  const [open, setOpen] = useState(false)
  const { line, muted, isDark, accentBg, accentCls } = chrome
  const item = `persona-hover-flash block px-3 py-2 font-persona-label text-xs font-semibold uppercase tracking-[0.12em] overflow-hidden ${isDark ? 'hover:bg-[#f5f2ee]/10' : 'hover:bg-[#0a0f1a]/5'}`
  return (
    <div className="relative">
      <button
        type="button"
        data-theme-switcher
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`font-persona-label text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] px-2.5 py-1.5 skew-chip transition-colors ${open ? `${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'}` : muted}`}
      >
        {t(MENU.labelKey)}
      </button>
      {open && (
        <div role="menu" className={`absolute right-0 top-full mt-2 w-60 border ${line} ${isDark ? 'bg-[#111013]' : 'bg-[#eef3f7]'} p-1.5 shadow-2xl`}>
          {otherDesigns('persona').map((d) => (
            <TransitionLink key={d.id} to={d.href} transitionColor={d.transitionColor} transitionAccent={d.transitionAccent} transitionLabel={t(d.nameKey)} className={item}>
              {t(d.nameKey)}
              <span className={`block text-[10px] normal-case tracking-normal ${muted}`}>{t(d.subtitleKey)}</span>
            </TransitionLink>
          ))}
          <TransitionLink to={MENU.route} transitionColor={isDark ? '#171717' : '#fafafa'} transitionAccent={isDark ? '#ffffff' : '#171717'} transitionLabel={t(MENU.labelKey)} className={`${item} ${accentCls}`}>
            {t(MENU.subtitleKey)}
          </TransitionLink>
        </div>
      )}
    </div>
  )
}

function TopBar({ chrome, self, t, isDark, toggleTheme, openContact, navigate }: { chrome: SkinLike; self: ReturnType<typeof designById>; t: ReturnType<typeof useI18n>['t']; isDark: boolean; toggleTheme: () => void; openContact: () => void; navigate: (r: Route) => void }) {
  const { line } = chrome
  return (
    <div className={`fixed top-0 inset-x-0 z-40 h-12 md:h-14 ${isDark ? 'bg-[#111013]/90' : 'bg-[#eef3f7]/90'} backdrop-blur-xl border-b ${line}`}>
      <div className="max-w-6xl mx-auto h-full px-3 md:px-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('')} className="inline-flex items-center gap-2">
          <span className={`persona-skew-btn w-7 h-7 md:w-8 md:h-8 flex items-center justify-center ${chrome.accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} font-persona-label text-[11px] font-bold`}>MB</span>
          <span className="hidden sm:inline font-persona-label text-sm font-semibold uppercase tracking-[0.2em]">{t(self.nameKey)}</span>
        </button>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button type="button" onClick={openContact} aria-label={t('nav.contact')} className={`w-8 h-8 flex items-center justify-center ${chrome.muted}`}>
            {Icon.mail}
          </button>
          <ThemeSwitch chrome={chrome} t={t} />
          <LanguageSelectorMenu size="sm" />
          <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className={`w-8 h-8 flex items-center justify-center ${chrome.muted}`}>
            {isDark ? Icon.sun : Icon.moon}
          </button>
        </div>
      </div>
    </div>
  )
}

function BottomBar({ chrome, route, navigate, items, sfx, liveCount }: { chrome: SkinLike; route: Route; navigate: (r: Route) => void; items: MenuItem[]; sfx: ReturnType<typeof useSfx>; liveCount: number }) {
  const { line, accentBg, accentCls, muted, isDark } = chrome
  const chipBase = 'shrink-0 font-persona-label text-[10px] md:text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1.5 skew-chip transition-colors duration-150'
  const on = `${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'}`
  const off = `${muted} hover:text-current`
  return (
    <nav className={`fixed bottom-0 inset-x-0 z-40 border-t ${line} ${isDark ? 'bg-[#111013]/92' : 'bg-[#eef3f7]/92'} backdrop-blur-xl`} aria-label="Screen navigation">
      <div className="max-w-6xl mx-auto flex items-center gap-1.5 px-2.5 py-2 overflow-x-auto">
        <button type="button" onClick={() => navigate('')} aria-current={route === '' ? 'page' : undefined} className={`${chipBase} ${route === '' ? on : off}`}>
          Menu
        </button>
        {items.map((it) => (
          <button key={it.id} type="button" onClick={() => navigate(it.id)} aria-current={route === it.id ? 'page' : undefined} className={`${chipBase} ${route === it.id ? on : off}`}>
            {it.label}
          </button>
        ))}
        <span className="flex-1 min-w-2" />
        <span className={`hidden sm:inline-flex shrink-0 items-center gap-1.5 font-persona-label text-[10px] uppercase tracking-[0.15em] ${muted}`}>
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          </span>
          {liveCount} live
        </span>
        <button type="button" onClick={sfx.toggle} aria-pressed={sfx.enabled} className={`shrink-0 font-persona-label text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5 border ${line} ${sfx.enabled ? accentCls : muted}`}>
          SFX {sfx.enabled ? 'On' : 'Off'}
        </button>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
function PersonaContent() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()
  const { strings: c, registry } = useContent()
  const [contactOpen, setContactOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  useDynamicFavicon('persona')
  useScrollVar(rootRef)
  const sfx = useSfx()
  const reduced = useReducedMotion()

  const [route, navigate] = useHashRoute()
  const [displayRoute, setDisplayRoute] = useState<Route>(route)
  const [wiping, setWiping] = useState(false)
  const displayRouteRef = useRef<Route>(route)
  useEffect(() => {
    displayRouteRef.current = displayRoute
  }, [displayRoute])

  // Diagonal wipe + flash, ~500ms, fired only by a route change (never by scroll). Depends on `route`
  // alone (not `displayRoute`) so its own timers are never cancelled by the swap they themselves cause.
  useEffect(() => {
    if (route === displayRouteRef.current) return
    if (reduced) {
      setDisplayRoute(route)
      return
    }
    setWiping(true)
    const t1 = window.setTimeout(() => setDisplayRoute(route), 260)
    const t2 = window.setTimeout(() => setWiping(false), 560)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, reduced])

  // Escape returns to the arcade menu from any screen (never fights an open modal).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && route !== '' && !contactOpen) {
        e.preventDefault()
        navigate('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [route, navigate, contactOpen])

  const skin = skins.persona(isDark)
  const self = designById('persona')

  const bg = isDark ? 'bg-[#111013] text-[#f5f2ee]' : 'bg-[#eef3f7] text-[#0a0f1a]'
  const surface = isDark ? 'bg-[#18161a]' : 'bg-white'
  const muted = skin.muted
  const accentCls = skin.accent
  const accentBg = skin.accentBg
  const line = skin.line
  const chrome: SkinLike = { accentCls, accentBg, muted, line, surface, isDark, bg }

  const openContact = (prefill?: string) => {
    setContactPrefill(prefill ?? '')
    setContactOpen(true)
  }

  const items: MenuItem[] = [
    { id: 'home', label: t('nav.home') },
    { id: 'work', label: t('nav.work') },
    { id: 'years', label: t('nav.years') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'contact', label: t('nav.contact') },
  ]

  // Screen-heading "cut-in": a skewed ink slab slides in behind the title from the left and the title
  // itself pops with a one-frame overshoot spring; the eyebrow slashes into view first, and action
  // lines radiate behind the title (comic devices, used once per heading — never on scroll).
  const Heading: HeadingFn = (eyebrow, title, accent, lead) => (
    <CardIn className="mb-10 md:mb-14">
      <p className={`persona-slash-reveal font-persona-label text-xs font-semibold uppercase tracking-[0.35em] ${accentCls} mb-3 before:content-['—'] before:mr-2`}>{eyebrow}</p>
      <h2 className="relative font-persona-display text-4xl md:text-6xl uppercase leading-[0.95]" style={{ fontStyle: 'oblique 6deg' }}>
        <m.span
          aria-hidden="true"
          className={`persona-cutin-slab ${accentBg} opacity-[0.1]`}
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.3, ease: EASE }}
        />
        <span className={`persona-action-lines ${accentCls}`}>
          <m.span
            className="relative inline-block"
            initial={reduced ? false : { opacity: 0, scale: 0.94, y: 10 }}
            whileInView={{ opacity: 1, scale: [0.94, 1.05, 1], y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, times: [0, 0.7, 1], ease: EASE, delay: 0.08 }}
          >
            {title} {accent && <RansomText text={accent} className={muted} intensity={0.6} />}
          </m.span>
        </span>
      </h2>
      {lead && <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed font-sf`}>{lead}</p>}
    </CardIn>
  )

  const primaryBtn = `persona-skew-btn inline-flex items-center justify-center ${accentBg} ${isDark ? 'text-[#f5f2ee]' : 'text-white'} px-7 py-3.5 text-sm font-persona-label font-semibold uppercase tracking-[0.15em]`
  const liveCount = registry.stores.filter((s) => s.status === 'live').length

  return (
    <>
      <SEOHead title={`${c.meta.title} — ${t(self.nameKey)}`} description={c.meta.description} canonical="https://www.maxfolio.dev/arcade" />
      <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} variant="persona" isDark={isDark} initialMessage={contactPrefill} />

      <div ref={rootRef} data-mode={isDark ? 'dark' : 'light'} className={`theme-persona min-h-screen font-sf ${bg} transition-colors duration-300 [overflow-x:clip]`} role="document">
        <TopBar chrome={chrome} self={self} t={t} isDark={isDark} toggleTheme={toggleTheme} openContact={() => openContact()} navigate={navigate} />

        {/* Diagonal wipe + flash — ~500ms, fires only on a route change, never on scroll. */}
        <AnimatePresence>
          {wiping && (
            <m.div key="wipe" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
              <m.div
                className={`absolute inset-0 ${accentBg}`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)' }}
                initial={{ x: '-120%' }}
                animate={{ x: ['-120%', '0%', '120%'] }}
                transition={{ duration: 0.56, times: [0, 0.46, 1], ease: EASE }}
              />
              <m.div className="absolute inset-0 bg-white" style={{ mixBlendMode: 'overlay' }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0] }} transition={{ duration: 0.56, times: [0, 0.46, 1] }} />
            </m.div>
          )}
        </AnimatePresence>

        <main id="main-content" className="pt-12 md:pt-14">
          {displayRoute === '' && (
            <section className="relative min-h-[calc(100svh-3rem)] md:min-h-[calc(100svh-3.5rem)] flex flex-col justify-center px-2 sm:px-4 py-10 overflow-clip" aria-label="Arcade menu">
              <ScreenBackdrop screen="menu" isDark={isDark} accentCls={accentCls} menu />
              <MenuBackdropCut isDark={isDark} />
              <div aria-hidden="true" className={`persona-drift ${accentCls}`} />
              <div aria-hidden="true" className={`persona-halftone ${accentCls}`} />
              <svg className="persona-ring absolute w-[80vw] max-w-[640px] aspect-square opacity-[0.12] pointer-events-none" style={{ right: '-10%', top: '50%', transform: 'translateY(-50%)' }} viewBox="0 0 200 200" aria-hidden="true" data-parallax="back">
                <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" className={accentCls} strokeWidth="0.6" strokeDasharray="2 5" />
              </svg>
              <div className="relative z-10 max-w-4xl mx-auto w-full">
                <p className={`font-persona-label text-xs font-semibold uppercase tracking-[0.35em] ${accentCls} mb-4 px-4 md:px-7 before:content-['—'] before:mr-2`}>{t(self.nameKey)}</p>
                <ArcadeMenu items={items} onActivate={navigate} accentCls={accentCls} accentBg={accentBg} muted={muted} isDark={isDark} suspended={contactOpen} playBlip={() => sfx.play(760)} />
              </div>
            </section>
          )}

          {displayRoute === 'home' && <HomeScreen chrome={chrome} openContact={() => openContact()} skin={skin} />}
          {displayRoute === 'work' && <WorkScreen chrome={chrome} heading={Heading} skin={skin} />}
          {displayRoute === 'years' && <YearsScreen chrome={chrome} heading={Heading} skin={skin} />}
          {displayRoute === 'skills' && <SkillsScreen chrome={chrome} heading={Heading} skin={skin} />}
          {displayRoute === 'contact' && <ContactScreen chrome={chrome} heading={Heading} skin={skin} primaryBtn={primaryBtn} openContact={openContact} self={self} t={t} />}
        </main>

        <PersonaFooter chrome={chrome} self={self} t={t} />

        <BottomBar chrome={chrome} route={displayRoute} navigate={navigate} items={items} sfx={sfx} liveCount={liveCount} />
      </div>
    </>
  )
}

export default function Persona() {
  return (
    <ThemeProvider storageKey="persona-theme" defaultTheme="light">
      <SmoothScroll offset={56}>
        <PersonaContent />
      </SmoothScroll>
    </ThemeProvider>
  )
}
