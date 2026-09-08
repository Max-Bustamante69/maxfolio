import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { m, useMotionValue, useSpring } from 'framer-motion'

interface MagneticProps {
  children: ReactNode
  /** How far the element follows the cursor, as a share of the cursor's offset from its center. */
  strength?: number
  className?: string
}

/**
 * A button that leans toward the cursor and springs back when it leaves — pointer + hover devices
 * only, off under reduced motion. Transform-only, so it costs nothing on the main thread.
 */
export function Magnetic({ children, strength = 0.3, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })
  const [on, setOn] = useState(false)

  useEffect(() => {
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setOn(hover.matches && !reduced.matches)
    update()
    hover.addEventListener('change', update)
    reduced.addEventListener('change', update)
    return () => {
      hover.removeEventListener('change', update)
      reduced.removeEventListener('change', update)
    }
  }, [])

  const move = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div ref={ref} className={`inline-flex ${className}`} style={on ? { x: sx, y: sy } : undefined} onMouseMove={on ? move : undefined} onMouseLeave={on ? leave : undefined}>
      {children}
    </m.div>
  )
}
