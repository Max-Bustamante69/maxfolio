import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { m, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'

export type TickerVariant =
  | 'speed-hover' // accelerates ×2.5 on hover, eases back
  | 'reverse-hover' // reverses direction on hover, eases through zero
  | 'skew-velocity' // constant scroll, skewed by page scroll velocity (±12deg, clamped)
  | 'outline-fill' // outlined (text-stroke) words that fill solid per-word on hover
  | 'stacked' // two counter-rotating rows, pause on hover
  | 'vertical' // single column, scrolls on the Y axis (phones)
  | 'drag-scrub' // pointer drag scrubs the strip, momentum eases back into autoplay
  | 'stock-ticker' // label/value pairs, monospaced, pause on hover

interface TickerBaseProps<T> {
  items: readonly T[]
  renderItem: (item: T, index: number) => ReactNode
  keyOf?: (item: T, index: number) => string
  variant: TickerVariant
  /** Accessible name for the region; the live list stays in the accessibility tree once (duplicates are aria-hidden). */
  label: string
  /** Seconds for one full pass of a single copy at rest speed. */
  duration?: number
  className?: string
  itemClassName?: string
  /** Also skews the strip by page-scroll velocity, on top of whatever `variant` does (used for the "Now" ticker: speed-hover + skew-velocity). */
  skew?: boolean
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const EASE_RATE = 3.2 // how fast the loop's velocity eases toward its target, in 1/s

/** Wraps a position into (-size, 0] so a two-copy track loops seamlessly. */
function wrap(pos: number, size: number) {
  if (size <= 0) return 0
  let p = pos
  while (p <= -size) p += size
  while (p > 0) p -= size
  return p
}

/**
 * One continuous strip: the content is duplicated (2 copies, 3 for drag-scrub) so the loop is
 * seamless, edges are mask-faded, and a single JS engine drives position — easing its velocity
 * toward a per-variant target every frame, which is what makes speed-hover "ease back", reverse-hover
 * "ease through zero" and drag-scrub's release "ease into autoplay" all the same mechanism.
 */
function LoopRow<T>({
  items,
  renderItem,
  keyOf,
  axis,
  direction,
  duration,
  hoverBehavior,
  draggable,
  itemClassName,
  rowClassName,
  copies = 2,
}: {
  items: readonly T[]
  renderItem: (item: T, index: number) => ReactNode
  keyOf: (item: T, index: number) => string
  axis: 'x' | 'y'
  direction: 1 | -1
  duration: number
  hoverBehavior: 'speed' | 'reverse' | 'pause' | 'none'
  draggable?: boolean
  itemClassName?: string
  rowClassName?: string
  copies?: 2 | 3
}) {
  const reduced = useReducedMotion()
  const pos = useMotionValue(0)
  const sizeRef = useRef(0)
  const [size, setSize] = useState(0)
  const measureRef = useRef<HTMLUListElement>(null)
  const hoveredRef = useRef(false)
  const draggingRef = useRef(false)
  const velocityRef = useRef(0)
  const lastClientRef = useRef(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => {
      const s = axis === 'x' ? el.offsetWidth : el.offsetHeight
      sizeRef.current = s
      setSize(s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [axis, items.length])

  // Base autoplay speed: one lap of a single copy in `duration` seconds.
  const baseVelocity = useMemo(() => (size > 0 ? (direction * -size) / duration : 0), [size, duration, direction])

  useEffect(() => {
    // Fresh loop always starts from the base speed so a slower/faster hover state doesn't linger across remounts.
    velocityRef.current = baseVelocity
  }, [baseVelocity])

  useAnimationFrame((_, delta) => {
    if (reduced || sizeRef.current <= 0) return
    const dt = Math.min(delta, 48) / 1000
    if (draggingRef.current) return // position is driven directly by the pointer handler while dragging
    let target = baseVelocity
    if (hoverBehavior === 'speed' && hoveredRef.current) target = baseVelocity * 2.5
    else if (hoverBehavior === 'reverse' && hoveredRef.current) target = -baseVelocity
    else if (hoverBehavior === 'pause' && hoveredRef.current) target = 0
    velocityRef.current += (target - velocityRef.current) * Math.min(1, dt * EASE_RATE)
    const next = pos.get() + velocityRef.current * dt
    pos.set(wrap(next, sizeRef.current))
  })

  const onPointerDown = draggable
    ? (e: ReactPointerEvent) => {
        draggingRef.current = true
        lastClientRef.current = axis === 'x' ? e.clientX : e.clientY
        lastTimeRef.current = performance.now()
        ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
      }
    : undefined
  const onPointerMove = draggable
    ? (e: ReactPointerEvent) => {
        if (!draggingRef.current) return
        const client = axis === 'x' ? e.clientX : e.clientY
        const now = performance.now()
        const dtMs = Math.max(1, now - lastTimeRef.current)
        const delta = client - lastClientRef.current
        velocityRef.current = (delta / dtMs) * 1000 // px/sec, becomes the fling velocity on release
        pos.set(wrap(pos.get() + delta, sizeRef.current))
        lastClientRef.current = client
        lastTimeRef.current = now
      }
    : undefined
  const endDrag = draggable
    ? () => {
        draggingRef.current = false
        // velocityRef already holds the fling speed; the rAF loop eases it toward baseVelocity next frame — momentum, then autoplay.
      }
    : undefined

  // width/height: max-content so the row sizes to its duplicated copies instead of stretching to the
  // mask's 100% (which would let flexbox compress the copies and break the wrap measurement).
  const styleAxis: CSSProperties =
    axis === 'x' ? { display: 'flex', flexDirection: 'row', width: 'max-content' } : { display: 'flex', flexDirection: 'column', height: 'max-content' }

  return (
    <div className={`ticker-mask ${axis === 'y' ? 'ticker-mask-vertical' : ''}`}>
      <m.div
        className={`ticker-row ${rowClassName ?? ''}`}
        style={{ ...styleAxis, x: axis === 'x' ? pos : 0, y: axis === 'y' ? pos : 0, touchAction: draggable ? (axis === 'x' ? 'pan-y' : 'pan-x') : undefined, cursor: draggable ? 'grab' : undefined }}
        onMouseEnter={() => {
          hoveredRef.current = true
        }}
        onMouseLeave={() => {
          hoveredRef.current = false
        }}
        onFocus={() => {
          hoveredRef.current = true
        }}
        onBlur={() => {
          hoveredRef.current = false
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {Array.from({ length: copies }).map((_, c) => (
          <ul key={c} ref={c === 0 ? measureRef : undefined} className="ticker-track" style={styleAxis} aria-hidden={c > 0 ? 'true' : undefined}>
            {items.map((item, i) => (
              <li key={keyOf(item, i)} className={itemClassName}>
                {renderItem(item, i)}
              </li>
            ))}
          </ul>
        ))}
      </m.div>
    </div>
  )
}

/** Splits rendered text into per-word outline spans that fill solid on hover (pointer devices only). */
function OutlineWords({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="ticker-outline-word">
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

/**
 * A reusable ticker strip with seven motion behaviors sharing one loop engine (see `LoopRow`).
 * Every variant is transform-only, masks its edges, pauses/eases via a single velocity target,
 * carries one real (accessible) copy plus aria-hidden duplicates, and — under reduced motion —
 * drops the strip entirely for a plain wrapped list.
 */
export function Ticker<T>({ items, renderItem, keyOf, variant, label, duration = 42, className = '', itemClassName = '', skew = false }: TickerBaseProps<T>) {
  const reduced = useReducedMotion()
  const getKey = keyOf ?? ((_: T, i: number) => String(i))

  // Scroll-velocity-driven skew, shared by the 'skew-velocity' variant and the `skew` add-on prop.
  const { scrollY } = useScroll()
  const rawVelocity = useVelocity(scrollY)
  const clampedVelocity = useTransform(rawVelocity, (v) => clamp(v, -3000, 3000))
  const skewTarget = useTransform(clampedVelocity, [-3000, 3000], [-12, 12])
  const skewSmoothed = useSpring(skewTarget, { stiffness: 220, damping: 26, mass: 0.5 })

  if (reduced) {
    return (
      <div role="region" aria-label={label}>
        {/* compact: a wrapped strip of the first twelve items, not a tall column (measured ~800 px on phones) */}
        <ul className={`ticker-static-wrap flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${className}`}>
          {items.slice(0, 8).map((item, i) => (
            <li key={getKey(item, i)} className={`${itemClassName} !px-2 !py-1`}>
              {renderItem(item, i)}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const wantSkew = skew || variant === 'skew-velocity'

  const body = (() => {
    switch (variant) {
      case 'stacked': {
        const half = Math.ceil(items.length / 2)
        const rows = [items.slice(0, half), items.slice(half)]
        return (
          <div className={`ticker-stacked ${className}`} role="region" aria-label={label}>
            {rows.map((row, r) => (
              <div key={r} className={r === 1 ? '-rotate-[1.6deg]' : 'rotate-[1.6deg]'}>
                <LoopRow
                  items={row}
                  renderItem={renderItem}
                  keyOf={getKey}
                  axis="x"
                  direction={r === 1 ? -1 : 1}
                  duration={duration * (r === 1 ? 1.18 : 1)}
                  hoverBehavior="pause"
                  itemClassName={itemClassName}
                />
              </div>
            ))}
          </div>
        )
      }
      case 'vertical':
        return (
          <div className={className} role="region" aria-label={label}>
            <LoopRow items={items} renderItem={renderItem} keyOf={getKey} axis="y" direction={1} duration={duration} hoverBehavior="pause" itemClassName={itemClassName} />
          </div>
        )
      case 'drag-scrub':
        return (
          <div className={className} role="region" aria-label={label}>
            <LoopRow items={items} renderItem={renderItem} keyOf={getKey} axis="x" direction={1} duration={duration} hoverBehavior="none" draggable itemClassName={itemClassName} copies={3} />
          </div>
        )
      case 'outline-fill':
        return (
          <div className={className} role="region" aria-label={label}>
            <LoopRow
              items={items}
              renderItem={(item, i) => {
                const rendered = renderItem(item, i)
                return typeof rendered === 'string' ? <OutlineWords text={rendered} /> : rendered
              }}
              keyOf={getKey}
              axis="x"
              direction={1}
              duration={duration}
              hoverBehavior="pause"
              itemClassName={itemClassName}
            />
          </div>
        )
      case 'stock-ticker':
        return (
          <div className={`font-mono ${className}`} role="region" aria-label={label}>
            <LoopRow items={items} renderItem={renderItem} keyOf={getKey} axis="x" direction={1} duration={duration} hoverBehavior="pause" itemClassName={itemClassName} />
          </div>
        )
      case 'reverse-hover':
        return (
          <div className={className} role="region" aria-label={label}>
            <LoopRow items={items} renderItem={renderItem} keyOf={getKey} axis="x" direction={1} duration={duration} hoverBehavior="reverse" itemClassName={itemClassName} />
          </div>
        )
      case 'speed-hover':
      case 'skew-velocity':
      default:
        return (
          <div className={className} role="region" aria-label={label}>
            <LoopRow items={items} renderItem={renderItem} keyOf={getKey} axis="x" direction={1} duration={duration} hoverBehavior={variant === 'speed-hover' ? 'speed' : 'none'} itemClassName={itemClassName} />
          </div>
        )
    }
  })()

  if (!wantSkew) return body
  return <m.div style={{ skewX: skewSmoothed }}>{body}</m.div>
}
