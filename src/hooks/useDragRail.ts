import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import type { AnimationPlaybackControls } from 'framer-motion'

export interface UseDragRailOptions {
  /** Viewport width (px) below which the rest/landing alignment centers the active slide (mobile,
   *  `snap-center`) instead of aligning it to the frame line (desktop, `snap-start`). Pass the same
   *  number the caller's own Tailwind breakpoint uses. Default 768 (Tailwind `md`). */
  centerSnapBelow?: number
}

export interface DragRailHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void
  onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => void
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
}

export interface UseDragRailResult {
  /** MUST be spread onto the scrolling element itself (the node `ref` points at). A hook whose
   *  `handlers` are discarded looks dead — it is not: this is the only wiring that turns on mouse
   *  drag. Touch is unaffected either way (native momentum scroll + CSS scroll-snap keep working). */
  handlers: DragRailHandlers
  /** True from the first >3px pointer move until the release spring lands. Callers can key off it to
   *  toggle a `data-dragging` attribute (e.g. for the grab/grabbing cursor swap) — the hook does not
   *  touch the element's class list itself, only inline `scrollSnapType`/`userSelect` while dragging. */
  isDragging: boolean
}

const FOLLOW = 0.2
const FLICK_PX_PER_S = 350
const PROJECT_S = 0.12
const MOVE_THRESHOLD = 3

function nearestIndex(targets: number[], x: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < targets.length; i++) {
    const d = Math.abs(targets[i] - x)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

/**
 * House carousel drag-with-inertia, replicated over a native `overflow-x-auto` + CSS scroll-snap rail
 * (this repo cannot import the agency's shared Carousel component, so this reproduces its feel, not
 * its code).
 *
 * Mouse only: touch keeps the browser's own momentum scroll and scroll-snap untouched. On the first
 * real mouse movement past `MOVE_THRESHOLD` the hook takes over — it captures the pointer, disables
 * `scroll-snap-type` (mandatory CSS snap fights an imperative `scrollLeft` write every frame) and
 * `user-select`, then eases `scrollLeft` toward the pointer's position once per animation frame
 * (follow factor 0.2) while tracking velocity in px/ms. On release it projects 0.12s of that velocity
 * from the current scroll position, lands on the nearest slide, and guarantees a flick over 350px/s
 * advances at least one slide even if the projection would otherwise land back on the start slide.
 * The landing is animated with one velocity-seeded overdamped spring
 * (stiffness 60, damping 17, mass 1, restDelta 0.4, restSpeed 10) and `scroll-snap-type` is restored
 * the moment it lands (complete or interrupted). Reduced motion skips the spring and jumps straight to
 * the landing slide.
 *
 * Slide targets are read from the DOM (`rail.children[i].offsetLeft - rail.offsetLeft`, matching the
 * scrollLeft coordinate space) on every drag — never computed from a card width + gap constant — so
 * they stay correct across breakpoints, content edits and font-size changes. Below `centerSnapBelow`
 * the target additionally centers the slide inside the rail's visible width (mobile rest alignment);
 * at or above it, the target is the slide's own offset (desktop, aligned to the frame line).
 *
 * The click that would otherwise fire on pointerup after a real drag is swallowed once via
 * `onClickCapture` (`preventDefault` + `stopPropagation`), and `onDragStart` on the rail plus
 * `draggable={false}` on every `<img>` inside it (set by the caller) kill the native ghost-drag image.
 */
export function useDragRail(ref: React.RefObject<HTMLDivElement | null>, options: UseDragRailOptions = {}): UseDragRailResult {
  const centerSnapBelow = options.centerSnapBelow ?? 768
  const reduced = useReducedMotion()
  const [isDragging, setIsDragging] = useState(false)

  const state = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    targetLeft: 0,
    lastT: 0,
    velocity: 0, // px of scrollLeft target per ms
    targets: [] as number[], // slide targets snapshotted at gesture start — see slideTargets' note
  })
  const rafId = useRef<number | null>(null)
  const controls = useRef<AnimationPlaybackControls | null>(null)

  const stopFollowLoop = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [])

  const slideTargets = useCallback(
    (rail: HTMLDivElement): number[] => {
      const centered = window.innerWidth < centerSnapBelow
      // getBoundingClientRect (viewport-relative), not offsetLeft/offsetParent: a scrolling element
      // that carries any non-'none' transform (StoryboardRailVariant's `m.div` keeps a framer-motion
      // `rotateY` binding on `style`, which the browser treats as a transform even at ~0deg) becomes an
      // offsetParent-establishing element for its own children the moment that binding takes effect —
      // and only once it has. Before that it isn't. offsetLeft is measured against whatever the CURRENT
      // offsetParent is, so `child.offsetLeft - rail.offsetLeft` silently jumps by a constant (here, one
      // slide's worth of the rail's own left padding) depending on timing neither this hook nor its
      // caller controls — reproduced deterministically: fresh-loading the storyboard route directly
      // gives correct targets, but visiting the page that mounts it via a same-page state change (the
      // realistic path, since the variant switcher swaps it in without a reload) always lands 16px past
      // the browser's own native scroll-snap rest position. Rect deltas plus the rail's own scrollLeft
      // give the same number in the same coordinate space regardless of what establishes offsetParent.
      //
      // This still isn't safe to call mid-gesture on a rail a caller tilts in 3D by velocity
      // (StoryboardRailVariant does, proportional to scroll speed, easing back to flat once motion
      // stops): getBoundingClientRect reflects the CURRENT paint, so measuring while genuinely rotated
      // (a real few degrees at a normal drag's release, not the ~0 in the note above) reads the
      // perspective-skewed child positions, not the flat ones — a real, consistent few-px error,
      // proportional to how fast the drag was. `land()` below only ever calls this once per gesture, at
      // pointerdown, before any scroll-driven tilt exists, and reuses that snapshot through release.
      const railRect = rail.getBoundingClientRect()
      // Only direct children marked as a slide (`data-idx`) count as landing targets — a trailing
      // spacer some callers add so the last real slide can still reach the frame line is deliberately
      // excluded, never a place to land.
      const slides = Array.from(rail.querySelectorAll<HTMLElement>(':scope > [data-idx]'))
      return slides.map((el) => {
        const base = el.getBoundingClientRect().left - railRect.left + rail.scrollLeft
        return centered ? base - (rail.clientWidth - el.offsetWidth) / 2 : base
      })
    },
    [centerSnapBelow],
  )

  const restore = useCallback((rail: HTMLDivElement) => {
    rail.style.scrollSnapType = ''
    rail.style.userSelect = ''
    setIsDragging(false)
  }, [])

  const followLoop = useCallback(() => {
    const rail = ref.current
    const s = state.current
    if (!rail || !s.active) return
    rail.scrollLeft += (s.targetLeft - rail.scrollLeft) * FOLLOW
    rafId.current = requestAnimationFrame(followLoop)
  }, [ref])

  const land = useCallback(
    (rail: HTMLDivElement) => {
      const s = state.current
      // Snapshotted at pointerdown (see slideTargets' note), not re-measured here: by release a rail
      // that tilts with scroll velocity can be genuinely mid-rotation, which would skew a fresh read.
      const targets = s.targets
      if (targets.length === 0) {
        restore(rail)
        return
      }
      const velocityPxPerS = s.velocity * 1000
      const startIdx = nearestIndex(targets, s.startScrollLeft)
      const projected = rail.scrollLeft + velocityPxPerS * PROJECT_S
      let landingIdx = nearestIndex(targets, projected)
      if (Math.abs(velocityPxPerS) > FLICK_PX_PER_S && landingIdx === startIdx) {
        landingIdx = Math.max(0, Math.min(targets.length - 1, startIdx + (velocityPxPerS > 0 ? 1 : -1)))
      }
      const landingTarget = targets[landingIdx]
      const from = rail.scrollLeft

      controls.current?.stop()
      controls.current = null

      if (reduced) {
        rail.scrollLeft = landingTarget
        restore(rail)
        return
      }

      controls.current = animate(from, landingTarget, {
        type: 'spring',
        velocity: velocityPxPerS,
        stiffness: 60,
        damping: 17,
        mass: 1,
        restDelta: 0.4,
        restSpeed: 10,
        onUpdate: (v) => {
          if (ref.current) ref.current.scrollLeft = v
        },
        onComplete: () => restore(rail),
        onStop: () => restore(rail),
      })
    },
    [ref, reduced, restore],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return
      const rail = ref.current
      if (!rail) return
      controls.current?.stop()
      controls.current = null
      const s = state.current
      s.active = true
      s.moved = false
      s.pointerId = e.pointerId
      s.startX = e.clientX
      s.startScrollLeft = rail.scrollLeft
      s.targetLeft = rail.scrollLeft
      s.lastT = performance.now()
      // Snapshot now, before this gesture can have produced any scroll-driven tilt on a caller that
      // applies one — see the note on slideTargets.
      s.targets = slideTargets(rail)
      s.velocity = 0
    },
    [ref, slideTargets],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rail = ref.current
      const s = state.current
      if (!rail || !s.active || e.pointerId !== s.pointerId) return
      const dx = e.clientX - s.startX
      if (!s.moved && Math.abs(dx) > MOVE_THRESHOLD) {
        s.moved = true
        setIsDragging(true)
        rail.setPointerCapture(e.pointerId)
        rail.style.scrollSnapType = 'none'
        rail.style.userSelect = 'none'
        stopFollowLoop()
        rafId.current = requestAnimationFrame(followLoop)
      }
      if (!s.moved) return
      const nextTarget = s.startScrollLeft - dx
      const now = performance.now()
      const dt = now - s.lastT
      if (dt > 0) s.velocity = (nextTarget - s.targetLeft) / dt
      s.targetLeft = nextTarget
      s.lastT = now
    },
    [followLoop, ref, stopFollowLoop],
  )

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rail = ref.current
      const s = state.current
      if (!rail || !s.active) return
      s.active = false
      stopFollowLoop()
      try {
        rail.releasePointerCapture(e.pointerId)
      } catch {
        // capture may already be released by the browser (e.g. pointercancel)
      }
      if (!s.moved) return
      land(rail)
    },
    [land, ref, stopFollowLoop],
  )

  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }, [])

  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  useEffect(() => stopFollowLoop, [stopFollowLoop])

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onClickCapture, onDragStart },
    isDragging,
  }
}
