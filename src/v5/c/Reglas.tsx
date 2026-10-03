import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react'

// Las reglas de la mesa: marcas cada 34 px de pantalla y un número cada 340 px con la coordenada de mundo bajo él.
// Solo se mueven con transform; el texto de las marcas cambia únicamente mientras la cámara se mueve.
const PASO = 34
const SALTO = 340
const NX = 6
const NY = 4

export interface ReglasApi {
  /** Cámara: la pantalla es mundo·z + (x, y). */
  actualizar: (x: number, y: number, z: number) => void
}

const miles = (n: number) => String(Math.round(n / 10) * 10).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const mod = (a: number, b: number) => ((a % b) + b) % b

export function Reglas({ ref }: { ref?: Ref<ReglasApi> }) {
  const dx = useRef<HTMLDivElement>(null)
  const dy = useRef<HTMLDivElement>(null)
  const mx = useRef<(HTMLElement | null)[]>([])
  const my = useRef<(HTMLElement | null)[]>([])

  const actualizar = (x: number, y: number, z: number) => {
    if (dx.current) dx.current.style.transform = `translate3d(${mod(x, PASO) - PASO}px,0,0)`
    if (dy.current) dy.current.style.transform = `translate3d(0,${mod(y, PASO) - PASO}px,0)`
    const ox = mod(x, SALTO)
    mx.current.forEach((el, i) => {
      if (!el) return
      const sx = i * SALTO + ox
      el.style.transform = `translate3d(${sx + 5}px,0,0)`
      el.textContent = miles((sx - x) / z)
    })
    const oy = mod(y, SALTO)
    my.current.forEach((el, i) => {
      if (!el) return
      const sy = i * SALTO + oy
      el.style.transform = `translate3d(0,${sy - 5}px,0) rotate(-90deg)`
      el.textContent = miles((sy - y) / z)
    })
  }
  useImperativeHandle(ref, () => ({ actualizar }), [])
  // Estado de reposo: la mesa vista entera (≈ 0,34), igual que la maqueta aprobada.
  useLayoutEffect(() => actualizar(28, 138, 0.34), [])

  return (
    <div className="c-reglas" aria-hidden="true">
      <div className="c-regla c-regla--x">
        <div className="c-regla__desliza" ref={dx}>
          <div className="c-regla__tira" />
        </div>
        {Array.from({ length: NX }, (_, i) => (
          <i key={i} className="c-regla__marca" ref={(el) => void (mx.current[i] = el)} />
        ))}
      </div>
      <div className="c-regla c-regla--y">
        <div className="c-regla__desliza" ref={dy}>
          <div className="c-regla__tira" />
        </div>
        {Array.from({ length: NY }, (_, i) => (
          <i key={i} className="c-regla__marca" ref={(el) => void (my.current[i] = el)} />
        ))}
      </div>
    </div>
  )
}

/** Las cuatro marcas de registro de un calco (las esquinas por las que se alinea sobre la mesa) y el trazo de lápiz de su borde de arriba
 *  (invisible en reposo: lo traza la entrada de la vista, movimiento.ts). */
export function Registros() {
  return (
    <>
      <i className="c-lapiz" aria-hidden="true" />
      {(['a', 'b', 'c', 'd'] as const).map((k) => (
        <svg key={k} className={`c-reg c-reg--${k}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <circle cx="8" cy="8" r="3.6" />
          <path d="M8 0v16M0 8h16" />
        </svg>
      ))}
    </>
  )
}
