// La cinta de capturas reales bajo el héroe: la ÚNICA marquesina de la página. Va por el compositor (WAAPI, translateX
// lineal, 30 px/s), inclinada 15°, sin un solo requestAnimationFrame propio mientras corre. Acelera con la velocidad del
// scroll (hasta ×3) y frena con rampa al pasar el cursor o enfocar; se suelta fuera de la vista y tiene botón de pausa.
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { Obra } from '../data'
import { v5path } from '../data'
import { useCopy } from './copy'
import { IconoPausa } from './iconos'
import { Enlace } from './transicion'
import { entradaTerminada } from './Entrada'

const VELOCIDAD = 30 // px/s

export default function Cinta({ obras }: { obras: Obra[] }) {
  const c = useCopy()
  const raiz = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLUListElement>(null)
  const anim = useRef<Animation | null>(null)
  const [pausada, setPausada] = useState(false)
  const pausadaRef = useRef(false)
  pausadaRef.current = pausada
  const visibles = obras.filter((o) => o.views.includes('home'))
  // Las capturas se piden al terminar la entrada y con la página ociosa: son decoración bajo el héroe y, pedidas a la vez que él, le
  // quitaban ancho de banda al LCP (Lantern lo reparte por igual entre todo lo que baja a la vez).
  const [cargar, setCargar] = useState(false)
  useEffect(() => {
    let vivo = true
    let id = 0
    const ocio = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200))
    entradaTerminada.then(() => { if (vivo) id = ocio(() => setCargar(true), { timeout: 1500 }) })
    return () => { vivo = false; (window.cancelIdleCallback ?? window.clearTimeout)(id) }
  }, [])

  useEffect(() => {
    const el = pista.current
    const caja = raiz.current
    if (!el || !caja || !visibles.length || typeof el.animate !== 'function') return
    const estado = { f: 1 } // factor de velocidad (0 = quieta, 1 = 30 px/s, hasta 3 con el scroll)
    let dentro = true
    let sobre = false
    const aplicar = () => anim.current?.updatePlaybackRate(pausadaRef.current || !dentro ? 0 : estado.f)
    const montar = () => {
      const mitad = el.scrollWidth / 2
      if (!mitad) return
      const progreso = Number(anim.current?.effect?.getComputedTiming().progress ?? 0)
      anim.current?.cancel()
      anim.current = el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-mitad}px)` }], { duration: (mitad / VELOCIDAD) * 1000, iterations: Infinity, easing: 'linear' })
      if (progreso) anim.current.currentTime = progreso * (mitad / VELOCIDAD) * 1000
      aplicar()
    }
    montar()
    const ro = new ResizeObserver(montar)
    ro.observe(el)

    // Frena (no corta) al pasar el cursor o enfocar: rampa de 300 ms.
    const frenar = (v: boolean) => {
      sobre = v
      gsap.to(estado, { f: v ? 0 : 1, duration: 0.3, ease: 'power2.out', onUpdate: aplicar, overwrite: true })
    }
    const entra = () => frenar(true)
    const sale = () => frenar(false)
    caja.addEventListener('pointerenter', entra)
    caja.addEventListener('pointerleave', sale)
    caja.addEventListener('focusin', entra)
    caja.addEventListener('focusout', sale)

    // Acelera con la velocidad del scroll y decae a 1: un único oyente pasivo, sin leer geometría.
    let y = scrollY
    let t = performance.now()
    const alScroll = () => {
      const ahora = performance.now()
      const v = Math.abs(scrollY - y) / Math.max(ahora - t, 1)
      y = scrollY
      t = ahora
      if (sobre) return
      estado.f = Math.min(3, Math.max(estado.f, 1 + v * 1.2))
      aplicar()
      gsap.to(estado, { f: 1, duration: 1.2, ease: 'power2.out', onUpdate: aplicar, overwrite: true })
    }
    addEventListener('scroll', alScroll, { passive: true })

    // Fuera de la vista la cinta se suelta (0 trabajo).
    const io = new IntersectionObserver(([e]) => {
      dentro = e.isIntersecting
      aplicar()
    })
    io.observe(caja)
    return () => {
      ro.disconnect()
      io.disconnect()
      removeEventListener('scroll', alScroll)
      caja.removeEventListener('pointerenter', entra)
      caja.removeEventListener('pointerleave', sale)
      caja.removeEventListener('focusin', entra)
      caja.removeEventListener('focusout', sale)
      gsap.killTweensOf(estado)
      anim.current?.cancel()
      anim.current = null
    }
  }, [visibles.length])

  useEffect(() => {
    anim.current?.updatePlaybackRate(pausada ? 0 : 1)
  }, [pausada])

  const copia = (segunda: boolean) =>
    visibles.map((o, i) => (
      <li key={`${segunda ? 'b' : 'a'}-${o.slug}`} className="dd-cinta__item" aria-hidden={segunda || undefined} inert={segunda || undefined}>
        <Enlace to={v5path('digitdeck', 'obra', o.slug)} etiqueta={o.name} className="dd-ventana" aria-label={c.hero.abrir(o.name)} tabIndex={segunda ? -1 : undefined}>
          <img src={cargar ? `/v5/digitdeck/cinta/${o.slug}.webp` : undefined} width={366} height={792} alt="" loading={i < 4 && !segunda ? 'eager' : 'lazy'} decoding="async" draggable={false} />
        </Enlace>
      </li>
    ))

  if (!visibles.length) return null
  return (
    <div ref={raiz} className="dd-cinta" role="group" aria-label={c.hero.cinta}>
      <button type="button" className="dd-cinta__pausa" aria-pressed={pausada} aria-label={pausada ? c.hero.reanudar : c.hero.pausar} onClick={() => setPausada((p) => !p)}>
        <IconoPausa pausado={pausada} />
      </button>
      <div className="dd-cinta__inclinada">
        <ul ref={pista} className="dd-cinta__pista">
          {copia(false)}
          {copia(true)}
        </ul>
      </div>
    </div>
  )
}
