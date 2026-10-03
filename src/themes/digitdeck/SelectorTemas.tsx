// Selector de temas de la dirección Digitdeck: una paleta de comandos (⌘K / Ctrl+K o el botón de la cabecera). Panel oscuro con
// buscador; a la izquierda los ocho temas en filas (el punto marca el que está en uso), a la derecha la captura del tema
// resaltado, que sigue al puntero, al foco y a las flechas. En móvil es una hoja inferior con la captura en la fila.
// Es un trozo aparte (lazy desde Marco.tsx): ni su JS, ni su CSS, ni una sola imagen existen hasta que se abre.
//
// Movimiento (gramática del punto): el panel crece como un disco desde el botón que lo abrió, los filetes de las filas se dibujan de
// izquierda a derecha y su contenido baja descubierto por una cortina; elegir un tema hace crecer el disco verde de la dirección
// desde el clic, con el nombre del tema encima, y entonces se cambia. Todo es GSAP dentro de un gsap.context (se revierte al
// desmontar) y CSS para el resaltado: con la paleta quieta no hay ni un fotograma pedido.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as TeclaReact, type PointerEvent as PunteroReact, type RefObject } from 'react'
import { gsap } from 'gsap'
import { useLanguage } from '../../context/LanguageContext'
import { useCambioDeTema, type ThemeId } from '../temas'
import { useCopyTemas } from './copy'
import { IconoCerrar } from './iconos'
import { EASE } from './movimiento'
import { useTransicion } from './transicion'
import './selector.css'

interface Props {
  /** El botón que abrió la paleta: de él nace el disco y a él vuelve el foco al cerrar. */
  disparador: RefObject<HTMLElement | null>
  onCerrado: () => void
}

/** Sin tildes ni mayúsculas: «plato» encuentra «Plató». */
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
const esMovil = () => matchMedia('(max-width: 767px)').matches
const sinTeclado = () => matchMedia('(hover: none), (pointer: coarse)').matches

export default function SelectorTemas({ disparador, onCerrado }: Props) {
  const { locale } = useLanguage()
  const t = useCopyTemas()
  const { temas, actual, cambiar } = useCambioDeTema()
  const tr = useTransicion()
  const [q, setQ] = useState('')
  const [activo, setActivo] = useState<ThemeId | null>(null)

  const raiz = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const entrada = useRef<HTMLInputElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const apertura = useRef<gsap.core.Timeline | null>(null)
  const estado = useRef({ saliendo: false, eligiendo: false, devolverFoco: false })
  const vivo = useRef({ actual, onCerrado })
  vivo.current = { actual, onCerrado }

  const visibles = temas.filter((x) => !q.trim() || norm(`${x.nombre} ${x.lema}`).includes(norm(q)))
  const resaltado = visibles.some((x) => x.id === activo) ? activo : null

  /** Centro del botón de origen y radio con que su disco alcanza la esquina más lejana del panel (en coordenadas del panel). */
  const geometria = () => {
    const r = panel.current!.getBoundingClientRect()
    const d = disparador.current?.getBoundingClientRect()
    const cx = d ? d.left + d.width / 2 - r.left : r.width - 40
    const cy = d ? d.top + d.height / 2 - r.top : -30
    const radio = Math.ceil(Math.max(Math.hypot(cx, cy), Math.hypot(r.width - cx, cy), Math.hypot(cx, r.height - cy), Math.hypot(r.width - cx, r.height - cy)))
    return { cx, cy, radio }
  }

  // ---- Entrada ----
  useLayoutEffect(() => {
    const movil = esMovil()
    const c = gsap.context(() => {
      const p = panel.current!
      const filas = [...lista.current!.querySelectorAll<HTMLElement>('li')]
      // Lo que baja descubierto por la cortina: el punto y el nombre de cada fila (en móvil también su lema y su captura, que ahí son de la fila).
      const contenido = filas.flatMap((li) => [...li.querySelectorAll<HTMLElement>(movil ? '.dd-pal__punto, .dd-pal__nombre, .dd-pal__vista > *' : '.dd-pal__punto, .dd-pal__nombre')])
      gsap.set(velo.current, { opacity: 0 })
      gsap.set(filas, { '--fil': 0 })
      gsap.set(contenido, { clipPath: 'inset(0 0 100% 0)' })
      const tl = (apertura.current = gsap.timeline())
      tl.to(velo.current, { opacity: 1, duration: 0.22, ease: 'none' }, 0)
      if (movil) {
        gsap.set(p, { yPercent: 100 })
        tl.to(p, { yPercent: 0, duration: 0.46, ease: EASE.out, clearProps: 'transform' }, 0)
      } else {
        const { cx, cy, radio } = geometria()
        gsap.set(p, { clipPath: `circle(0px at ${cx}px ${cy}px)` })
        tl.to(p, { clipPath: `circle(${radio}px at ${cx}px ${cy}px)`, duration: 0.4, ease: EASE.cubierta, clearProps: 'clipPath' }, 0)
      }
      tl.to(filas, { '--fil': 1, duration: 0.45, stagger: 0.03, ease: EASE.out, clearProps: '--fil' }, 0.12)
      tl.to(contenido, { clipPath: 'inset(0 0 0% 0)', duration: 0.45, stagger: { each: 0.006, from: 'start' }, ease: EASE.out, clearProps: 'clipPath' }, 0.16)
      // La captura del tema en uso aparece cuando las filas ya están: es el cambio de estado el que la dibuja (CSS).
      tl.call(() => setActivo((a) => a ?? vivo.current.actual), [], 0.3)
    }, raiz)
    ctx.current = c
    return () => c.revert()
  }, [])

  // Las capturas de las demás filas se piden en reposo, ya abierta: Chrome no carga una imagen «lazy» mientras su fila está recortada
  // (la captura se dibuja solo al resaltarla) y el primer barrido del puntero llegaría con el marco vacío. En móvil están todas a la vista.
  useEffect(() => {
    if (esMovil()) return
    const id = window.setTimeout(() => {
      temas.forEach((x) => {
        const img = new Image()
        img.decoding = 'async'
        ;(img as HTMLImageElement & { fetchPriority: string }).fetchPriority = 'low'
        img.src = x.preview
      })
    }, 650)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Cierre ----
  const salir = () => {
    const e = estado.current
    if (e.saliendo || e.eligiendo) return
    e.saliendo = true
    e.devolverFoco = true
    ctx.current?.add(() => {
      apertura.current?.kill()
      const p = panel.current!
      let fin = false
      const cerrar = () => {
        if (fin) return
        fin = true
        vivo.current.onCerrado()
      }
      const tl = gsap.timeline({ onComplete: cerrar })
      tl.to(velo.current, { opacity: 0, duration: 0.22, ease: 'none' }, 0)
      if (esMovil()) tl.to(p, { yPercent: 100, duration: 0.3, ease: EASE.cubierta }, 0)
      else {
        const { cx, cy, radio } = geometria()
        gsap.set(p, { clipPath: `circle(${radio}px at ${cx}px ${cy}px)` })
        tl.to(p, { clipPath: `circle(0px at ${cx}px ${cy}px)`, duration: 0.26, ease: EASE.cubierta }, 0)
      }
      window.setTimeout(cerrar, 800) // red de seguridad: con la pestaña en segundo plano GSAP no avanza
    })
  }

  // ---- Elegir ----
  const elegir = (id: ThemeId, nombre: string, origen: { x: number; y: number }) => {
    const e = estado.current
    if (e.eligiendo || e.saliendo) return
    if (id === vivo.current.actual) return salir()
    e.eligiendo = true
    raiz.current?.setAttribute('data-eligiendo', id)
    // El disco verde de la dirección tapa la pantalla con el nombre del tema; recién entonces se cambia (cookie, medida y ruta).
    const cubierto = tr.cubrir(origen, nombre).catch(() => undefined)
    const tope = new Promise<void>((r) => window.setTimeout(r, 900))
    void Promise.race([cubierto, tope]).then(() => cambiar(id))
  }
  const centroDe = (el: Element) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  // ---- Foco, fondo inerte, scroll bloqueado, Escape y atajo ----
  useEffect(() => {
    const aqui = raiz.current!
    const resto = [...(aqui.parentElement?.children ?? [])].filter((n) => n !== aqui && !n.matches('.dd-cubierta, .dd-cursor') && !n.hasAttribute('inert'))
    resto.forEach((n) => n.setAttribute('inert', ''))
    const html = document.documentElement
    const previo = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter }
    const barra = innerWidth - html.clientWidth // 0 con barras superpuestas (móvil, macOS): ahí no hay hueco que reservar
    html.style.overflow = 'hidden'
    if (barra > 0) html.style.scrollbarGutter = 'stable' // sin esto, al esconder la barra de scroll la página de atrás da un salto de ~15 px
    if (sinTeclado()) panel.current?.focus({ preventScroll: true })
    else entrada.current?.focus({ preventScroll: true })
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        salir()
      }
    }
    // La página de atrás no se mueve: la rueda solo corre dentro de la lista y solo mientras la lista tiene hacia dónde.
    const rueda = (e: WheelEvent) => {
      const l = lista.current
      if (l && e.target instanceof Node && l.contains(e.target) && l.scrollHeight > l.clientHeight) {
        const tope = (e.deltaY < 0 && l.scrollTop <= 0) || (e.deltaY > 0 && l.scrollTop + l.clientHeight >= l.scrollHeight - 1)
        if (!tope) return
      }
      e.preventDefault()
    }
    addEventListener('keydown', tecla)
    aqui.addEventListener('wheel', rueda, { passive: false })
    return () => {
      removeEventListener('keydown', tecla)
      aqui.removeEventListener('wheel', rueda)
      resto.forEach((n) => n.removeAttribute('inert'))
      html.style.overflow = previo.overflow
      html.style.scrollbarGutter = previo.gutter
      if (estado.current.devolverFoco) disparador.current?.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Teclado dentro del panel: trampa de foco y flechas entre las filas ----
  const alTecla = (e: TeclaReact<HTMLDivElement>) => {
    if (estado.current.eligiendo) return e.preventDefault()
    const foco = document.activeElement
    const filas = [...(lista.current?.querySelectorAll<HTMLAnchorElement>('.dd-pal__fila') ?? [])]
    if (e.key === 'Tab') {
      const f = [...panel.current!.querySelectorAll<HTMLElement>('input, button, a[href]')].filter((n) => n.getClientRects().length)
      if (!f.length) return
      if (e.shiftKey && (foco === f[0] || foco === panel.current)) (e.preventDefault(), f[f.length - 1].focus())
      else if (!e.shiftKey && foco === f[f.length - 1]) (e.preventDefault(), f[0].focus())
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!filas.length) return
      const i = foco instanceof HTMLAnchorElement ? filas.indexOf(foco) : -1
      if (e.key === 'ArrowDown') filas[(i + 1) % filas.length].focus()
      else if (i === 0) entrada.current?.focus()
      else filas[i < 0 ? filas.length - 1 : i - 1].focus()
      return
    }
    if ((e.key === 'Home' || e.key === 'End') && foco instanceof HTMLAnchorElement && filas.length) {
      e.preventDefault()
      filas[e.key === 'Home' ? 0 : filas.length - 1].focus()
      return
    }
    // Escribir estando en una fila vuelve al buscador (el carácter cae ya en él).
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && foco instanceof HTMLAnchorElement) entrada.current?.focus()
  }

  // ---- Arrastrar la hoja hacia abajo para cerrarla (solo móvil, desde el asa) ----
  const arrastre = useRef<{ y0: number; t0: number; dy: number } | null>(null)
  const alBajarAsa = (e: PunteroReact<HTMLDivElement>) => {
    if (estado.current.saliendo || estado.current.eligiendo) return
    e.currentTarget.setPointerCapture(e.pointerId)
    arrastre.current = { y0: e.clientY, t0: performance.now(), dy: 0 }
    apertura.current?.progress(1)
  }
  const alMoverAsa = (e: PunteroReact<HTMLDivElement>) => {
    const a = arrastre.current
    if (!a) return
    a.dy = Math.max(0, e.clientY - a.y0)
    gsap.set(panel.current, { y: a.dy })
  }
  const alSoltarAsa = () => {
    const a = arrastre.current
    arrastre.current = null
    if (!a) return
    const velocidad = a.dy / Math.max(1, performance.now() - a.t0)
    if (a.dy > 110 || velocidad > 0.7) salir()
    else gsap.to(panel.current, { y: 0, duration: 0.3, ease: EASE.out, clearProps: 'transform' })
  }

  const cambiarQ = (v: string) => {
    setQ(v)
    const primero = temas.find((x) => !v.trim() || norm(`${x.nombre} ${x.lema}`).includes(norm(v)))
    setActivo(primero?.id ?? null)
  }

  return (
    <div ref={raiz} className="dd-pal" lang={locale} onKeyDown={alTecla}>
      <div ref={velo} className="dd-pal__velo" onClick={() => salir()} aria-hidden="true" />
      <div ref={panel} id="dd-paleta" className="dd-pal__panel" role="dialog" aria-modal="true" aria-label={t.dialogo} tabIndex={-1}>
        <div className="dd-pal__asa" aria-hidden="true" onPointerDown={alBajarAsa} onPointerMove={alMoverAsa} onPointerUp={alSoltarAsa} onPointerCancel={alSoltarAsa}>
          <span />
        </div>
        <div className="dd-pal__cab">
          <h2 className="dd-pal__titulo">
            {t.temas}
            <span className="dd-dot" aria-hidden="true" />
          </h2>
          <span className="dd-pal__prompt dd-dot" aria-hidden="true" />
          <input
            ref={entrada}
            className="dd-pal__buscar"
            type="text"
            value={q}
            placeholder={`${t.buscar}…`}
            aria-label={t.buscar}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            onChange={(e) => cambiarQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
              const a = lista.current?.querySelector<HTMLAnchorElement>(`.dd-pal__fila[data-tema="${resaltado}"]`)
              if (!a || !resaltado) return
              e.preventDefault()
              elegir(resaltado, a.dataset.nombre ?? '', centroDe(a))
            }}
          />
          <button type="button" className="dd-pal__cerrar" aria-label={t.cerrar} onClick={() => salir()}>
            <IconoCerrar />
          </button>
        </div>
        <div className="dd-pal__cuerpo">
          <ul ref={lista} className="dd-pal__lista" role="list" aria-label={t.lista}>
            {visibles.map((x) => {
              const esActual = x.id === actual
              return (
                <li key={x.id} className="dd-pal__item" data-activo={resaltado === x.id} data-actual={esActual}>
                  <a
                    className="dd-pal__fila"
                    href={x.href}
                    data-tema={x.id}
                    data-nombre={x.nombre}
                    aria-current={esActual ? 'true' : undefined}
                    aria-label={x.nombre}
                    aria-describedby={`dd-pal-lema-${x.id}`}
                    onPointerEnter={() => setActivo(x.id)}
                    onFocus={() => setActivo(x.id)}
                    onClick={(e) => {
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                      e.preventDefault()
                      elegir(x.id, x.nombre, e.detail === 0 ? centroDe(e.currentTarget) : { x: e.clientX, y: e.clientY })
                    }}
                  >
                    <span className="dd-pal__punto" aria-hidden="true" />
                    <span className="dd-pal__nombre">
                      {x.nombre}
                      {esActual && <span className="dd-pal__tag">{t.actual}</span>}
                    </span>
                    <span className="dd-pal__vista">
                      <picture className="dd-pal__foto">
                        <source media="(max-width: 767px)" srcSet={x.previewMovil} />
                        <img src={x.preview} alt={x.nombre} width={720} height={450} loading="lazy" decoding="async" />
                      </picture>
                      <span id={`dd-pal-lema-${x.id}`} className="dd-pal__lema">{x.lema}</span>
                      <span className="dd-pal__ruta" aria-hidden="true">
                        <kbd>↵</kbd> {x.href}
                      </span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
          {!visibles.length && (
            <p className="dd-pal__vacio" role="status">
              {t.vacio}
            </p>
          )}
        </div>
        <div className="dd-pal__pie" aria-hidden="true">
          <span className="dd-pal__teclas">
            <kbd>↑</kbd>
            <kbd>↓</kbd> {t.mover}
          </span>
          <span className="dd-pal__teclas">
            <kbd>↵</kbd> {t.elegir}
          </span>
          <span className="dd-pal__teclas">
            <kbd>esc</kbd> {t.salir}
          </span>
          <span className="dd-pal__cuenta">{t.cuenta(visibles.length)}</span>
        </div>
      </div>
    </div>
  )
}
