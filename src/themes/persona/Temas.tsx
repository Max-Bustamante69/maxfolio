import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useCambioDeTema } from '../temas'
import { Letras } from './Letras'
import { usePersona } from './contexto'
import { rafaga } from './efectos'
import { gsap, OUT, SLAM } from './motion'
import { sfx } from './sfx'
import { textoTemas } from './temasTexto'
import './temas.css'

// El selector de temas de Persona: la pantalla «SELECT STAGE» de un juego de arcade. Un barrido diagonal de acento y tinta
// cubre la página, el título se pega letra a letra y las ocho opciones caen como cartas inclinadas; un selector azul
// (el mismo gesto que el menú del inicio) se desliza hasta la carta elegida con ←→↑↓. ↵ confirma: golpe, ráfaga, un
// segundo barrido con el nombre del tema y recién entonces se cambia de tema. Todo es GSAP dentro de un gsap.context()
// que se revierte al desmontar, y con el panel quieto no se pide ni un fotograma (el ticker de GSAP se duerme solo).
// Este archivo se carga con lazy() al abrir el panel: ni su código, ni su CSS, ni las ocho vistas previas pesan antes.

// Las tres posiciones del filo diagonal (en % del panel). Mismo número de puntos en las tres para que GSAP las interpole:
// DESDE = escondido a la izquierda; LLENO = cubre todo (el filo sale por la derecha); FUERA = se fue por la derecha.
const DESDE = 'polygon(-20% 0%, 0% 0%, -16% 100%, -20% 100%)'
const LLENO = 'polygon(-20% 0%, 116% 0%, 100% 100%, -20% 100%)'
const FUERA = 'polygon(116% 0%, 116% 0%, 100% 100%, 100% 100%)'
/** Cuánto sobresale el selector azul de la carta que marca (en px, cada lado). */
const PAD_X = 14
const PAD_Y = 12

type Fase = 'entrando' | 'listo' | 'eligiendo' | 'saliendo'

// El código de cada tema (el mismo que monta Router.tsx): se pide al elegir, mientras el barrido tapa la página, para que el cambio
// no deje un parpadeo en blanco mientras llega el tema nuevo.
const cargadores = import.meta.glob<unknown>('../*/App.tsx')

export default function PanelTemas({ onCerrar }: { onCerrar: () => void }) {
  const { v5 } = usePersona()
  const t = textoTemas(v5.locale)
  const { temas, actual, cambiar } = useCambioDeTema()
  const idxActual = Math.max(0, temas.findIndex((x) => x.id === actual))
  const [sel, setSel] = useState(idxActual)
  const [elegido, setElegido] = useState<number | null>(null)

  const panel = useRef<HTMLDivElement>(null)
  const rejilla = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const cursor = useRef<HTMLSpanElement>(null)
  const cubre = useRef<HTMLDivElement>(null)
  const cartas = useRef<(HTMLAnchorElement | null)[]>([])
  const ctx = useRef<gsap.Context | null>(null)
  const entrada = useRef<gsap.core.Timeline | null>(null)
  const fase = useRef<Fase>('entrando')
  const selRef = useRef(idxActual)
  const previo = useRef(idxActual)
  const montado = useRef(false)
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Lo que cambia en cada render (la lista se recalcula) se lee desde aquí para que los manejadores no queden viejos.
  const viva = useRef({ temas, actual, cambiar, onCerrar })
  viva.current = { temas, actual, cambiar, onCerrar }

  const filas = () => cartas.current.map((a) => a?.parentElement).filter((l): l is HTMLElement => !!l)

  // --- El selector azul: se desliza (solo x/y) hasta la carta marcada y deja una imagen residual en la que abandona ---
  const colocar = useCallback((i: number, animar: boolean) => {
    const li = cartas.current[i]?.parentElement
    const c = cursor.current
    const ul = lista.current
    if (!li || !c || !ul) return
    gsap.set(c, { width: li.offsetWidth + PAD_X * 2, height: li.offsetHeight + PAD_Y * 2 })
    const pos = { x: ul.offsetLeft + li.offsetLeft - PAD_X, y: ul.offsetTop + li.offsetTop - PAD_Y }
    if (!animar) return void gsap.set(c, pos)
    gsap.to(c, { ...pos, duration: 0.24, ease: 'power3.out', overwrite: 'auto' })
  }, [])

  const fantasma = (desde: number) => {
    const li = cartas.current[desde]?.parentElement
    const host = rejilla.current
    const ul = lista.current
    if (!li || !host || !ul) return
    const g = document.createElement('span')
    g.className = 'pt-cursor pt-cursor--fantasma'
    g.setAttribute('aria-hidden', 'true')
    host.insertBefore(g, host.firstChild)
    ctx.current?.add(() => {
      gsap.fromTo(
        g,
        { x: ul.offsetLeft + li.offsetLeft - PAD_X, y: ul.offsetTop + li.offsetTop - PAD_Y, width: li.offsetWidth + PAD_X * 2, height: li.offsetHeight + PAD_Y * 2, opacity: 0.4, scaleX: 1 },
        { opacity: 0, scaleX: 0.9, duration: 0.26, ease: 'power2.out', onComplete: () => g.remove() },
      )
    })
  }

  useLayoutEffect(() => {
    if (montado.current && previo.current !== sel) fantasma(previo.current)
    colocar(sel, montado.current)
    previo.current = sel
    montado.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel])

  useEffect(() => {
    const host = rejilla.current
    if (!host) return
    const ro = new ResizeObserver(() => colocar(selRef.current, false))
    ro.observe(host)
    return () => ro.disconnect()
  }, [colocar])

  // --- Entrada: barrido de acento y de tinta, título pegado letra a letra, cartas que caen una tras otra ---
  useLayoutEffect(() => {
    const el = panel.current
    if (!el) return
    const c = gsap.context(() => {
      gsap.set('.pt-cubre', { xPercent: -120 })
      const tl = gsap.timeline({ onComplete: () => void (fase.current === 'entrando' && (fase.current = 'listo')) })
      tl.fromTo('.pt-hoja--acento', { clipPath: DESDE }, { clipPath: LLENO, duration: 0.36, ease: 'power3.out' }, 0)
        .fromTo('.pt-hoja--tinta', { clipPath: DESDE }, { clipPath: LLENO, duration: 0.36, ease: 'power3.out' }, 0.07)
        .from('.pt-deco', { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0.3)
        .from('.pt-eyebrow', { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', duration: 0.45, ease: 'expo.out' }, 0.24)
        .from('.pt-losa', { scaleX: 0, duration: 0.36, ease: 'expo.out' }, 0.3)
        .from('.pt-h .pr-lineas', { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.3)
        .from(el.querySelectorAll('.pt-h .pr-letra'), { opacity: 0, yPercent: -70, rotation: () => gsap.utils.random(-32, 32), scale: 1.55, duration: 0.5, ease: SLAM, stagger: { each: 0.03, from: 'start' } }, 0.32)
        .from(filas(), { opacity: 0, y: 48, rotation: () => gsap.utils.random(-7, 7), scale: 0.86, duration: 0.5, ease: SLAM, stagger: 0.04, clearProps: 'transform,opacity' }, 0.28)
        .from('.pt-cerrar, .pt-hint', { opacity: 0, y: -14, duration: 0.35, ease: OUT, stagger: 0.06, clearProps: 'transform,opacity' }, 0.42)
        .from(cursor.current, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.62)
      entrada.current = tl
    }, el)
    ctx.current = c
    return () => {
      clearTimeout(espera.current)
      c.revert()
      ctx.current = null
      entrada.current = null
    }
  }, [])

  // --- Modal de verdad: el resto de la página queda inerte, la página no se desplaza y el foco entra en la carta actual ---
  useLayoutEffect(() => {
    const el = panel.current
    const raiz = el?.parentElement
    if (!el || !raiz) return
    const otros = Array.from(raiz.children).filter((n) => n !== el && !n.hasAttribute('inert'))
    otros.forEach((n) => n.setAttribute('inert', ''))
    const html = document.documentElement
    const antes = html.style.overflow
    html.style.overflow = 'hidden'
    cartas.current[idxActual]?.focus()
    return () => {
      otros.forEach((n) => n.removeAttribute('inert'))
      html.style.overflow = antes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Salir sin elegir: las cartas caen, la tinta y luego el acento se van por la derecha ---
  const cerrar = useCallback(() => {
    if (fase.current === 'saliendo' || fase.current === 'eligiendo') return
    fase.current = 'saliendo'
    sfx.tono(380, 0.08)
    entrada.current?.kill()
    ctx.current?.add(() => {
      gsap
        .timeline({ onComplete: () => viva.current.onCerrar() })
        .to(filas(), { opacity: 0, y: 28, rotation: () => gsap.utils.random(-6, 6), duration: 0.2, ease: 'power2.in', stagger: { each: 0.012, from: 'end' } }, 0)
        .to('.pt-cabecera, .pt-cerrar, .pt-cursor', { opacity: 0, duration: 0.14 }, 0)
        .to('.pt-hoja--tinta', { clipPath: FUERA, duration: 0.34, ease: 'power3.in' }, 0.1)
        .to('.pt-hoja--acento', { clipPath: FUERA, duration: 0.34, ease: 'power3.in' }, 0.17)
    })
  }, [])

  // --- Elegir: golpe y ráfaga en la carta, el resto cae, un segundo barrido con el nombre y, cubierto, el cambio de tema ---
  const confirmar = useCallback(
    (i: number) => {
      if (fase.current === 'eligiendo' || fase.current === 'saliendo') return
      const { temas: lista_, actual: a, cambiar: ir } = viva.current
      const tema = lista_[i]
      if (!tema) return
      if (tema.id === a) return void cerrar() // ya estás aquí: la carta actual solo cierra
      fase.current = 'eligiendo'
      flushSync(() => setElegido(i)) // el nombre del tema elegido tiene que existir antes de que el barrido lo traiga
      sfx.tono(520, 0.14)
      let hecho = false
      let cubierto = false // el barrido ya tapa la pantalla
      let cargado = false // el código del tema nuevo ya llegó
      const cambiarYa = () => {
        if (hecho) return
        hecho = true
        clearTimeout(espera.current)
        ir(tema.id)
      }
      const intentar = () => cubierto && cargado && cambiarYa()
      espera.current = setTimeout(cambiarYa, 1500) // red de seguridad: pestaña oculta (sin fotogramas), GSAP interrumpido o red lenta
      const carga = cargadores[`../${tema.id}/App.tsx`]?.()
      if (carga) void carga.catch(() => undefined).then(() => ((cargado = true), intentar()))
      else cargado = true
      const li = cartas.current[i]?.parentElement
      const host = rejilla.current
      const ul = lista.current
      const nombre = cubre.current?.querySelectorAll('.pr-letra')
      if (!li || !host || !ul) return void cambiarYa()
      entrada.current?.kill()
      ctx.current?.add(() => {
        rafaga(host, { x: `${ul.offsetLeft + li.offsetLeft + li.offsetWidth / 2}px`, y: `${ul.offsetTop + li.offsetTop + li.offsetHeight / 2}px`, n: 16, rx: 210, ry: 120, dur: 0.5 })
        const otras = filas().filter((_, k) => k !== i)
        const tl = gsap.timeline()
        tl.fromTo(li, { scale: 1 }, { scale: 1.12, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' }, 0)
          .to(otras, { opacity: 0, y: 34, duration: 0.2, ease: 'power2.in', stagger: { each: 0.014, from: i } }, 0.05)
          .to('.pt-cabecera, .pt-cerrar, .pt-cursor', { opacity: 0, duration: 0.15 }, 0.05)
          .to('.pt-cubre', { xPercent: 0, duration: 0.26, ease: 'power3.out' }, 0.2)
        if (nombre?.length) tl.from(nombre, { opacity: 0, yPercent: -70, rotation: () => gsap.utils.random(-32, 32), scale: 1.55, duration: 0.32, ease: SLAM, stagger: 0.018 }, 0.28)
        tl.add(() => ((cubierto = true), intentar()), 0.6)
      })
    },
    [cerrar],
  )

  // --- Teclado: ←→↑↓ mueven el selector, Inicio/Fin saltan, Tab se queda dentro y Escape cierra (antes que el ⎋ → inicio del cromo) ---
  useEffect(() => {
    const columnas = () => {
      const ls = filas()
      if (!ls.length) return 1
      return Math.max(1, ls.filter((l) => l.offsetTop === ls[0].offsetTop).length)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const p = panel.current
      if (!p) return
      const ocupado = fase.current === 'eligiendo' || fase.current === 'saliendo'
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        if (!ocupado) cerrar()
        return
      }
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      if (ocupado) return
      if (e.key === 'Tab') {
        const f = Array.from(p.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((n) => n.getClientRects().length > 0)
        if (!f.length) return
        const act = document.activeElement
        if (!act || !p.contains(act)) f[e.shiftKey ? f.length - 1 : 0].focus()
        else if (e.shiftKey && act === f[0]) f[f.length - 1].focus()
        else if (!e.shiftKey && act === f[f.length - 1]) f[0].focus()
        else {
          const k = f.indexOf(act as HTMLElement)
          f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus()
        }
        return
      }
      const n = cartas.current.length
      const i = selRef.current
      const cols = columnas()
      let sig = i
      if (e.key === 'ArrowRight') sig = (i + 1) % n
      else if (e.key === 'ArrowLeft') sig = (i + n - 1) % n
      else if (e.key === 'ArrowDown') sig = i + cols < n ? i + cols : i % cols
      else if (e.key === 'ArrowUp') {
        sig = i - cols >= 0 ? i - cols : i % cols + cols * Math.floor((n - 1) / cols)
        if (sig >= n) sig -= cols
      } else if (e.key === 'Home') sig = 0
      else if (e.key === 'End') sig = n - 1
      cartas.current[sig]?.focus()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [cerrar])

  const marcar = (i: number) => {
    selRef.current = i
    setSel(i)
  }

  return (
    <div id="pr-temas-panel" className="pt-panel" role="dialog" aria-modal="true" aria-labelledby="pt-titulo" ref={panel}>
      <div className="pt-hoja pt-hoja--acento" aria-hidden="true" />
      <div className="pt-hoja pt-hoja--tinta" aria-hidden="true">
        <span className="pt-corte pt-deco" />
        <span className="pt-trama pt-deco" />
      </div>

      <div className="pt-escena">
        <div className="pt-marco">
          <div className="pt-barra">
            <button type="button" className="pt-cerrar" onClick={cerrar}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
              <span>{t.cerrar}</span>
            </button>
          </div>

          <div className="pt-cabecera">
            <header className="pt-cabeza">
              <p className="pr-eyebrow pt-eyebrow">{t.eyebrow}</p>
              <h2 id="pt-titulo" className="pr-h pr-h--1 pt-h" aria-label={t.titulo}>
                <span className="pr-losa pt-losa" aria-hidden="true" />
                <span className="pr-lineas">
                  <Letras decorativo texto={t.titulo} intensidad={0.6} />
                </span>
              </h2>
            </header>
            <p className="pt-hint">
              <b>←→↑↓</b> {t.hint[0]} · <b>↵</b> {t.hint[1]} · <b>Esc</b> {t.hint[2]}
            </p>
          </div>

          <div className="pt-rejilla" ref={rejilla}>
            <span className="pt-cursor" ref={cursor} aria-hidden="true" />
            <ul className="pt-lista" ref={lista} aria-label={t.lista}>
              {temas.map((x, i) => {
                const esActual = x.id === actual
                return (
                  <li key={x.id} className="pt-item" data-sel={i === sel || undefined}>
                    <a
                      href={x.href}
                      ref={(el) => {
                        cartas.current[i] = el
                      }}
                      className="pt-carta"
                      aria-current={esActual ? 'true' : undefined}
                      aria-labelledby={`pt-n-${x.id}`}
                      aria-describedby={`pt-l-${x.id}`}
                      onPointerMove={(e) => {
                        // Solo un movimiento REAL del ratón marca la carta: al desplazar la lista con el teclado, las cartas pasan bajo un
                        // puntero quieto y el navegador finge entradas (sin movimiento) que le robarían el foco al teclado.
                        if (e.pointerType !== 'mouse' || i === selRef.current || (e.movementX === 0 && e.movementY === 0)) return
                        if (fase.current === 'eligiendo' || fase.current === 'saliendo') return
                        cartas.current[i]?.focus({ preventScroll: true })
                      }}
                      onFocus={() => {
                        if (i === selRef.current) return // ya está marcada (la del foco inicial, o el puntero sobre la que tiene el foco)
                        sfx.tono(760, 0.07)
                        marcar(i)
                      }}
                      onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // clic medio, ⌘/Ctrl: la pestaña nueva la abre el navegador
                        e.preventDefault()
                        confirmar(i)
                      }}
                    >
                      <span className="pt-carta__img">
                        <picture>
                          <source media="(max-width: 767px)" srcSet={x.previewMovil} width={390} height={844} />
                          <img src={x.preview} alt={x.nombre} width={720} height={450} loading="lazy" decoding="async" />
                        </picture>
                        <span className="pt-carta__n" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </span>
                      <span className="pt-carta__texto">
                        {esActual && (
                          <span className="pt-carta__ahora" aria-hidden="true">
                            {t.actual}
                          </span>
                        )}
                        <span id={`pt-n-${x.id}`} className="sr-only">
                          {x.nombre}
                        </span>
                        <Letras decorativo texto={x.nombre} intensidad={0.55} className="pt-carta__nombre" />
                        <span id={`pt-l-${x.id}`} className="pt-carta__lema">
                          {x.lema}
                        </span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-cubre" ref={cubre} aria-hidden="true">
        <span className="pt-cubre__kicker">{t.entrando}</span>
        <span className="pt-cubre__nombre">{elegido !== null && <Letras decorativo texto={temas[elegido].nombre} intensidad={0.7} />}</span>
      </div>
    </div>
  )
}
