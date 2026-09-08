import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m, useMotionValue, useSpring } from 'framer-motion'

const EASE = [0.23, 1, 0.32, 1] as const
const W = 260
const H = 163

/**
 * A capture that follows the cursor while a list row is hovered — the award-site "hover preview"
 * for typographic indexes. Pointer + hover devices ≥1024px only; nothing on touch or under
 * reduced motion (the row's tap already opens the sheet). Rendered into <body> so no animated
 * ancestor can reposition the fixed layer.
 */
export function useHoverPreview() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 320, damping: 32, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 320, damping: 32, mass: 0.5 })
  const [src, setSrc] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const hover = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(hover.matches && !reduced.matches)
    update()
    hover.addEventListener('change', update)
    reduced.addEventListener('change', update)
    return () => {
      hover.removeEventListener('change', update)
      reduced.removeEventListener('change', update)
    }
  }, [])

  const move = (e: MouseEvent) => {
    x.set(Math.min(e.clientX + 28, window.innerWidth - W - 16))
    y.set(Math.max(16, Math.min(e.clientY - H / 2, window.innerHeight - H - 16)))
  }

  /** Spread onto the hovered element. */
  const bind = (image: string) =>
    enabled
      ? {
          onMouseEnter: (e: MouseEvent) => {
            x.jump(Math.min(e.clientX + 28, window.innerWidth - W - 16))
            y.jump(Math.max(16, Math.min(e.clientY - H / 2, window.innerHeight - H - 16)))
            setSrc(image)
          },
          onMouseMove: move,
          onMouseLeave: () => setSrc(null),
        }
      : {}

  const node =
    enabled && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {src && (
              <m.div
                key={src}
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-40 overflow-hidden rounded-[12px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
                style={{ x: sx, y: sy, width: W, height: H }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <img src={src} alt="" width={W} height={H} className="block h-full w-full object-cover object-top" decoding="async" />
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null

  return { bind, node }
}
