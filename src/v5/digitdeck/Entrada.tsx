// Entrada a pantalla completa (EX-2): solo en la primera visita de la sesión y solo al aterrizar en el inicio. La perla llega
// sola, el MB se escribe hasta ella, la placa sube y el MB plano viaja al encuadre del héroe, donde lo relevan los pósters
// (y luego el 3D). ≈1,1 s hasta que el titular está en su sitio; nunca retiene scroll, teclado ni foco (pointer-events: none),
// cualquier entrada la acelera, y un tope por CSS (1,6 s) la oculta aunque ningún script corra.
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { v5path } from '../data'
import { EASE } from './movimiento'
import { CapaPoster } from './mb/MBCromo'
import { useTransicion } from './transicion'

const CLAVE = 'v5-digitdeck-intro'

function debeJugar(pathname: string) {
  try {
    return pathname === v5path('digitdeck') && !sessionStorage.getItem(CLAVE)
  } catch {
    return false
  }
}

export default function Entrada() {
  const t = useTransicion()
  const { pathname } = useLocation()
  const [activa] = useState(() => debeJugar(pathname))
  const [fin, setFin] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const r = raiz.current
    if (!activa || !r) return
    let liberar!: () => void
    t.bloquear(new Promise<void>((res) => (liberar = res)))
    const hero = document.querySelector<HTMLElement>('[data-dd-hero-object]')
    let tl!: gsap.core.Timeline
    const ctx = gsap.context(() => {
      const marca = r.querySelector<HTMLElement>('.dd-entrada__marca')!
      const caja = marca.getBoundingClientRect()
      const meta = hero?.getBoundingClientRect()
      const viaje = meta
        ? { x: meta.left + meta.width / 2 - (caja.left + caja.width / 2), y: meta.top + meta.height / 2 - (caja.top + caja.height / 2), scale: meta.width / caja.width }
        : { x: 0, y: 0, scale: 1 }
      if (hero) gsap.set(hero, { opacity: 0 })
      tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(CLAVE, '1')
          } catch {
            /* sin almacenamiento: la entrada puede repetirse, no se rompe nada */
          }
          setFin(true)
        },
      })
      tl.fromTo('.dd-entrada [data-capa="perla"]', { scale: 0 }, { scale: 1, duration: 0.22, ease: EASE.puntual, transformOrigin: '87.3% 68.7%' }, 0)
        .fromTo('.dd-entrada [data-capa="letras"]', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: EASE.puntual }, 0.1)
        .to('.dd-entrada__placa', { clipPath: 'inset(0 0 100% 0)', duration: 0.42, ease: EASE.cortina }, 0.52)
        .add(liberar, 0.52) // el titular empieza a subir en cuanto la placa arranca
        .to(marca, { ...viaje, duration: 0.5, ease: EASE.cortina }, 0.52)
        .to(hero ?? {}, { opacity: 1, duration: 0.2, ease: EASE.out }, 0.9)
        .to(marca, { opacity: 0, duration: 0.12 }, 1.0)
    }, r)
    const acelerar = () => void tl.timeScale(6)
    const EVENTOS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    EVENTOS.forEach((e) => addEventListener(e, acelerar, { passive: true, once: true }))
    return () => {
      EVENTOS.forEach((e) => removeEventListener(e, acelerar))
      ctx.revert()
      liberar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!activa || fin) return null
  return (
    <div ref={raiz} className="dd-entrada" aria-hidden="true">
      <div className="dd-entrada__placa" />
      <div className="dd-entrada__marca">
        <CapaPoster capa="letras" />
        <CapaPoster capa="perla" />
      </div>
    </div>
  )
}
