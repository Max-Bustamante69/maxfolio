// Selector de temas de Plató: «Cambiar de set». Las luces de sala se apagan y se enciende el plató: una tira de película con los ocho
// fotogramas (las vistas previas) y una lámpara de tungsteno sobre el que está bajo el cursor o el foco. El tema en uso va rotulado
// «En rodaje». En escritorio la tira es un abanico (el fotograma activo se abre y los demás quedan como cantos de película); en móvil y
// táctil es una tira que se desliza con imán al centro.
//
// Es un trozo aparte (lazy desde App.tsx): ni su JS, ni su CSS, ni una sola imagen existen hasta que se abre. El abanico se mueve con
// transform y clip-path por transición de CSS; la entrada y la salida son GSAP dentro de un gsap.context. Con el panel quieto no hay
// ni un fotograma pedido.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useCambioDeTema } from '../../temas'
import { gsap } from '../motion'
import { Flecha, Rod } from '../piezas'
import { textosTemas } from './textos'
import './panel.css'

const MQ_ABANICO = '(min-width: 900px) and (hover: hover) and (pointer: fine)'
type Modo = 'abanico' | 'tira'
const modoInicial = (): Modo => (matchMedia(MQ_ABANICO).matches ? 'abanico' : 'tira')

/** El telón del plató: sube con el borde inclinado de la casa y baja por donde subió. */
const OCULTA = 'polygon(0% 112%, 100% 100%, 100% 100%, 0% 100%)'
const PLENA = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'

const dos = (n: number) => String(n).padStart(2, '0')

export default function PanelTemas({ alCerrado }: { alCerrado: () => void }) {
  const { locale } = useLanguage()
  const t = textosTemas(locale)
  const { temas, actual, cambiar } = useCambioDeTema()
  const n = temas.length
  const iActual = Math.max(0, temas.findIndex((x) => x.id === actual))
  const [modo, setModo] = useState<Modo>(modoInicial)
  const [activo, setActivo] = useState(iActual)
  const [elegido, setElegido] = useState<string | null>(null)

  const raiz = useRef<HTMLDivElement>(null)
  const vista = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const entrada = useRef<gsap.core.Timeline | null>(null)
  const recalcular = useRef<() => void>(() => {})
  const liberar = useRef<() => void>(() => {})
  const estado = useRef({ saliendo: false, eligiendo: false, cerrado: false, ignorarHasta: 0, modo, intencion: 0, toqueEn: -1 })
  estado.current.modo = modo
  const vivo = useRef({ actual, cambiar, alCerrado })
  vivo.current = { actual, cambiar, alCerrado }

  const enlaces = () => Array.from(lista.current?.querySelectorAll<HTMLAnchorElement>('a.pl-set-a') ?? [])

  /** Centra el fotograma `i` en la tira táctil (el imán lo deja exacto). */
  const centrar = (i: number, comportamiento: ScrollBehavior) => {
    const v = vista.current
    const li = lista.current?.children[i] as HTMLElement | undefined
    if (!v || !li) return
    const espera = comportamiento === 'smooth' ? 650 : 60
    estado.current.ignorarHasta = performance.now() + espera
    v.scrollTo({ left: li.offsetLeft + li.offsetWidth / 2 - v.clientWidth / 2, behavior: comportamiento })
    window.setTimeout(() => recalcular.current(), espera + 60) // lo que el observador calló mientras el scroll era nuestro
  }

  // ---- El modo sigue a la pantalla (girar una tableta, redimensionar la ventana) ----
  useEffect(() => {
    const mq = matchMedia(MQ_ABANICO)
    const f = () => setModo(mq.matches ? 'abanico' : 'tira')
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

  // ---- En la tira táctil, el fotograma que cruza el centro es el activo (un observador: sin oyentes de scroll) ----
  useEffect(() => {
    if (modo !== 'tira') return
    const v = vista.current!
    const items = Array.from(lista.current!.children) as HTMLElement[]
    const dentro = new Set<number>()
    const decidir = () => {
      if (performance.now() < estado.current.ignorarHasta) return
      const c = v.getBoundingClientRect()
      const cx = c.left + c.width / 2
      let mejor = -1
      let dist = Infinity
      dentro.forEach((i) => {
        const r = items[i].getBoundingClientRect()
        const d = Math.abs(r.left + r.width / 2 - cx)
        if (d < dist) { dist = d; mejor = i }
      })
      if (mejor >= 0) setActivo(mejor)
    }
    recalcular.current = decidir
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        const i = items.indexOf(e.target as HTMLElement)
        if (e.isIntersecting) dentro.add(i)
        else dentro.delete(i)
      })
      decidir()
    }, { root: v, rootMargin: '0px -46% 0px -46%' })
    items.forEach((li) => io.observe(li))
    return () => io.disconnect()
  }, [modo])
  // La tira táctil nace con el tema en uso en el centro (antes de pintar).
  useLayoutEffect(() => { if (modo === 'tira') centrar(iActual, 'auto') }, [modo]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Entrada: el telón sube, el título asoma por su máscara y la película avanza con los fotogramas ----
  useLayoutEffect(() => {
    const el = raiz.current!
    const c = gsap.context(() => {
      const q = gsap.utils.selector(el)
      gsap.set(el, { clipPath: OCULTA })
      const tl = (entrada.current = gsap.timeline({ onComplete: () => { gsap.set(el, { clearProps: 'clipPath' }) } }))
      // Al terminar cada tramo se limpian sus estilos en línea: un `opacity: 1` o un `transform` que GSAP dejase pisarían al CSS (el hover de los botones y el estado «elegido»).
      tl.to(el, { clipPath: PLENA, duration: 0.55, ease: 'pl-rod' }, 0)
        .from(q('.pl-tm-t-in'), { yPercent: 112, duration: 0.9, ease: 'pl', clearProps: 'transform' }, 0.2)
        .from(q('.pl-tm-k, .pl-tm-lead, .pl-tm-x'), { opacity: 0, y: 14, duration: 0.7, ease: 'pl', stagger: 0.06, clearProps: 'opacity,transform' }, 0.3)
        .from(q('.pl-tm-rollo'), { x: 110, duration: 1.05, ease: 'pl', clearProps: 'transform' }, 0.12)
        .from(q('.pl-tm-perf i'), { x: 160, duration: 1.2, ease: 'pl', clearProps: 'transform' }, 0.12)
        .from(q('.pl-set-in'), { opacity: 0, y: 44, duration: 0.8, ease: 'pl', stagger: 0.05, clearProps: 'opacity,transform' }, 0.28)
        .from(q('.pl-tm-ayuda'), { opacity: 0, duration: 0.6, ease: 'power1.out', clearProps: 'opacity' }, 0.9)
    }, el)
    ctx.current = c
    return () => c.revert()
  }, [])

  // ---- Cierre ----
  const fin = () => {
    const e = estado.current
    if (e.cerrado) return
    e.cerrado = true
    liberar.current()
    vivo.current.alCerrado()
  }
  const salir = () => {
    const e = estado.current
    if (e.saliendo || e.eligiendo) return
    e.saliendo = true
    ctx.current?.add(() => {
      const el = raiz.current!
      const q = gsap.utils.selector(el)
      entrada.current?.kill()
      gsap.set(el, { clipPath: PLENA })
      gsap.timeline({ onComplete: fin })
        .to(q('.pl-set-luz'), { opacity: 0, duration: 0.16, ease: 'none' }, 0)
        .to(q('.pl-set-in'), { opacity: 0, y: 22, duration: 0.28, ease: 'power2.in', stagger: 0.018 }, 0)
        .to(q('.pl-tm-cab, .pl-tm-intro, .pl-tm-ayuda'), { opacity: 0, duration: 0.22, ease: 'power1.in' }, 0)
        .to(el, { clipPath: OCULTA, duration: 0.45, ease: 'pl-rod' }, 0.12)
    })
    window.setTimeout(fin, 1100) // red de seguridad: con la pestaña en segundo plano GSAP no avanza
  }

  // ---- Elegir: el fotograma elegido se enciende de golpe (la claqueta), el resto se apaga y entonces se cambia ----
  const elegir = (i: number) => {
    const e = estado.current
    if (e.eligiendo || e.saliendo) return
    const x = temas[i]
    if (x.id === vivo.current.actual) return salir()
    e.eligiendo = true
    setActivo(i)
    setElegido(x.id)
    window.setTimeout(() => vivo.current.cambiar(x.id), 130) // el cambio arranca ya (el trozo del tema nuevo se pide); el viejo queda a la vista hasta que llega
    // Si el tema nuevo no ha montado a los 6 s (el trozo no llega, o el router no completa el cambio), la elección se cumple con una carga normal de su dirección:
    // nunca queda la URL de un tema con la pantalla de otro.
    window.setTimeout(() => { if (!e.cerrado && raiz.current?.isConnected) window.location.assign(x.href) }, 6000)
  }

  // ---- Foco, fondo inerte, scroll bloqueado, Escape y trampa de Tab ----
  useEffect(() => {
    const aqui = raiz.current!
    const pagina = aqui.closest('.pl-raiz')
    const fondo = pagina ? Array.from(pagina.querySelectorAll<HTMLElement>(':scope > .pl-saltar, :scope > .pl-cab > .pl-cab-in, :scope > .pl-cuerpo')) : []
    fondo.forEach((x) => x.setAttribute('inert', ''))
    const html = document.documentElement
    const previo = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter }
    const barra = innerWidth - html.clientWidth // 0 con barras superpuestas (móvil, macOS): ahí no hay hueco que reservar
    html.style.overflow = 'hidden'
    if (barra > 0) html.style.scrollbarGutter = 'stable' // sin esto, al esconder la barra la página de atrás da un salto de ~15 px
    ;(aqui.querySelector<HTMLElement>('a[aria-current="true"]') ?? aqui.querySelector<HTMLElement>('a'))?.focus({ preventScroll: true })

    const enfocables = () => Array.from(aqui.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((x) => x.getClientRects().length)
    const alTecla = (e: KeyboardEvent) => {
      if (estado.current.eligiendo) return e.preventDefault()
      const foco = document.activeElement as HTMLElement | null
      if (e.key === 'Tab') {
        const f = enfocables()
        if (!f.length) return
        if (e.shiftKey && (foco === f[0] || foco === aqui)) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && foco === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
        return
      }
      const ls = enlaces()
      const i = foco instanceof HTMLAnchorElement ? ls.indexOf(foco) : -1
      const ir = (j: number) => {
        e.preventDefault()
        e.stopPropagation() // las flechas del plató de fondo (lotes de la obra) no deben enterarse
        const a = ls[(j + ls.length) % ls.length]
        a.focus({ preventScroll: true })
        if (estado.current.modo === 'tira') centrar(ls.indexOf(a), 'smooth')
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ir(i < 0 ? 0 : i + 1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ir(i < 0 ? ls.length - 1 : i - 1)
      else if (e.key === 'Home') ir(0)
      else if (e.key === 'End') ir(ls.length - 1)
    }
    const enVentana = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); salir() }
      else if (e.key === 'Tab' && !aqui.contains(document.activeElement)) { e.preventDefault(); enfocables()[0]?.focus() }
    }
    aqui.addEventListener('keydown', alTecla)
    window.addEventListener('keydown', enVentana)
    // Escritorio: las ocho vistas previas se piden de una vez, para que el barrido del puntero no llegue a un marco vacío.
    if (estado.current.modo === 'abanico') temas.forEach((x) => { const im = new Image(); im.decoding = 'async'; im.src = x.preview })

    let suelto = false
    const soltar = () => {
      if (suelto) return
      suelto = true
      aqui.removeEventListener('keydown', alTecla)
      window.removeEventListener('keydown', enVentana)
      fondo.forEach((x) => x.removeAttribute('inert'))
      html.style.overflow = previo.overflow
      html.style.scrollbarGutter = previo.gutter
    }
    liberar.current = soltar
    return () => { soltar(); window.clearTimeout(estado.current.intencion) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tocaAbanico = modo === 'abanico'
  return (
    <div
      ref={raiz} id="pl-temas" className="pl-tm" role="dialog" aria-modal="true" aria-labelledby="pl-tm-t" tabIndex={-1} lang={locale}
      data-modo={modo} data-eligiendo={elegido ? '' : undefined}
      style={{ '--a': activo, '--n': n } as CSSProperties}
    >
      <div className="pl-tm-cab">
        <p className="pl-mono pl-kicker pl-tm-k">{t.kicker(n)}</p>
        <button type="button" className="pl-pil pl-tm-x" onClick={salir}>
          <Rod>{t.cerrar}</Rod><span className="pl-puntos" aria-hidden="true"><i /><i /></span>
        </button>
      </div>

      <div className="pl-tm-intro">
        <h2 id="pl-tm-t" className="pl-tm-t"><span className="pl-tm-mask"><span className="pl-tm-t-in">{t.titulo}</span></span></h2>
        <p className="pl-tm-lead">{t.lead}</p>
      </div>

      <div className="pl-tm-vista" ref={vista}>
        <div className="pl-tm-rollo">
          <span className="pl-tm-perf pl-tm-perf--s" aria-hidden="true"><i /></span>
          <ul className="pl-tm-tira" ref={lista} role="list" aria-label={t.lista}>
            {temas.map((x, i) => {
              const esActual = x.id === actual
              return (
                <li key={x.id} className="pl-set" style={{ '--i': i } as CSSProperties} data-activo={i === activo} data-actual={esActual} data-eleg={elegido === x.id}>
                  <span className="pl-set-luz" aria-hidden="true">
                    <svg className="pl-set-lampara" viewBox="0 0 64 28" width="78" height="34" focusable="false">
                      <path d="M9 23C9 10 18 4 32 4s23 6 23 19z" fill="#16181d" stroke="rgb(237 238 240 / 0.38)" strokeWidth="1" />
                      <rect x="6" y="22" width="52" height="3.2" rx="1.6" fill="#8d9097" />
                      <ellipse cx="32" cy="25.4" rx="17" ry="2.4" fill="#f2b04e" />
                    </svg>
                    <span className="pl-set-cono" />
                  </span>
                  <a
                    className="pl-set-a" href={x.href} data-tema={x.id}
                    aria-current={esActual ? 'true' : undefined} aria-label={x.nombre} aria-describedby={esActual ? `pl-set-lema-${x.id} pl-set-rodaje-${x.id}` : `pl-set-lema-${x.id}`}
                    // Un instante de intención (40 ms): al cruzar los cantos de camino a otro fotograma, la tira no se agita.
                    onPointerEnter={(e) => { if (tocaAbanico && e.pointerType !== 'touch') { window.clearTimeout(estado.current.intencion); estado.current.intencion = window.setTimeout(() => setActivo(i), 40) } }}
                    onPointerLeave={() => window.clearTimeout(estado.current.intencion)}
                    onPointerDown={(e) => { if (e.pointerType === 'touch') estado.current.toqueEn = activo }}
                    onFocus={() => setActivo(i)}
                    onClick={(e) => {
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en pestaña nueva sigue funcionando
                      e.preventDefault()
                      // Pantalla táctil con abanico (portátil híbrido): el primer toque abre el fotograma, el segundo entra.
                      if (tocaAbanico && (e.nativeEvent as PointerEvent).pointerType === 'touch' && estado.current.toqueEn !== i) { setActivo(i); estado.current.toqueEn = -1; return }
                      elegir(i)
                    }}
                  >
                    <span className="pl-set-in">
                      <span className="pl-set-cuadro">
                        <picture>
                          <source media="(max-width: 767px)" srcSet={x.previewMovil} width={390} height={844} />
                          <img src={x.preview} alt={x.nombre} width={720} height={450} loading="lazy" decoding="async" />
                        </picture>
                        <span className="pl-set-vel" aria-hidden="true" />
                        <span className="pl-set-flash" aria-hidden="true" />
                      </span>
                      <span className="pl-set-meta">
                        <span className="pl-set-fila">
                          <span className="pl-mono pl-set-toma">{t.toma(i + 1, n)}</span>
                          {esActual
                            ? <span id={`pl-set-rodaje-${x.id}`} className="pl-mono pl-set-rodaje"><i aria-hidden="true" />{t.enRodaje}</span>
                            : <span className="pl-mono pl-set-entrar">{t.entrar}<Flecha /></span>}
                        </span>
                        <span className="pl-set-nombre">{x.nombre}</span>
                        <span id={`pl-set-lema-${x.id}`} className="pl-set-lema">{x.lema}</span>
                      </span>
                      <span className="pl-set-borde" aria-hidden="true">
                        <span className="pl-mono pl-set-n">{dos(i + 1)}</span>
                        {esActual && <span className="pl-mono pl-set-canto"><i />{t.enRodaje}</span>}
                        <span className="pl-set-rot">{x.nombre}</span>
                      </span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
          <span className="pl-tm-perf pl-tm-perf--i" aria-hidden="true"><i /></span>
        </div>
      </div>

      <p className="pl-mono pl-tm-ayuda">{tocaAbanico ? t.ayudaTeclado : t.ayudaTactil}</p>
    </div>
  )
}
