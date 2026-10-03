import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Letras } from './Letras'
import { usePersona } from './contexto'
import { rafaga } from './efectos'
import { gsap } from './motion'
import { sfx } from './sfx'

export interface ItemMenu {
  id: string
  to: string
  label: string
  desc: string
}

/** El menú de juego: filas enormes con un selector inclinado que se desliza (con una imagen residual), ↑↓ para elegir,
 *  ↵ para confirmar, golpe y ráfaga al confirmar y, un instante después, el barrido diagonal. Las teclas funcionan con el
 *  foco o el puntero dentro y, como en el original, también al llegar: mientras el inicio está arriba y ningún otro
 *  control tiene el foco, el menú manda (Espacio y RePág siguen haciendo scroll). */
export function Menu({ items, aria, hint }: { items: ItemMenu[]; aria: string; hint: readonly string[] }) {
  const { ir } = usePersona()
  const nav = useRef<HTMLElement>(null)
  const selector = useRef<HTMLSpanElement>(null)
  const filas = useRef<(HTMLAnchorElement | null)[]>([])
  const [idx, setIdx] = useState(0)
  const previo = useRef(0)
  const montado = useRef(false)
  const dentro = useRef(false)

  const colocar = useCallback((i: number, animar: boolean) => {
    const fila = filas.current[i]
    const s = selector.current
    if (!fila || !s) return
    const margen = fila.offsetHeight > 70 ? 6 : 3 // en pantallas bajas las filas son más bajas: el selector las llena más
    const top = fila.offsetTop + margen
    gsap.set(s, { height: fila.offsetHeight - margen * 2 })
    if (!animar) return void gsap.set(s, { y: top })
    gsap.to(s, { y: top, duration: 0.22, ease: 'power3.out', overwrite: 'auto' })
  }, [])

  // Imagen residual: un fantasma del selector se queda en la fila que se deja y se desvanece.
  const fantasma = (desde: number) => {
    const prev = filas.current[desde]
    const n = nav.current
    if (!prev || !n) return
    const g = document.createElement('span')
    g.className = 'pr-menu__sel pr-menu__sel--fantasma'
    g.setAttribute('aria-hidden', 'true')
    n.insertBefore(g, n.firstChild)
    const m = prev.offsetHeight > 70 ? 6 : 3
    gsap.fromTo(g, { y: prev.offsetTop + m, height: prev.offsetHeight - m * 2, opacity: 0.4, scaleX: 1 }, { opacity: 0, scaleX: 0.9, duration: 0.26, ease: 'power2.out', onComplete: () => g.remove() })
  }

  useLayoutEffect(() => {
    if (montado.current && previo.current !== idx) fantasma(previo.current)
    colocar(idx, montado.current)
    previo.current = idx
    montado.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  useEffect(() => {
    const n = nav.current
    if (!n) return
    const ro = new ResizeObserver(() => colocar(previo.current, false))
    ro.observe(n)
    return () => ro.disconnect()
  }, [colocar])

  const mover = (siguiente: number) => {
    setIdx(siguiente)
    sfx.tono(760, 0.07)
  }

  const confirmar = (i: number) => {
    const fila = filas.current[i]
    const n = nav.current
    if (fila && n) rafaga(n, { x: '90px', y: `${fila.offsetTop + fila.offsetHeight / 2}px`, n: 12, rx: 170, ry: 64, dur: 0.5 })
    if (selector.current) gsap.fromTo(selector.current, { scaleX: 1 }, { scaleX: 1.06, duration: 0.11, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: '0% 50%', overwrite: 'auto' })
    sfx.tono(520, 0.14)
    ir(items[i].to, { retraso: 0.26 }) // el golpe y la ráfaga se ven antes de que el barrido los tape
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = nav.current
      if (!n || e.altKey || e.ctrlKey || e.metaKey) return
      const activo = document.activeElement
      const conFoco = !!activo && n.contains(activo)
      const nadieMas = !activo || activo === document.body || activo.id === 'contenido'
      const mandaElInicio = nadieMas && window.scrollY < 8
      if (!conFoco && !dentro.current && !mandaElInicio) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const sig = (idx + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
        mover(sig)
        if (conFoco) filas.current[sig]?.focus({ preventScroll: true })
      } else if (e.key === 'Enter' && !conFoco) {
        e.preventDefault()
        confirmar(idx)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, items])

  return (
    <nav className="pr-menu" aria-label={aria} ref={nav} onPointerEnter={() => (dentro.current = true)} onPointerLeave={() => (dentro.current = false)}>
      <span className="pr-menu__sel" ref={selector} aria-hidden="true" />
      {items.map((it, i) => (
        <a
          key={it.id}
          href={it.to}
          ref={(el) => {
            filas.current[i] = el
          }}
          className="pr-menu__item"
          data-sel={i === idx || undefined}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse' && i !== idx) mover(i)
          }}
          onFocus={() => i !== idx && mover(i)}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            e.preventDefault()
            confirmar(i)
          }}
        >
          <span className="pr-menu__n">{String(i + 1).padStart(2, '0')}</span>
          <Letras texto={it.label} intensidad={0.55} />
          <span className="pr-menu__desc">{it.desc}</span>
        </a>
      ))}
      <p className="pr-menu__hint">
        <b>↑↓</b> {hint[0]} · <b>↵</b> {hint[1]} · {hint[2]}
      </p>
    </nav>
  )
}
