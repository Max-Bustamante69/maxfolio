// Variant A — "split story": a tight two-column layout. The device frame pins on wide screens and
// crossfades between the two real captures this store has (home, pdp) as the beat in view changes;
// each beat carries a numeral in the display face, a two-line fact and a real metric chip that
// reveals in on scroll. Denser than the original scrollytelling section it replaces — 40–48vh per
// beat, not 45–55vh, and no beat waits on an IntersectionObserver: which one is "active" is read from
// `getBoundingClientRect` on scroll/resize, so a fast scroll never misses a beat.
import { useEffect, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { fill, type FeaturedData } from './types'

const EASE = [0.23, 1, 0.32, 1] as const
/** Which real capture each beat crossfades to — problem/result read the storefront, plan/build read
 *  the PDP where the box builder and its Function-priced ladder actually live. */
const SCENE_FOR_BEAT = ['home', 'pdp', 'pdp', 'home'] as const

export function SplitStoryVariant({ data }: { data: FeaturedData }) {
  const { skin, fb, g, store, vars, img, sheetHref } = data
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const beatRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const ref = window.innerHeight * 0.5
      let best = 0
      let bestD = Infinity
      beatRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - ref)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      setActive(best)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const scene = SCENE_FOR_BEAT[active] ?? 'home'

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5">
      {/* Media: pinned on wide screens, plain on phones. Both scenes stay mounted — only opacity (and a
          faint scale) crossfades, so there is never a blank frame while JS decides which is active. */}
      <div className="md:sticky md:top-24 md:self-start">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-[22px] border md:aspect-[16/11] ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-[#f5f5f7]'}`}>
          {(['home', 'pdp'] as const).map((s) => (
            <div
              key={s}
              className="absolute inset-0 transition-[opacity,transform] duration-500 ease-out"
              style={{ opacity: scene === s ? 1 : 0, transform: scene === s ? 'scale(1)' : 'scale(1.02)' }}
              aria-hidden={scene !== s}
            >
              <img src={img(s, 'desktop')} alt={`${store.name} — ${s === 'home' ? g.home : g.pdp}`} width={1280} height={880} loading="lazy" decoding="async" className="hidden h-full w-full object-cover object-top md:block" />
              <img src={img(s, 'mobile')} alt={`${store.name} — ${s === 'home' ? g.home : g.pdp}`} width={750} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover object-top md:hidden" />
            </div>
          ))}
          {/* Numeral badge tracks the active beat — a display-face count that gives the frame its own dynamism. */}
          <div className={`absolute left-4 top-4 rounded-full px-3 py-1 font-sf text-sm font-semibold tabular-nums tracking-[-0.02em] backdrop-blur ${skin.dark ? 'bg-black/40 text-white' : 'bg-white/70 text-[#1d1d1f]'}`}>
            {String(active + 1).padStart(2, '0')} / {String(fb.beats.length).padStart(2, '0')}
          </div>
        </div>
        <a href={store.url} target="_blank" rel="noreferrer" className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${skin.accent}`}>
          {fb.visit} ›
        </a>
      </div>

      {/* Beats: plain flow, always visible — nothing here waits on a whileInView to paint. Only the
          numeral, metric chip and active-state color transitions animate. */}
      <div>
        {fb.beats.map((beat, i) => (
          <div
            key={beat.label}
            ref={(el) => {
              beatRefs.current[i] = el
            }}
            className={`flex min-h-[40vh] flex-col justify-center gap-3 border-t py-6 first:border-t-0 md:min-h-[48vh] md:py-8 ${skin.line}`}
          >
            <div className="flex items-baseline gap-3">
              <span className={`font-sf text-3xl font-semibold leading-none tracking-[-0.03em] tabular-nums transition-colors md:text-4xl ${active === i ? skin.accent : skin.muted}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${active === i ? skin.title : skin.muted}`}>{beat.label}</p>
            </div>
            <p className={`max-w-md text-lg leading-snug transition-colors md:text-xl ${active === i ? '' : skin.muted}`}>{fill(beat.body, vars)}</p>
            <m.span
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tabular-nums ${skin.chip}`}
            >
              {fill(beat.metric, vars)}
            </m.span>
          </div>
        ))}
        <a href={sheetHref} className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${skin.accent}`}>
          {fb.cta} ›
        </a>
      </div>
    </div>
  )
}
