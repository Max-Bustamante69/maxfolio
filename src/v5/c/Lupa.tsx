import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SHOT_DATE, SHOT_SIZE } from '../data'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { capturasDe } from './datos'
import { Lod } from './Lod'
import { gsap } from './movimiento'
import { useC } from './useC'

/** La lupa de la Lectura: con el puntero fino y sobre una diapositiva, tras un instante, la misma captura aparece a su tamaño (LOD 2)
 *  con el aro de lápiz, como la diapositiva elevada de la maqueta. Es una ayuda para el puntero: el teclado y el toque tienen la ficha y la Mesa. */
export function Lupa({ raiz }: { raiz: React.RefObject<HTMLElement | null> }) {
  const { t, obras } = useC()
  const hay = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 1200px)')
  const [id, setId] = useState<string | null>(null)
  const el = useRef<HTMLElement>(null)

  useEffect(() => {
    const r = raiz.current
    if (!r || !hay) return
    let espera = 0
    const sobre = (e: PointerEvent) => {
      const m = (e.target as Element).closest<HTMLElement>('[data-vuelo]')
      window.clearTimeout(espera)
      if (!m || !r.contains(m)) return setId(null)
      espera = window.setTimeout(() => setId(m.dataset.vuelo ?? null), 240)
    }
    const fuera = () => {
      window.clearTimeout(espera)
      setId(null)
    }
    r.addEventListener('pointerover', sobre)
    r.addEventListener('pointerleave', fuera)
    window.addEventListener('scroll', fuera, { passive: true })
    return () => {
      window.clearTimeout(espera)
      r.removeEventListener('pointerover', sobre)
      r.removeEventListener('pointerleave', fuera)
      window.removeEventListener('scroll', fuera)
    }
  }, [raiz, hay])

  const [slug, clave] = id ? id.split(':') : []
  const obra = obras.find((o) => o.slug === slug)
  const c = obra && capturasDe(obra).find((x) => `${x.vista}-${x.vp}` === clave)

  useLayoutEffect(() => {
    if (!el.current) return
    const ctx = gsap.context(() => void gsap.from(el.current, { opacity: 0, x: 18, scale: 0.97, duration: 0.2, ease: 'power3.out', clearProps: 'opacity,transform' }), el)
    return () => ctx.revert()
  }, [id])

  if (!obra || !c) return null
  const { w, h } = SHOT_SIZE[c.vp]
  return (
    <figure className="c-lupa" ref={el} aria-hidden="true" style={{ ['--asp' as string]: w / h }} data-vp={c.vp}>
      <div className="c-lupa__pic">
        <Lod slug={obra.slug} c={c} nivel={2} alt="" />
      </div>
      <figcaption className="c-lupa__pie c-mono">
        <span>
          LOD 2 · {w}×{h}
        </span>
        <span>
          {obra.name} · {t.pieVista[c.vista]} · {SHOT_DATE}
        </span>
      </figcaption>
    </figure>
  )
}
